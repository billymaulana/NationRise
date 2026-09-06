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

    [Export] public Color LandColour { get; set; } = new(0.24f, 0.31f, 0.24f);
    [Export] public Color BorderColour { get; set; } = new(0.85f, 0.86f, 0.84f);

    private readonly List<int> _triangleProvince = [];
    private MeshInstance3D? _surface;

    public int ProvinceCount { get; private set; }

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

            foreach (var ring in OuterRings(feature.GetProperty("geometry")))
            {
                AppendTriangles(ring, id, vertices, colours);
            }
        }

        ProvinceCount = provinces;

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
        GD.Print($"Map built: {provinces} provinces, {vertices.Count / 3} triangles.");
    }

    private static IEnumerable<List<Vector2>> OuterRings(JsonElement geometry)
    {
        string type = geometry.GetProperty("type").GetString() ?? string.Empty;
        JsonElement coordinates = geometry.GetProperty("coordinates");

        if (type == "Polygon")
        {
            yield return ReadRing(coordinates[0]);
            yield break;
        }

        if (type == "MultiPolygon")
        {
            foreach (JsonElement polygon in coordinates.EnumerateArray())
            {
                yield return ReadRing(polygon[0]);
            }
        }
    }

    private static List<Vector2> ReadRing(JsonElement ring)
    {
        var points = new List<Vector2>();
        foreach (JsonElement point in ring.EnumerateArray())
        {
            points.Add(new Vector2((float)point[0].GetDouble(), (float)point[1].GetDouble()));
        }

        return points;
    }

    private void AppendTriangles(List<Vector2> ring, int province, List<Vector3> vertices, List<Color> colours)
    {
        if (ring.Count < 3)
        {
            return;
        }

        int[] indices = Geometry2D.TriangulatePolygon(ring.ToArray());
        Color colour = LandColour;

        for (int i = 0; i < indices.Length; i++)
        {
            Vector2 p = ring[indices[i]];
            vertices.Add(new Vector3(p.X * DegreesToUnits, 0f, -p.Y * DegreesToUnits));
            colours.Add(colour);

            if (i % 3 == 0)
            {
                _triangleProvince.Add(province);
            }
        }
    }
}
