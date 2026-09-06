using Godot;
using NationRise.Core.World;

namespace NationRise.Game.Ui;

/*
   Right-click a province and this says what is there, in the same fielded
   language as the rest of the interface. Nothing here reaches into the province
   arrays: everything arrives through the host, so the panel cannot accidentally
   become a second source of truth.
*/
public sealed partial class ProvincePanel : PanelContainer
{
    private const int Width = 300;
    private const int Margin = 14;
    private const int FieldHeight = 21;

    private static readonly Color Panel = new(0.129f, 0.161f, 0.196f, 0.96f);
    private static readonly Color Rule = new(0.30f, 0.34f, 0.38f, 0.55f);
    private static readonly Color Inset = new(0.078f, 0.098f, 0.122f, 0.92f);
    private static readonly Color Label = new(0.62f, 0.66f, 0.70f);
    private static readonly Color Value = new(0.94f, 0.95f, 0.96f);
    private static readonly Color Accent = new(1.00f, 0.72f, 0.34f);
    private static readonly Color Warning = new(0.90f, 0.45f, 0.38f);

    private Bridge.SimulationHost? _host;
    private Render.ProvincePicker? _picker;
    private bool _connected;

    private int _province = -1;
    private string _name = string.Empty;
    private ProvinceSummary _summary;

    public override void _Ready()
    {
        var background = new StyleBoxFlat
        {
            BgColor = Panel,
            BorderColor = new Color(0.36f, 0.40f, 0.44f, 0.85f),
        };
        background.SetBorderWidthAll(1);
        AddThemeStyleboxOverride("panel", background);

        SetAnchorsPreset(LayoutPreset.TopLeft);
        CustomMinimumSize = new Vector2(Width, 196);
        MouseFilter = MouseFilterEnum.Ignore;
        Visible = false;
    }

    public override void _Process(double delta)
    {
        Position = new Vector2(GetViewportRect().Size.X - Width - 24f, 68f);

        if (_connected)
        {
            QueueRedraw();
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
        if (_host is null)
        {
            return;
        }

        try
        {
            _summary = _host.Describe(province);
        }
        catch (InvalidOperationException)
        {
            /* Names are attached a frame after the map builds; a click that
               early simply finds nothing to show. */
            return;
        }

        _province = province;
        _name = _host.NameOfProvince(province);
        Visible = true;
        QueueRedraw();
    }

    public override void _Draw()
    {
        if (_host is null || _province < 0)
        {
            return;
        }

        DrawText(_name.Length > 0 ? _name : $"Province {_province}", Margin, 26f, 16, Value, UiAssets.Bold);

        string holder = _summary.IsOccupied
            ? $"{_summary.ControllerName}, taken from {_summary.OwnerName}"
            : _summary.ControllerName;

        DrawText(holder.ToUpperInvariant(), Margin, 43f, 10, _summary.IsOccupied ? Warning : Label);
        DrawLine(new Vector2(Margin, 52f), new Vector2(Width - Margin, 52f), Rule, 1f);

        float y = 62f;
        float half = (Width - Margin * 2f - 8f) / 2f;

        Field(Margin, y, half, "TERRAIN", _summary.Terrain.ToString(), Value);
        Field(Margin + half + 8f, y, half, "MORALE", $"{_summary.Morale:P0}",
            _summary.Morale < 0.40f ? Warning : Value);
        y += FieldHeight + 6f;

        if (_summary.IsCity)
        {
            Field(Margin, y, half, "POPULATION", $"{_summary.Population:0}", Accent);
            Field(Margin + half + 8f, y, half, "PRODUCES", _summary.Resource.ToString(), Accent);
            y += FieldHeight + 6f;
        }

        bool blockaded = _host.IsBlockaded(_province);
        Field(Margin, y, half, "SUPPLY", _host.SupplyAt(_province).ToString(),
            _host.SupplyAt(_province) == NationRise.Core.Military.SupplyStatus.Supplied ? Value : Warning);
        Field(Margin + half + 8f, y, half, "SEA", blockaded ? "Blockaded" : "Open",
            blockaded ? Warning : Value);
        y += FieldHeight + 6f;

        Field(Margin, y, half, "LAND LINKS", _summary.LandNeighbours.ToString(), Value);
        Field(Margin + half + 8f, y, half, "SEA LINKS", _summary.SeaNeighbours.ToString(), Value);
        y += FieldHeight + 10f;

        if (_summary.IsContested)
        {
            DrawText("CONTESTED GROUND", Margin, y, 11, Warning, UiAssets.SemiBold);
            y += 14f;
        }

        if (Size.Y < y)
        {
            CustomMinimumSize = new Vector2(Width, y + 8f);
        }
    }

    private void Field(float x, float y, float width, string label, string value, Color tone)
    {
        var box = new Rect2(x, y, width, FieldHeight);
        DrawRect(box, Inset);
        DrawRect(box, Rule, filled: false, width: 1f);

        DrawText(label, x + 7f, y + FieldHeight - 6f, 9, Label);

        Font font = UiAssets.SemiBold ?? ThemeDB.FallbackFont;
        float measured = font.GetStringSize(value, HorizontalAlignment.Left, -1, 12).X;
        DrawText(value, x + width - measured - 7f, y + FieldHeight - 6f, 12, tone, UiAssets.SemiBold);
    }

    private void DrawText(string text, float x, float y, int size, Color colour, Font? font = null) =>
        DrawString(font ?? UiAssets.Regular ?? ThemeDB.FallbackFont,
            new Vector2(x, y), text, HorizontalAlignment.Left, -1, size, colour);
}
