using Godot;
using System.Text.Json;

namespace NationRise.Game.Render;

/*
   Builds one mesh for the whole map and colours provinces through a per-vertex
   channel. Recolouring 2,000 provinces then costs one buffer write instead of
   2,000 draw calls, and the simulation never learns any of this happened.

   Ownership is a separate hatched surface laid over the ground rather than a
   tint mixed into it. Keeping the two apart is what lets a desert stay sandy
   whoever holds it, and it means a change of hands rewrites one small buffer.
*/
public sealed partial class ProvinceMap : Node3D
{
    private const string GeometryPath = "res://data/provinces.geojson";
    private const float DegreesToUnits = 0.1f;

    private const float LandHeight = 0.000f;
    private const float HatchHeight = 0.006f;
    private const float ProvinceLineHeight = 0.010f;
    private const float CoastHazeHeight = -0.004f;
    private const float CoastHeight = 0.014f;
    private const float FrontierHeight = 0.018f;

    [Export] public float SeaDepth { get; set; } = -0.05f;

    private readonly List<int> _triangleProvince = [];
    private readonly List<float> _vertexLatitude = [];

    private MeshInstance3D? _surface;
    private MeshInstance3D? _hatch;
    private MeshInstance3D? _frontier;

    private Vector3[] _vertices = [];
    private SharedEdge[] _sharedEdges = [];
    private int _ownershipStamp = -1;

    public int ProvinceCount { get; private set; }

    private Vector3[] _centres = [];

    public Vector3[] ProvinceCentres => _centres;

    private readonly record struct SharedEdge(Vector3 A, Vector3 B, int First, int Second);

    public void ApplyOwners(ushort[] owner, byte[] terrain, bool[] isCity, int highlightNation)
    {
        if (_surface?.Mesh is not ArrayMesh ground || _triangleProvince.Count == 0)
        {
            return;
        }

        int vertexCount = _triangleProvince.Count * 3;
        var groundColours = new Color[vertexCount];
        var hatchColours = new Color[vertexCount];

        for (int t = 0; t < _triangleProvince.Count; t++)
        {
            int province = _triangleProvince[t];
            int nation = province < owner.Length ? owner[province] : -1;
            if (nation == 0xffff)
            {
                nation = -1;
            }

            bool player = nation >= 0 && nation == highlightNation;
            bool city = province < isCity.Length && isCity[province];

            var ground_ = (NationRise.Core.World.Terrain)(province < terrain.Length ? terrain[province] : 0);

            Color mark = nation < 0
                ? new Color(0f, 0f, 0f, 0f)
                : MapPalette.NationColour(nation, player) with { A = player ? 0.34f : 0.24f };

            for (int corner = 0; corner < 3; corner++)
            {
                int index = t * 3 + corner;
                float latitude = _vertexLatitude[index];

                Color soil = MapPalette.GroundFor(ground_, latitude);

                /* Cities read as brighter ground rather than a marker on top:
                   the reference maps all let settlement show through. */
                if (city)
                {
                    soil = soil.Lightened(0.10f);
                }

                groundColours[index] = MapPalette.ForVertex(MapPalette.WeatheredBy(soil, latitude));
                hatchColours[index] = MapPalette.ForVertex(mark);
            }
        }

        Rewrite(ground, groundColours);

        if (_hatch?.Mesh is ArrayMesh hatch)
        {
            Rewrite(hatch, hatchColours);
        }

        RebuildFrontiers(owner, highlightNation);
    }

