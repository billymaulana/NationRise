using Godot;
using NationRise.Core.World;

namespace NationRise.Game.Ui;

/* Right-click a province and this says what is there. Nothing here reaches
   into the province arrays: everything arrives through ProvinceQuery, so the
   panel cannot accidentally become a second source of truth. */
public sealed partial class ProvincePanel : PanelContainer
{
    private Label? _label;
    private Bridge.SimulationHost? _host;
    private Render.ProvincePicker? _picker;
    private bool _connected;

    public override void _Ready()
    {
        _label = new Label { Text = string.Empty };
        _label.AddThemeFontSizeOverride("font_size", 15);

        /* PanelContainer ships with a transparent style in a bare project, so
           the panel would draw nothing at all without one of its own. */
        var background = new StyleBoxFlat
        {
            BgColor = new Color(0.07f, 0.09f, 0.12f, 0.92f),
            BorderColor = new Color(0.45f, 0.42f, 0.36f, 0.8f),
        };
        background.SetBorderWidthAll(1);
        background.SetCornerRadiusAll(3);
        AddThemeStyleboxOverride("panel", background);

        var margin = new MarginContainer();
        margin.AddThemeConstantOverride("margin_left", 12);
        margin.AddThemeConstantOverride("margin_right", 12);
        margin.AddThemeConstantOverride("margin_top", 8);
        margin.AddThemeConstantOverride("margin_bottom", 8);
        margin.AddChild(_label);
        AddChild(margin);

        /* Absolute placement rather than a right anchor: a PanelContainer sizes
           itself to its text, so anchoring its left edge to the right of the
           screen pushes it off-screen entirely. */
        /* Offsets rather than Position: a Control inside a CanvasLayer keeps
           its anchor offsets, and assigning Position alone gets overwritten
           the first time the layout is recalculated. */
        SetAnchorsPreset(LayoutPreset.TopLeft, keepOffsets: false);
        OffsetLeft = 980;
        OffsetTop = 40;
        CustomMinimumSize = new Vector2(300, 0);
        Visible = false;
    }

    public override void _Process(double delta)
    {
        if (_connected)
        {
            return;
        }

        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        _picker ??= GetNodeOrNull<Render.ProvincePicker>("/root/Main/ProvincePicker");

        if (_host is null || _picker is null)
        {
            return;
        }

        _picker.ProvincePicked += Show;
        _connected = true;
    }

    public void Show(int province)
    {
        /* Resolved here as well as in _Process: a right-click can arrive on the
           same frame the panel is created, before _Process has ever run. */
        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");

        if (_host is null || _label is null)
        {
            GD.Print($"ProvincePanel: host={_host is not null}, label={_label is not null}");
            return;
        }

        ProvinceSummary summary;
        try
        {
            summary = _host.Describe(province);
        }
        catch (InvalidOperationException error)
        {
            GD.Print($"ProvincePanel: {error.Message}");
            /* Names are attached a frame after the map builds; a click that
               early simply finds nothing to show. */
            return;
        }

        string name = _host.NameOfProvince(province);

        _label.Text =
            $"{(name.Length > 0 ? name : $"Province {province}")}\n" +
            $"{summary.ControllerName}{(summary.IsOccupied ? $" (occupied from {summary.OwnerName})" : string.Empty)}\n" +
            $"{summary.Terrain}{(summary.IsCity ? $"  ·  city, population {summary.Population:0}" : string.Empty)}\n" +
            $"Morale {summary.Morale:P0}\n" +
            $"{(summary.IsCity ? $"Produces {summary.Resource}\n" : string.Empty)}" +
            $"{(summary.IsContested ? "Contested ground\n" : string.Empty)}" +
            $"Supply: {_host.SupplyAt(province)}{(_host.IsBlockaded(province) ? "  ·  BLOCKADED" : string.Empty)}\n" +
            $"Neighbours: {summary.LandNeighbours} land, {summary.SeaNeighbours} sea";

        Visible = true;
    }
}
