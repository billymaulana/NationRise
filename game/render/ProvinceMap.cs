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
    [Export] public Color HighlightColour { get; set; } = new(0.90f, 0.36f, 0.24f);

    private readonly List<int> _triangleProvince = [];
    private MeshInstance3D? _surface;

    public int ProvinceCount { get; private set; }

    public void ApplyOwners(ushort[] owner, int highlightNation)
    {
        if (_surface?.Mesh is not ArrayMesh mesh || _triangleProvince.Count == 0)
        {
            return;
        }

        var colours = new Color[_triangleProvince.Count * 3];
        for (int t = 0; t < _triangleProvince.Count; t++)
        {
            int province = _triangleProvince[t];
            int nation = province < owner.Length ? owner[province] : 0xffff;
            Color colour = nation == highlightNation ? HighlightColour : ColourFor(nation);

            colours[t * 3] = colour;
            colours[t * 3 + 1] = colour;
            colours[t * 3 + 2] = colour;
        }

        var arrays = mesh.SurfaceGetArrays(0);
        arrays[(int)Mesh.ArrayType.Color] = colours;

        mesh.ClearSurfaces();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, arrays);
    }

    /* Golden-ratio hue stepping keeps neighbouring nation indices visually far
       apart without storing a palette for 247 nations. */
    private static Color ColourFor(int nation)
    {
        if (nation == 0xffff)
        {
            return new Color(0.18f, 0.20f, 0.22f);
        }

        float hue = (nation * 0.618033988f) % 1f;
        return Color.FromHsv(hue, 0.42f, 0.68f);
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
        Color colour = LandColour;

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
