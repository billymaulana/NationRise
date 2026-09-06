using Godot;
using System.Text.Json;

namespace NationRise.Game.Render;

/*
   City names drawn on the map itself, the way Conflict of Nations writes
   "Hamburg(7)" on the ground. This is what turns a political diagram into
   somewhere the player can navigate from memory.

   Labels are created once and shown by zoom rather than rebuilt: text nodes
   are expensive to make and cheap to hide.
*/
public sealed partial class CityLabels : Node3D
{
    private const string GeometryPath = "res://data/provinces.geojson";
    private const float DegreesToUnits = 0.1f;

    [Export] public float ShowAllBelowZoom { get; set; } = 8.0f;
    [Export] public int LabelSize { get; set; } = 32;

    private const float ReferenceZoom = 8f;
    private const float BasePixelSize = 0.0042f;

    private readonly List<Placed> _labels = [];
    private MapCamera? _camera;
    private float _lastZoom = -1f;

    private sealed record Placed(Label3D Node, int Population, bool IsPlayer, Vector3 At, float Width);

    public override void _Ready()
    {
        using var file = Godot.FileAccess.Open(GeometryPath, Godot.FileAccess.ModeFlags.Read);
        if (file is null)
        {
            return;
        }

        var host = GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        if (host is null)
        {
            return;
        }

        var document = JsonDocument.Parse(file.GetAsText());
        Build(document.RootElement.GetProperty("features"), host);

        GD.Print($"City labels: {_labels.Count}.");
    }

    private void Build(JsonElement features, Bridge.SimulationHost host)
    {
        var world = host.World;
        int player = world.Nations.IndexOf("IDN");

        foreach (JsonElement feature in features.EnumerateArray())
        {
            JsonElement properties = feature.GetProperty("properties");
            int id = properties.GetProperty("id").GetInt32();

            if (id >= world.Provinces.Count || !world.Provinces.IsCity[id])
            {
                continue;
            }

            string name = properties.GetProperty("name").GetString() ?? string.Empty;
            if (name.Length == 0)
            {
                continue;
            }

            int population = (int)world.Provinces.Population[id];
            bool isPlayer = world.Provinces.Owner[id] == player;
            Vector2 centre = Centroid(feature.GetProperty("geometry"));

            var label = new Label3D
            {
                Text = $"{name} ({population})",
                FontSize = LabelSize,
                Modulate = isPlayer
                    ? new Color(1.00f, 0.90f, 0.78f)
                    : new Color(0.88f, 0.89f, 0.87f),
                OutlineSize = 12,
                OutlineModulate = new Color(0.04f, 0.06f, 0.09f, 0.9f),
                Billboard = BaseMaterial3D.BillboardModeEnum.Disabled,
                NoDepthTest = true,
                Position = new Vector3(centre.X * DegreesToUnits, 0.06f, -centre.Y * DegreesToUnits),
                RotationDegrees = new Vector3(-90f, 0f, 0f),
                PixelSize = BasePixelSize,
            };

            AddChild(label);

            /* Half-width in world units at PixelSize 1: the glyph advance of
               this font averages close to half its size, which is near enough
               to keep names from colliding. */
            float halfWidth = label.Text.Length * LabelSize * 0.25f * BasePixelSize;
            _labels.Add(new Placed(label, population, isPlayer, label.Position, halfWidth));
        }
    }

    private static Vector2 Centroid(JsonElement geometry)
    {
        float x = 0f;
        float y = 0f;
        int count = 0;

        void Walk(JsonElement node, int depth)
        {
            if (depth == 0)
            {
                x += (float)node[0].GetDouble();
                y += (float)node[1].GetDouble();
                count++;
                return;
            }

            foreach (JsonElement child in node.EnumerateArray())
            {
                Walk(child, depth - 1);
            }
        }

        string type = geometry.GetProperty("type").GetString() ?? string.Empty;
        Walk(geometry.GetProperty("coordinates"), type == "Polygon" ? 2 : 3);

        return count > 0 ? new Vector2(x / count, y / count) : Vector2.Zero;
    }

    public override void _Process(double delta)
    {
        _camera ??= GetNodeOrNull<MapCamera>("/root/Main/Camera");
        if (_camera is null)
        {
            return;
        }

        float zoom = _camera.Size;

        /* Placement is only redone when the view has actually changed size.
           Sorting and testing five hundred names every frame would cost more
           than the whole map does. */
        if (Mathf.Abs(zoom - _lastZoom) < 0.01f)
        {
            return;
        }

        _lastZoom = zoom;
        Relayout(zoom);
    }

    /*
       Names are placed by importance, and one that would land on top of a name
       already placed is dropped rather than drawn. Four cities of Java printed
       over each other is worse than three of them printed clearly, which is
       what the map did before.
    */
    private void Relayout(float zoom)
    {
        int minimumOwn = zoom < 20f ? 0 : 5;
        int minimumOther = zoom switch
        {
            < 5f => 4,
            < 12f => 6,
            _ => 7,
        };

        /* Label3D sizes its text in world units, so a name drawn at a fixed
           PixelSize grows with the terrain as the camera comes in and a city
           name ends up wider than the island it sits on. Scaling the other way
           holds it at a constant size on screen, which is what an atlas does
           and what the reference maps do. */
        float scale = zoom / ReferenceZoom;

        foreach (Placed label in _labels)
        {
            label.Node.PixelSize = BasePixelSize * scale;
        }
        var taken = new List<(Vector3 At, float HalfWidth)>(_labels.Count);

        foreach (Placed label in Ordered())
        {
            bool eligible = label.Population >= (label.IsPlayer ? minimumOwn : minimumOther);

            if (!eligible)
            {
                label.Node.Visible = false;
                continue;
            }

            float half = label.Width * scale;
            float height = LabelSize * 0.5f * BasePixelSize * scale;

            bool clear = true;
            foreach ((Vector3 at, float otherHalf) in taken)
            {
                if (Mathf.Abs(label.At.X - at.X) < half + otherHalf
                    && Mathf.Abs(label.At.Z - at.Z) < height * 1.6f)
                {
                    clear = false;
                    break;
                }
            }

            label.Node.Visible = clear;
            if (clear)
            {
                taken.Add((label.At, half));
            }
        }
    }

    /* The player's own cities win every contest for space, then the largest.
       A map that drops Jakarta to make room for a foreign town of the same
       size is answering the wrong question. */
    private IEnumerable<Placed> Ordered() =>
        _labels.OrderByDescending(l => l.IsPlayer).ThenByDescending(l => l.Population);
}
