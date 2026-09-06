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
    private const float SettlementHeight = 0.012f;

    [Export] public float SeaDepth { get; set; } = -0.05f;

    /* Below this the camera is close enough that street sketches and ridge
       marks read as terrain; above it they collapse into scratches. */
    [Export] public float DetailZoom { get; set; } = 5.0f;

    private readonly List<int> _triangleProvince = [];
    private readonly List<float> _vertexLatitude = [];

    private MeshInstance3D? _surface;
    private MeshInstance3D? _hatch;
    private MeshInstance3D? _frontier;

    private Vector3[] _vertices = [];
    private SharedEdge[] _sharedEdges = [];
    private int _ownershipStamp = -1;
    private bool _settlementsBuilt;
    private MeshInstance3D? _roads;
    private MeshInstance3D? _ridges;
    private MapCamera? _camera;

    public int ProvinceCount { get; private set; }

    private Vector3[] _centres = [];
    private float[] _radius = [];

    public Vector3[] ProvinceCentres => _centres;

    /* How far each province reaches from its centre, in map units. The minimap
       stamps provinces as discs and needs a size for each one. */
    public float[] ProvinceRadii => _radius;

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

        if (!_settlementsBuilt)
        {
            _settlementsBuilt = true;
            BuildSettlements(isCity, terrain);
        }
    }

    /*
       Cities are drawn as a sketch of their road network and mountains as a
       scatter of ridge marks, the way the reference maps do it. Both are pure
       decoration, but they are the difference between ground that looks
       inhabited and a polygon that happens to be labelled: at strategy zoom
       nobody reads a city from its fill colour.

       Built once, from the first ownership pass, because neither depends on who
       holds the ground.
    */
    private void BuildSettlements(bool[] isCity, byte[] terrain)
    {
        var roads = new List<Vector3>();
        var ridges = new List<Vector3>();

        for (int province = 0; province < _centres.Length; province++)
        {
            Vector3 centre = _centres[province];
            if (centre == Vector3.Zero)
            {
                continue;
            }

            float reach = province < _radius.Length ? _radius[province] : 0f;
            if (reach <= 0f)
            {
                continue;
            }

            if (province < isCity.Length && isCity[province])
            {
                AppendRoadWeb(roads, centre, province, reach);
                continue;
            }

            var kind = (NationRise.Core.World.Terrain)(province < terrain.Length ? terrain[province] : 0);
            if (kind is NationRise.Core.World.Terrain.Mountains or NationRise.Core.World.Terrain.Hills)
            {
                AppendRidgeMarks(ridges, centre, province, reach, kind == NationRise.Core.World.Terrain.Mountains);
            }
        }

        _roads = AddLines(roads, MapPalette.RoadSketch, SettlementHeight);
        _ridges = AddLines(ridges, MapPalette.RidgeMark, SettlementHeight);

        GD.Print($"Settlement sketch: {roads.Count / 2} road segments, {ridges.Count / 2} ridge marks.");
    }

    /* Spokes leaving the centre with a kink partway out, plus a broken ring.
       Roads radiate and orbit; that pair of gestures is enough for the eye to
       read "town" without any of it being real geography. */
    private static void AppendRoadWeb(List<Vector3> lines, Vector3 centre, int seed, float extent)
    {
        const int Spokes = 7;
        float reach = extent * (0.42f + Jitter(seed, 1) * 0.22f);

        for (int i = 0; i < Spokes; i++)
        {
            float angle = Mathf.Tau * i / Spokes + Jitter(seed, i + 2) * 0.5f;
            float length = reach * (0.55f + Jitter(seed, i + 20) * 0.9f);

            Vector3 mid = centre + Radial(angle, length * 0.5f);
            Vector3 end = mid + Radial(angle + (Jitter(seed, i + 40) - 0.5f) * 0.7f, length * 0.5f);

            lines.Add(centre);
            lines.Add(mid);
            lines.Add(mid);
            lines.Add(end);
        }

        int arcStart = (int)(Jitter(seed, 60) * 8f);
        for (int i = arcStart; i < arcStart + 5; i++)
        {
            float from = Mathf.Tau * i / 9f;
            float to = Mathf.Tau * (i + 1) / 9f;
            float radius = reach * 0.45f;

            lines.Add(centre + Radial(from, radius));
            lines.Add(centre + Radial(to, radius));
        }
    }

    /* Chevrons, not filled triangles: an outline survives being drawn over
       whatever colour the province happens to be. */
    private static void AppendRidgeMarks(List<Vector3> lines, Vector3 centre, int seed, float extent, bool tall)
    {
        int count = tall ? 5 : 3;
        float size = extent * (tall ? 0.19f : 0.13f);

        for (int i = 0; i < count; i++)
        {
            float offsetAngle = Mathf.Tau * Jitter(seed, i + 3);
            float offsetLength = Jitter(seed, i + 11) * extent * 0.55f;
            Vector3 at = centre + Radial(offsetAngle, offsetLength);

            Vector3 left = at + new Vector3(-size, 0f, size * 0.7f);
            Vector3 peak = at + new Vector3(0f, 0f, -size * 0.8f);
            Vector3 right = at + new Vector3(size, 0f, size * 0.7f);

            lines.Add(left);
            lines.Add(peak);
            lines.Add(peak);
            lines.Add(right);
        }
    }

    private static Vector3 Radial(float angle, float length) =>
        new(Mathf.Cos(angle) * length, 0f, Mathf.Sin(angle) * length);

    /* Stable per-province variation. Deriving it from the id rather than a
       random source keeps a town's streets in the same place across a save and
       reload, which a player would otherwise notice immediately. */
    private static float Jitter(int seed, int salt)
    {
        uint h = (uint)(seed * 73856093) ^ (uint)(salt * 19349663);
        h ^= h >> 13;
        h *= 0x85ebca6bu;
        h ^= h >> 16;
        return (h % 10000) / 10000f;
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
        _radius = BuildRadii(features, provinces, _centres);
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

    /*
       Ground colour is flat per province, so without something breaking it up
       the map reads as a chart of polygons rather than as land. Two octaves of
       value noise in world space cross province edges, which is the point: the
       grain belongs to the ground, not to the administrative unit sitting on
       it, and that is what hides the facets.
    */
    private static ShaderMaterial GroundMaterial()
    {
        var shader = new Shader
        {
            Code = @"
            shader_type spatial;
            render_mode unshaded, cull_disabled;

            uniform float grain = 0.18;

            varying vec3 ground;

            void vertex() {
                ground = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
            }

            /* Deliberately not the fract(sin(dot(...))) hash every shader
               snippet uses: that one relies on sin losing precision, and
               Metal computes it accurately enough that the result collapses
               to a constant and the grain silently disappears. */
            float hash(vec2 p) {
                vec3 q = fract(vec3(p.xyx) * 0.1031);
                q += dot(q, q.yzx + 33.33);
                return fract((q.x + q.y) * q.z);
            }

            float value_noise(vec2 p) {
                vec2 cell = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);

                float a = hash(cell);
                float b = hash(cell + vec2(1.0, 0.0));
                float c = hash(cell + vec2(0.0, 1.0));
                float d = hash(cell + vec2(1.0, 1.0));

                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            void fragment() {
                vec2 p = ground.xz;
                float region = value_noise(p * 0.85);
                float coarse = value_noise(p * 3.7);
                float fine = value_noise(p * 13.3);

                /* The low octave is the one that matters: it is wider than a
                   province, so it carries a wash of shade straight across the
                   borders and breaks the faceted look at a glance. */
                float mixture = region * 0.5 + coarse * 0.32 + fine * 0.18;

                /* Averaging octaves narrows the spread towards the mean, so the
                   raw mixture only ever strays about 0.15 from centre and the
                   strength below would mean almost nothing. Stretching it back
                   out first is what makes `grain` the figure it claims to be. */
                mixture = clamp((mixture - 0.5) * 2.4 + 0.5, 0.0, 1.0);

                float shade = 1.0 + (mixture - 0.5) * 2.0 * grain;
                ALBEDO = COLOR.rgb * shade;
            }
            ",
        };

        return new ShaderMaterial { Shader = shader };
    }

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

            uniform float period = 0.070;
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

        /* Three bands standing in for bathymetry. Real depth data would mean
           another dataset and another million points; two soft rings around
           every landmass buy the same read, which is that the sea has a shelf
           and the shelf is where the ports are. */
        AddRibbon(coast, MapPalette.OpenShelf, 0.110f, CoastHazeHeight - 0.003f, "shelf", joints: true);
        AddRibbon(coast, MapPalette.CoastalHaze, 0.040f, CoastHazeHeight, "shallows", joints: true);
        AddRibbon(coast, MapPalette.Coastline, 0.008f, CoastHeight, "foam");

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

        AddRibbonTo(_frontier, neutral, MapPalette.NationBorder, 0.034f, FrontierHeight, joints: true);
        AddRibbonTo(_frontier, mine, MapPalette.PlayerBorder, 0.050f, FrontierHeight + 0.002f, joints: true);
    }

    /*
       Street sketches and ridge marks only exist at the zoom a player reads
       terrain at. Left on at world zoom they collapse into a field of scratches,
       which is worse than a plain fill.
    */
    public override void _Process(double delta)
    {
        _camera ??= GetNodeOrNull<MapCamera>("/root/Main/Camera");
        if (_camera is null || _roads is null)
        {
            return;
        }

        bool close = _camera.Size < DetailZoom;
        _roads.Visible = close;

        if (_ridges is not null)
        {
            _ridges.Visible = close;
        }
    }

    private MeshInstance3D? AddLines(List<Vector3> points, Color colour, float height)
    {
        if (points.Count == 0)
        {
            return null;
        }

        var arrays = new Godot.Collections.Array();
        arrays.Resize((int)Mesh.ArrayType.Max);
        arrays[(int)Mesh.ArrayType.Vertex] = points.ToArray();

        var mesh = new ArrayMesh();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Lines, arrays);

        var instance = new MeshInstance3D
        {
            Mesh = mesh,
            Position = new Vector3(0f, height, 0f),
            MaterialOverride = new StandardMaterial3D
            {
                AlbedoColor = colour,
                ShadingMode = BaseMaterial3D.ShadingModeEnum.Unshaded,
                Transparency = BaseMaterial3D.TransparencyEnum.Alpha,
            },
        };

        AddChild(instance);
        return instance;
    }

    private void AddRibbon(
        List<Vector3> segments,
        Color colour,
        float width,
        float height,
        string name,
        bool joints = false)
    {
        var holder = new MeshInstance3D { Name = name };
        AddChild(holder);
        AddRibbonTo(holder, segments, colour, width, height, joints);
    }

    /*
       Line primitives are one pixel wide however far the camera is, so a heavy
       coast has to be real geometry. Each segment becomes a quad extruded
       sideways in the map plane, which is flat, so no billboarding is needed.
    */
    private static void AppendJoint(List<Vector3> vertices, Vector3 at, float half)
    {
        Vector3 x = new(half, 0f, 0f);
        Vector3 z = new(0f, 0f, half);

        vertices.Add(at - x - z);
        vertices.Add(at + x - z);
        vertices.Add(at + x + z);
        vertices.Add(at - x - z);
        vertices.Add(at + x + z);
        vertices.Add(at - x + z);
    }

    private static void AddRibbonTo(
        MeshInstance3D holder,
        List<Vector3> segments,
        Color colour,
        float width,
        float height,
        bool joints = false)
    {
        if (segments.Count < 2)
        {
            return;
        }

        var vertices = new List<Vector3>(segments.Count * 3);
        float half = width * 0.5f;

        /* A segment much shorter than the band is wide extrudes into a spike:
           its direction is dominated by rounding, and the quad ends up pointing
           anywhere. Wide bands therefore skip the shortest segments, which a
           soft halo can afford and a crisp outline cannot. */
        float minimum = width * 0.30f;
        float minimumSquared = minimum * minimum;

        for (int i = 0; i + 1 < segments.Count; i += 2)
        {
            Vector3 a = segments[i];
            Vector3 b = segments[i + 1];
            Vector3 along = b - a;

            if (along.LengthSquared() < minimumSquared)
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

            /* A square cap at each end stands in for a round join. Without it
               every change of direction leaves a notch, and a wide band around
               a coastline is nothing but changes of direction. */
            if (joints)
            {
                AppendJoint(vertices, a, half);
                AppendJoint(vertices, b, half);
            }
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

    /* How far a province reaches from its own centre, used to size the sketch
       drawn inside it. A fixed size would give a Siberian oblast the same town
       as Singapore. */
    private static float[] BuildRadii(JsonElement features, int provinceCount, Vector3[] centres)
    {
        var radii = new float[provinceCount];

        foreach (JsonElement feature in features.EnumerateArray())
        {
            int id = feature.GetProperty("properties").GetProperty("id").GetInt32();

            foreach (Ring ring in Rings(feature.GetProperty("geometry")))
            {
                foreach (Vector2 p in ring.Outer)
                {
                    var at = new Vector3(p.X * DegreesToUnits, 0f, -p.Y * DegreesToUnits);
                    radii[id] = MathF.Max(radii[id], at.DistanceTo(centres[id]));
                }
            }
        }

        return radii;
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
