using Godot;
using System.Text.Json;

namespace NationRise.Game.Render;

/*
   Builds one mesh for the whole map and colours provinces through a per-vertex
   channel. Recolouring 2,000 provinces then costs one buffer write instead of
   2,000 draw calls, and the simulation never learns any of this happened.
*/
public sealed partial class ProvinceMap : Node3D
{
    private const string GeometryPath = "res://data/provinces.geojson";
    private const float DegreesToUnits = 0.1f;

    [Export] public float SeaDepth { get; set; } = -0.05f;

    private readonly List<int> _triangleProvince = [];
    private MeshInstance3D? _surface;

    public int ProvinceCount { get; private set; }

    private Vector3[] _centres = [];

    public Vector3[] ProvinceCentres => _centres;

    public void ApplyOwners(ushort[] owner, byte[] terrain, bool[] isCity, int highlightNation)
    {
        if (_surface?.Mesh is not ArrayMesh mesh || _triangleProvince.Count == 0)
        {
            return;
        }

        var colours = new Color[_triangleProvince.Count * 3];
        for (int t = 0; t < _triangleProvince.Count; t++)
        {
            int province = _triangleProvince[t];
            int nation = province < owner.Length ? owner[province] : -1;
            if (nation == 0xffff)
            {
                nation = -1;
            }

            Color colour = MapPalette.Tinted(
                (NationRise.Core.World.Terrain)(province < terrain.Length ? terrain[province] : 0),
                nation,
                nation == highlightNation,
                province < isCity.Length && isCity[province],
                province);

            colours[t * 3] = colour;
            colours[t * 3 + 1] = colour;
            colours[t * 3 + 2] = colour;
        }

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

        var arrays = new Godot.Collections.Array();
        arrays.Resize((int)Mesh.ArrayType.Max);
        arrays[(int)Mesh.ArrayType.Vertex] = vertices.ToArray();
        arrays[(int)Mesh.ArrayType.Color] = colours.ToArray();

        var mesh = new ArrayMesh();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, arrays);

        _surface = new MeshInstance3D
        {
            Mesh = mesh,
            MaterialOverride = new StandardMaterial3D
            {
                VertexColorUseAsAlbedo = true,
                ShadingMode = BaseMaterial3D.ShadingModeEnum.Unshaded,
                CullMode = BaseMaterial3D.CullModeEnum.Disabled,
            },
        };

        AddChild(_surface);
        BuildOcean();
        BuildBorders(features);

        GD.Print($"Map built: {provinces} provinces, {vertices.Count / 3} triangles.");
    }

    /* A plane behind everything, so land reads as land sitting in water rather
       than shapes floating on a background. */
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

    private void BuildOcean()
    {
        var ocean = new MeshInstance3D
        {
            Mesh = new PlaneMesh { Size = new Vector2(400f, 200f) },
            Position = new Vector3(0f, SeaDepth, 0f),
            MaterialOverride = new StandardMaterial3D
            {
                AlbedoColor = MapPalette.Ocean,
                ShadingMode = BaseMaterial3D.ShadingModeEnum.Unshaded,
            },
        };

        AddChild(ocean);
    }

    /* Borders as line geometry rather than a shader: at strategy-map zoom the
       player is reading political shape, and a crisp outline does more for
       that than any amount of surface detail. */
    private void BuildBorders(JsonElement features)
    {
        var province = new List<Vector3>();
        var nation = new List<Vector3>();

        /* An edge shared by two provinces of the same nation is internal; an
           edge nobody else shares is a coast or a frontier. Hashing edges
           separates the two without any geometry work. */
        var edgeOwner = new Dictionary<(long, long), string>();
        var frontier = new HashSet<(long, long)>();

        foreach (JsonElement feature in features.EnumerateArray())
        {
            string owner = feature.GetProperty("properties").GetProperty("nation").GetString() ?? string.Empty;

            foreach (Ring ring in Rings(feature.GetProperty("geometry")))
            {
                MarkEdges(ring.Outer, owner, edgeOwner, frontier);
                AppendOutline(ring.Outer, province);
                foreach (var hole in ring.Holes)
                {
                    AppendOutline(hole, province);
                }
            }
        }

        foreach ((long a, long b) in frontier)
        {
            nation.Add(Decode(a));
            nation.Add(Decode(b));
        }

        AddLines(province, MapPalette.ProvinceBorder, 0.010f);
        AddLines(nation, MapPalette.NationBorder, 0.020f);
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

    private static void MarkEdges(
        List<Vector2> ring,
        string owner,
        Dictionary<(long, long), string> edgeOwner,
        HashSet<(long, long)> frontier)
    {
        for (int i = 0; i < ring.Count; i++)
        {
            long a = Encode(ring[i]);
            long b = Encode(ring[(i + 1) % ring.Count]);
            var key = a < b ? (a, b) : (b, a);

            if (edgeOwner.TryGetValue(key, out string? other))
            {
                if (other == owner)
                {
                    frontier.Remove(key);
                }

                continue;
            }

            edgeOwner[key] = owner;
            frontier.Add(key);
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

    private static void AppendOutline(List<Vector2> ring, List<Vector3> points)
    {
        for (int i = 0; i < ring.Count; i++)
        {
            Vector2 a = ring[i];
            Vector2 b = ring[(i + 1) % ring.Count];
            points.Add(new Vector3(a.X * DegreesToUnits, 0f, -a.Y * DegreesToUnits));
            points.Add(new Vector3(b.X * DegreesToUnits, 0f, -b.Y * DegreesToUnits));
        }
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

            if (i % 3 == 0)
            {
                _triangleProvince.Add(province);
            }
        }
    }
}
