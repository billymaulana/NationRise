using Godot;
using System.Text.Json;

namespace NationRise.Game.Render;

/*
   Country names written across their own territory, the way an atlas does it.
   This is the single cheapest thing that turns a coloured diagram into a map:
   without it the player has to click a province to learn which country they
   are looking at.

   Names appear when zoomed out and give way to city names on the way in, so
   the map never carries two competing layers of text at once.
*/
public sealed partial class NationLabels : Node3D
{
    [Export] public float HideBelowZoom { get; set; } = 6.0f;
    [Export] public int MinimumProvinces { get; set; } = 3;

    private const string NamesPath = "res://data/nations.json";

    private readonly List<(Label3D Node, int Provinces)> _labels = [];
    private Dictionary<string, string> _names = [];
    private MapCamera? _camera;
    private bool _built;

    public override void _Process(double delta)
    {
        _camera ??= GetNodeOrNull<MapCamera>("/root/Main/Camera");

        if (!_built)
        {
            Build();
            return;
        }

        if (_camera is null)
        {
            return;
        }

        float zoom = _camera.Size;
        bool wide = zoom >= HideBelowZoom;

        /* Big countries keep their name a little longer on the way in, because
           their name is still the answer to "where am I" at a zoom where a
           small country's is just clutter. */
        foreach ((Label3D node, int provinces) in _labels)
        {
            node.Visible = wide || (zoom >= HideBelowZoom * 0.55f && provinces >= 25);
        }
    }

    private void Build()
    {
        var host = GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        var map = GetNodeOrNull<ProvinceMap>("/root/Main/ProvinceMap");

        if (host is null || map is null || map.ProvinceCentres.Length == 0)
        {
            return;
        }

        _built = true;
        _names = ReadNames();

        var world = host.World;
        int player = world.Nations.IndexOf("IDN");

        var sums = new Vector3[world.Nations.Count];
        var counts = new int[world.Nations.Count];

        for (int province = 0; province < world.Provinces.Count && province < map.ProvinceCentres.Length; province++)
        {
            int nation = world.Provinces.Owner[province];
            if (nation < 0 || nation >= counts.Length)
            {
                continue;
            }

            sums[nation] += map.ProvinceCentres[province];
            counts[nation]++;
        }

        for (int nation = 0; nation < counts.Length; nation++)
        {
            if (counts[nation] < MinimumProvinces)
            {
                continue;
            }

            string tag = world.Nations.Tag[nation].Trim();
            if (tag.Length == 0)
            {
                continue;
            }

            /* The binary the simulation reads carries only the three-letter
               tag, so the English name is looked up here rather than pushed
               through a format the simulation has no use for. */
            string name = _names.GetValueOrDefault(tag, tag);

            bool isPlayer = nation == player;

            var label = new Label3D
            {
                Text = Spaced(name),
                FontSize = 34,
                Modulate = isPlayer
                    ? new Color(1.00f, 0.86f, 0.66f, 0.90f)
                    : new Color(0.90f, 0.91f, 0.89f, 0.62f),
                OutlineSize = 16,
                OutlineModulate = new Color(0.03f, 0.05f, 0.07f, 0.55f),
                Billboard = BaseMaterial3D.BillboardModeEnum.Disabled,
                NoDepthTest = true,
                Position = (sums[nation] / counts[nation]) with { Y = 0.05f },
                RotationDegrees = new Vector3(-90f, 0f, 0f),

                /* Larger countries get larger type. Scaling by the square root
                   keeps Russia from dwarfing everything else the way a linear
                   scale would. */
                PixelSize = 0.0042f * Mathf.Clamp(Mathf.Sqrt(counts[nation]) * 0.28f, 0.85f, 2.6f),
                Visible = false,
            };

            AddChild(label);
            _labels.Add((label, counts[nation]));
        }

        GD.Print($"Nation labels: {_labels.Count}.");
    }

    private static Dictionary<string, string> ReadNames()
    {
        using var file = Godot.FileAccess.Open(NamesPath, Godot.FileAccess.ModeFlags.Read);
        if (file is null)
        {
            GD.PushWarning($"Nation names missing at {NamesPath}; falling back to tags.");
            return [];
        }

        return JsonSerializer.Deserialize<Dictionary<string, string>>(file.GetAsText()) ?? [];
    }

    /* Label3D has no letter-spacing, and tracked-out capitals are most of what
       makes atlas typography read as a map rather than as a caption. Thin
       spaces between the letters are the only way to get it. */
    private static string Spaced(string name)
    {
        string upper = name.ToUpperInvariant();
        var builder = new System.Text.StringBuilder(upper.Length * 2);

        foreach (char c in upper)
        {
            builder.Append(c);
            builder.Append(' ');
        }

        return builder.ToString().TrimEnd();
    }
}
