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

    private readonly List<(Label3D Node, int Population, bool IsPlayer)> _labels = [];
    private MapCamera? _camera;

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
                PixelSize = 0.0042f,
            };

            AddChild(label);
            _labels.Add((label, population, isPlayer));
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

        /* A world-wide view cannot show five hundred names without becoming
           unreadable, so the threshold rises as the player zooms out and only
           the largest cities survive. */
        /* The player's own cities are always worth naming; everyone else's
           compete for space, and at world zoom only the largest survive. A map
           crowded with names nobody needs is worse than one with none. */
        float zoom = _camera.Size;

        int minimumOwn = zoom < 20f ? 0 : 5;
        int minimumOther = zoom switch
        {
            < 5f => 4,
            < 12f => 6,
            _ => 7,
        };

        foreach ((Label3D node, int population, bool isPlayer) in _labels)
        {
            node.Visible = population >= (isPlayer ? minimumOwn : minimumOther);
        }
    }
}