    private static void Rewrite(ArrayMesh mesh, Color[] colours)
    {
        var arrays = mesh.SurfaceGetArrays(0);
        arrays[(int)Mesh.ArrayType.Color] = colours;

        mesh.ClearSurfaces();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, arrays);
    }

    public override void _Ready()
    {
        using var file = Godot.FileAccess.Open(GeometryPath, Godot.FileAccess.ModeFlags.Read);
        if (file is null)
        {
            GD.PushError($"Cannot open {GeometryPath}: {Godot.FileAccess.GetOpenError()}");
            return;
        }

        var document = JsonDocument.Parse(file.GetAsText());
        BuildSurface(document.RootElement.GetProperty("features"));
    }

    private void BuildSurface(JsonElement features)
    {
        var vertices = new List<Vector3>();
        var colours = new List<Color>();
        int provinces = 0;

        foreach (JsonElement feature in features.EnumerateArray())
        {
            int id = feature.GetProperty("properties").GetProperty("id").GetInt32();
            provinces = Mathf.Max(provinces, id + 1);

            foreach (Ring ring in Rings(feature.GetProperty("geometry")))
            {
                AppendTriangles(ring, id, vertices, colours);
            }
        }

        ProvinceCount = provinces;
        _centres = BuildCentres(features, provinces);
        CallDeferred(nameof(FocusCameraOnPlayer));
        CallDeferred(nameof(PublishProvinceData), features.ToString());

        if (vertices.Count == 0)
        {
            GD.PushWarning("Map geometry produced no triangles.");
            return;
        }

        _vertices = vertices.ToArray();

        BuildOcean();
        _surface = AddSurface(_vertices, colours.ToArray(), LandHeight, GroundMaterial());
        _hatch = AddSurface(_vertices, TransparentColours(_vertices.Length), HatchHeight, HatchMaterial());

        BuildBorders(features, provinces);

        GD.Print($"Map built: {provinces} provinces, {vertices.Count / 3} triangles.");
        CallDeferred(nameof(ReportTerrainMix));
    }

    private void ReportTerrainMix()
    {
        var host = GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        if (host is null)
        {
            return;
        }

        var counts = new int[13];
        byte[] terrain = host.World.Provinces.Terrain;
        foreach (byte value in terrain)
        {
            if (value < counts.Length)
            {
                counts[value]++;
            }
        }

        GD.Print("Terrain mix: " + string.Join(", ",
            counts.Select((n, i) => n > 0 ? $"{(NationRise.Core.World.Terrain)i}={n}" : null)
                  .Where(s => s is not null)));
    }

    private static Color[] TransparentColours(int count)
    {
        var colours = new Color[count];
        Array.Fill(colours, new Color(0f, 0f, 0f, 0f));
        return colours;
    }

    private MeshInstance3D AddSurface(Vector3[] vertices, Color[] colours, float height, Material material)
    {
        var arrays = new Godot.Collections.Array();
        arrays.Resize((int)Mesh.ArrayType.Max);
        arrays[(int)Mesh.ArrayType.Vertex] = vertices;
        arrays[(int)Mesh.ArrayType.Color] = colours;

        var mesh = new ArrayMesh();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, arrays);

        var instance = new MeshInstance3D
        {
            Mesh = mesh,
            Position = new Vector3(0f, height, 0f),
            MaterialOverride = material,
        };

        AddChild(instance);
        return instance;
    }

    private static StandardMaterial3D GroundMaterial() => new()
    {
        VertexColorUseAsAlbedo = true,
        ShadingMode = BaseMaterial3D.ShadingModeEnum.Unshaded,
        CullMode = BaseMaterial3D.CullModeEnum.Disabled,
    };

    /*
       Diagonal hatching instead of a flat wash. A solid tint at the strength
       needed to tell two nations apart also buries the terrain; stripes carry
       the same information in the gaps between them, which is the trick every
       reference map in this genre uses.
    */
    private static ShaderMaterial HatchMaterial()
    {
        var shader = new Shader
        {
            Code = """
            shader_type spatial;
            render_mode unshaded, cull_disabled, blend_mix, depth_draw_never;

            uniform float period = 0.105;
            uniform float duty = 0.34;

            varying vec3 ground;

            void vertex() {
                ground = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
            }

            void fragment() {
                float phase = fract((ground.x + ground.z) / period);

                /* Widened by the on-screen derivative so the stripes stay soft
                   at every zoom instead of aliasing into moire. */
                float soften = max(fwidth(phase) * 1.5, 0.02);
                float band = smoothstep(duty - soften, duty + soften, phase);

                ALBEDO = COLOR.rgb;
                ALPHA = COLOR.a * mix(1.0, 0.10, band);
            }
            """,
        };

        return new ShaderMaterial { Shader = shader };
    }

    /* The map already parsed every name and centroid while building geometry;
       handing them on saves the simulation side from parsing the file again. */
    private void PublishProvinceData(string featuresJson)
    {
        var host = GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        var picker = GetNodeOrNull<ProvincePicker>("/root/Main/ProvincePicker");

        picker?.SetCentres(_centres);

        if (host is null)
        {
            return;
        }

        var names = new string[ProvinceCount];
        Array.Fill(names, string.Empty);

        foreach (JsonElement feature in JsonDocument.Parse(featuresJson).RootElement.EnumerateArray())
        {
            JsonElement properties = feature.GetProperty("properties");
            int id = properties.GetProperty("id").GetInt32();
            if (id < names.Length)
            {
                names[id] = properties.GetProperty("name").GetString() ?? string.Empty;
            }
        }

        host.AttachProvinceNames(names);
        GD.Print($"Province names attached: {names.Count(n => n.Length > 0)} named.");
    }

    private void FocusCameraOnPlayer()
    {
        var host = GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        var camera = GetNodeOrNull<MapCamera>("/root/Main/Camera");

        if (host is null || camera is null)
        {
            return;
        }

        int nation = host.World.Nations.IndexOf("IDN");
        var sum = Vector3.Zero;
        int count = 0;

        for (int i = 0; i < host.World.Provinces.Count && i < _centres.Length; i++)
        {
            if (host.World.Provinces.Owner[i] == nation)
            {
                sum += _centres[i];
                count++;
            }
        }

        if (count > 0)
        {
            camera.FocusOn(sum / count);
        }
    }

    /*
       Open water is never one colour. Two long, shallow sine bands stand in for
       the cloud streaks and depth changes that make the reference oceans read
       as sea rather than as background.
    */
    private void BuildOcean()
    {
        var shader = new Shader
        {
            Code = """
            shader_type spatial;
            render_mode unshaded, cull_disabled;

            uniform vec3 deep : source_color;
            uniform vec3 shelf : source_color;

            varying vec3 ground;

            void vertex() {
                ground = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
            }

            void fragment() {
                float swell = sin(ground.x * 0.19 + ground.z * 0.07) * 0.5 + 0.5;
                float drift = sin(ground.x * 0.041 - ground.z * 0.033) * 0.5 + 0.5;
                float warmth = clamp(1.0 - abs(ground.z) / 9.0, 0.0, 1.0);

                float mixture = swell * 0.18 + drift * 0.34 + warmth * 0.24;
                ALBEDO = mix(deep, shelf, clamp(mixture, 0.0, 1.0));
            }
            """,
        };

        var material = new ShaderMaterial { Shader = shader };
        material.SetShaderParameter("deep", MapPalette.DeepOcean);
        material.SetShaderParameter("shelf", MapPalette.ShelfWater);

        AddChild(new MeshInstance3D
        {
            Mesh = new PlaneMesh { Size = new Vector2(400f, 200f), SubdivideWidth = 64, SubdivideDepth = 32 },
            Position = new Vector3(0f, SeaDepth, 0f),
            MaterialOverride = material,
        });
    }

    /*
       Three kinds of line, and they are not interchangeable. A coast tells the
       player where they can walk; a frontier tells them who they would be
       fighting; an internal border tells them how far one order reaches. Drawn
       at one weight they all become the same grey noise, which is what the
       first version of this map looked like.
    */
    private void BuildBorders(JsonElement features, int provinceCount)
    {
        var edges = new Dictionary<(long, long), (int First, int Second)>();

        foreach (JsonElement feature in features.EnumerateArray())
        {
            int id = feature.GetProperty("properties").GetProperty("id").GetInt32();

            foreach (Ring ring in Rings(feature.GetProperty("geometry")))
            {
                MarkEdges(ring.Outer, id, edges);
                foreach (var hole in ring.Holes)
                {
                    MarkEdges(hole, id, edges);
                }
            }
        }

        var coast = new List<Vector3>();
        var internals = new List<Vector3>();
        var shared = new List<SharedEdge>();

        foreach (((long a, long b), (int first, int second)) in edges)
        {
            Vector3 from = Decode(a);
            Vector3 to = Decode(b);

            if (second < 0)
            {
                coast.Add(from);
                coast.Add(to);
                continue;
            }

            internals.Add(from);
            internals.Add(to);
            shared.Add(new SharedEdge(from, to, first, second));
        }

        _sharedEdges = shared.ToArray();

        AddLines(internals, MapPalette.ProvinceBorder, ProvinceLineHeight);
        AddRibbon(coast, MapPalette.CoastalHaze, 0.055f, CoastHazeHeight, "coast haze");
        AddRibbon(coast, MapPalette.Coastline, 0.013f, CoastHeight, "coastline");

        GD.Print($"Borders: {coast.Count / 2} coast, {shared.Count} shared edges.");
    }

    /*
       Frontier ribbons are rebuilt when the map changes hands rather than every
       frame: conquest is rare enough that the work is invisible, and a border
       drawn from the initial owners would quietly lie for the rest of the game.
    */
    private void RebuildFrontiers(ushort[] owner, int highlightNation)
    {
        if (_sharedEdges.Length == 0)
        {
            return;
        }

        int stamp = 17;
        foreach (SharedEdge edge in _sharedEdges)
        {
            int a = edge.First < owner.Length ? owner[edge.First] : -1;
            int b = edge.Second < owner.Length ? owner[edge.Second] : -1;
            if (a != b)
            {
                stamp = stamp * 31 + edge.First * 7 + a * 13 + b;
            }
        }

        if (stamp == _ownershipStamp)
        {
            return;
        }

        _ownershipStamp = stamp;

        var neutral = new List<Vector3>();
        var mine = new List<Vector3>();

        foreach (SharedEdge edge in _sharedEdges)
        {
            int a = edge.First < owner.Length ? owner[edge.First] : -1;
            int b = edge.Second < owner.Length ? owner[edge.Second] : -1;

            if (a == b)
            {
                continue;
            }

            List<Vector3> target = a == highlightNation || b == highlightNation ? mine : neutral;
            target.Add(edge.A);
            target.Add(edge.B);
        }

        _frontier?.QueueFree();
        _frontier = new MeshInstance3D { Name = "Frontiers" };
        AddChild(_frontier);

        AddRibbonTo(_frontier, neutral, MapPalette.NationBorder, 0.020f, FrontierHeight);
        AddRibbonTo(_frontier, mine, MapPalette.PlayerBorder, 0.036f, FrontierHeight + 0.002f);
    }

    private void AddLines(List<Vector3> points, Color colour, float height)
    {
        if (points.Count == 0)
        {
            return;
        }

        var arrays = new Godot.Collections.Array();
        arrays.Resize((int)Mesh.ArrayType.Max);
        arrays[(int)Mesh.ArrayType.Vertex] = points.ToArray();

        var mesh = new ArrayMesh();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Lines, arrays);

        AddChild(new MeshInstance3D
        {
            Mesh = mesh,
            Position = new Vector3(0f, height, 0f),
            MaterialOverride = new StandardMaterial3D
            {
                AlbedoColor = colour,
                ShadingMode = BaseMaterial3D.ShadingModeEnum.Unshaded,
                Transparency = BaseMaterial3D.TransparencyEnum.Alpha,
            },
        });
    }

    private void AddRibbon(List<Vector3> segments, Color colour, float width, float height, string name)
    {
        var holder = new MeshInstance3D { Name = name };
        AddChild(holder);
        AddRibbonTo(holder, segments, colour, width, height);
    }

    /*
       Line primitives are one pixel wide however far the camera is, so a heavy
       coast has to be real geometry. Each segment becomes a quad extruded
       sideways in the map plane, which is flat, so no billboarding is needed.
    */
    private static void AddRibbonTo(
        MeshInstance3D holder,
        List<Vector3> segments,
        Color colour,
        float width,
        float height)
    {
        if (segments.Count < 2)
        {
            return;
        }

        var vertices = new List<Vector3>(segments.Count * 3);
        float half = width * 0.5f;

        for (int i = 0; i + 1 < segments.Count; i += 2)
        {
            Vector3 a = segments[i];
            Vector3 b = segments[i + 1];
            Vector3 along = b - a;

            if (along.LengthSquared() < 1e-9f)
            {
                continue;
            }

            var side = new Vector3(-along.Z, 0f, along.X).Normalized() * half;

            Vector3 a0 = a - side;
            Vector3 a1 = a + side;
            Vector3 b0 = b - side;
            Vector3 b1 = b + side;

            vertices.Add(a0);
            vertices.Add(b0);
            vertices.Add(b1);
            vertices.Add(a0);
            vertices.Add(b1);
            vertices.Add(a1);
        }

        if (vertices.Count == 0)
        {
            return;
        }

        var arrays = new Godot.Collections.Array();
        arrays.Resize((int)Mesh.ArrayType.Max);
        arrays[(int)Mesh.ArrayType.Vertex] = vertices.ToArray();

        var mesh = new ArrayMesh();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, arrays);

        holder.AddChild(new MeshInstance3D
        {
            Mesh = mesh,
            Position = new Vector3(0f, height, 0f),
            MaterialOverride = new StandardMaterial3D
            {
                AlbedoColor = colour,
                ShadingMode = BaseMaterial3D.ShadingModeEnum.Unshaded,
                CullMode = BaseMaterial3D.CullModeEnum.Disabled,
                Transparency = BaseMaterial3D.TransparencyEnum.Alpha,
            },
        });
    }

    private static void MarkEdges(
        List<Vector2> ring,
        int province,
        Dictionary<(long, long), (int First, int Second)> edges)
    {
        for (int i = 0; i < ring.Count; i++)
        {
            long a = Encode(ring[i]);
            long b = Encode(ring[(i + 1) % ring.Count]);
            var key = a < b ? (a, b) : (b, a);

            if (edges.TryGetValue(key, out (int First, int Second) existing))
            {
                if (existing.First != province && existing.Second < 0)
                {
                    edges[key] = (existing.First, province);
                }

                continue;
            }

            edges[key] = (province, -1);
        }
    }

    private static long Encode(Vector2 p) =>
        ((long)Mathf.RoundToInt(p.X * 2000f) << 32) ^ (uint)Mathf.RoundToInt(p.Y * 2000f);

    private static Vector3 Decode(long key)
    {
        float x = (int)(key >> 32) / 2000f;
        float y = (int)(uint)key / 2000f;
        return new Vector3(x * DegreesToUnits, 0f, -y * DegreesToUnits);
    }

    private static Vector3[] BuildCentres(JsonElement features, int provinceCount)
    {
        var sums = new Vector3[provinceCount];
        var counts = new int[provinceCount];

        foreach (JsonElement feature in features.EnumerateArray())
        {
            int id = feature.GetProperty("properties").GetProperty("id").GetInt32();
            foreach (Ring ring in Rings(feature.GetProperty("geometry")))
            {
                foreach (Vector2 p in ring.Outer)
                {
                    sums[id] += new Vector3(p.X * DegreesToUnits, 0f, -p.Y * DegreesToUnits);
                    counts[id]++;
                }
            }
        }

        for (int i = 0; i < provinceCount; i++)
        {
            if (counts[i] > 0)
            {
                sums[i] /= counts[i];
            }
        }

        return sums;
    }

    private static IEnumerable<Ring> Rings(JsonElement geometry)
    {
        string type = geometry.GetProperty("type").GetString() ?? string.Empty;
        JsonElement coordinates = geometry.GetProperty("coordinates");

        if (type == "Polygon")
        {
            yield return ReadPolygon(coordinates);
            yield break;
        }

        if (type == "MultiPolygon")
        {
            foreach (JsonElement polygon in coordinates.EnumerateArray())
            {
                yield return ReadPolygon(polygon);
            }
        }
    }

    /* GeoJSON puts the outline first and any holes after it. Ignoring the
       holes fills lakes with land colour, which reads as an error on a map
       where inland water is often the reason a border sits where it does. */
    private static Ring ReadPolygon(JsonElement polygon)
    {
        var outer = ReadRing(polygon[0]);
        var holes = new List<List<Vector2>>();

        for (int i = 1; i < polygon.GetArrayLength(); i++)
        {
            holes.Add(ReadRing(polygon[i]));
        }

        return new Ring(outer, holes);
    }

    private readonly record struct Ring(List<Vector2> Outer, List<List<Vector2>> Holes);

    private static List<Vector2> ReadRing(JsonElement ring)
    {
        var points = new List<Vector2>();
        foreach (JsonElement point in ring.EnumerateArray())
        {
            points.Add(new Vector2((float)point[0].GetDouble(), (float)point[1].GetDouble()));
        }

        return points;
    }

    private void AppendTriangles(Ring ring, int province, List<Vector3> vertices, List<Color> colours)
    {
        if (ring.Outer.Count < 3)
        {
            return;
        }

        Vector2[] outline = ring.Outer.ToArray();
        foreach (var hole in ring.Holes)
        {
            if (hole.Count >= 3)
            {
                outline = Geometry2D.ClipPolygons(outline, hole.ToArray()).FirstOrDefault() ?? outline;
            }
        }

        int[] indices = Geometry2D.TriangulatePolygon(outline);
        Color colour = MapPalette.BaseFor(NationRise.Core.World.Terrain.OpenGround);

        for (int i = 0; i < indices.Length; i++)
        {
            Vector2 p = outline[indices[i]];
            vertices.Add(new Vector3(p.X * DegreesToUnits, 0f, -p.Y * DegreesToUnits));
            colours.Add(colour);
            _vertexLatitude.Add(p.Y);

            if (i % 3 == 0)
            {
                _triangleProvince.Add(province);
            }
        }
    }
}
