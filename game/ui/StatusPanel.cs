using Godot;
using NationRise.Game.Render;
using GameResource = NationRise.Core.Economy.Resource;

namespace NationRise.Game.Ui;

/*
   The player's own standing, drawn rather than laid out. The reference puts the
   nation's identity at the top, the clock and the win condition in fielded
   boxes beneath it, and everything else in a quiet two-column grid.

   The device that matters is the field: a value sitting in its own inset box
   instead of at the end of a line of text. Without it a panel reads as a debug
   print however carefully the numbers are aligned, which is exactly what this
   panel was before.
*/
public sealed partial class StatusPanel : PanelContainer
{
    private const int Width = 316;
    private const int Margin = 14;
    private const int RowHeight = 26;
    private const int FieldHeight = 21;

    private static readonly Color Panel = new(0.129f, 0.161f, 0.196f, 0.96f);
    private static readonly Color Rule = new(0.30f, 0.34f, 0.38f, 0.55f);
    private static readonly Color Field = new(0.078f, 0.098f, 0.122f, 0.92f);
    private static readonly Color Label = new(0.62f, 0.66f, 0.70f);
    private static readonly Color Value = new(0.94f, 0.95f, 0.96f);
    private static readonly Color Accent = new(1.00f, 0.72f, 0.34f);
    private static readonly Color Warning = new(0.90f, 0.45f, 0.38f);
    private static readonly Color Progress = new(0.45f, 0.72f, 0.45f);

    private Bridge.SimulationHost? _host;
    private int _nation = -1;
    private string _nationName = string.Empty;

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
        CustomMinimumSize = new Vector2(Width, 268);
        Position = new Vector2(16, 62);
        MouseFilter = MouseFilterEnum.Ignore;
    }

    public override void _Process(double delta)
    {
        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        QueueRedraw();
    }

    public override void _Draw()
    {
        if (_host is null)
        {
            return;
        }

        if (_nation < 0)
        {
            _nation = _host.World.Nations.IndexOf("IDN");
            _nationName = NationLabels.NameOf(_host.World.Nations.Tag[_nation].Trim());
        }

        var world = _host.World;
        float y = Margin;

        y = DrawIdentity(y);
        y = DrawClockAndVictory(world, y);
        y = DrawGrid(y);

        DrawHint(y);
    }

    private float DrawIdentity(float y)
    {
        /* A colour block instead of a flag. The nation's colour is already the
           one the player has been reading off the map all game, so it is a
           better badge here than a small unreadable image would be. */
        var swatch = new Rect2(Margin, y, 30f, 30f);
        DrawRect(swatch, MapPalette.NationColour(_nation, isPlayer: true));
        DrawRect(swatch, new Color(0f, 0f, 0f, 0.55f), filled: false, width: 1f);

        DrawText(_nationName.ToUpperInvariant(), Margin + 42f, y + 12f, 17, Value, UiAssets.Bold);
        DrawText(_host!.ArchetypeOf(_nation).ToString(), Margin + 42f, y + 27f, 11, Label);

        y += 40f;
        DrawRule(y);
        return y + 10f;
    }

    private float DrawClockAndVictory(NationRise.Core.World.WorldState world, float y)
    {
        float half = (Width - Margin * 2f - 10f) / 2f;

        Field2(Margin, y, half, "DAY", world.Clock.Date.Day.ToString(), Value);
        Field2(Margin + half + 10f, y, half, "TIME", $"{world.Clock.Date.Hour:00}:00", Value);
        y += RowHeight + FieldHeight;

        int points = world.VictoryPointsOf((ushort)_nation);
        int target = _host!.VictoryThreshold;

        Field2(Margin, y, Width - Margin * 2f, "VICTORY", $"{points:N0} / {target:N0}", Accent);
        y += RowHeight + FieldHeight - 4f;

        /* The bar carries the same number as the field above it. One is read at
           a glance and the other is read when it matters; neither replaces the
           other. */
        var track = new Rect2(Margin, y, Width - Margin * 2f, 5f);
        DrawRect(track, Field);

        float filled = target <= 0 ? 0f : Mathf.Clamp(points / (float)target, 0f, 1f);
        DrawRect(track with { Size = new Vector2(track.Size.X * filled, track.Size.Y) }, Progress);

        y += 16f;
        DrawRule(y);
        return y + 10f;
    }

    private float DrawGrid(float y)
    {
        (string Label, string Value, bool Alarming)[] rows =
        [
            ("UNITS", _host!.UnitsInField(_nation).ToString(), false),
            ("WARS", _host.ActiveWars.ToString(), false),
            ("MORALE", $"{_host.AverageMoraleOf(_nation):P0}", _host.AverageMoraleOf(_nation) < 0.45f),
            ("BATTLES", _host.BattlesThisTick.ToString(), _host.BattlesThisTick > 0),
            ("BUILDINGS", _host.BuildingLevelsIn(_nation).ToString(), false),
            ("RESEARCH", _host.ResearchCompleted(_nation).ToString(), false),
            ("CUT OFF", _host.CutOffProvincesOf(_nation).ToString(), _host.CutOffProvincesOf(_nation) > 0),
            ("BLOCKADED", _host.BlockadedCountOf(_nation).ToString(), _host.BlockadedCountOf(_nation) > 0),
        ];

        float half = (Width - Margin * 2f - 10f) / 2f;

        for (int i = 0; i < rows.Length; i++)
        {
            float x = Margin + (i % 2 == 0 ? 0f : half + 10f);
            float row = y + i / 2 * (FieldHeight + 6f);

            (string label, string value, bool alarming) = rows[i];
            Field1(x, row, half, label, value, alarming ? Warning : Value);
        }

        return y + (rows.Length / 2) * (FieldHeight + 6f) + 8f;
    }

    private void DrawHint(float y)
    {
        DrawRule(y);
        DrawText("SPACE pause   +/− speed   F5 save   F9 load", Margin, y + 18f, 11, Label);

        float needed = y + 30f;
        if (Size.Y < needed)
        {
            CustomMinimumSize = new Vector2(Width, needed);
        }
    }

    /* Label above the field, for the two rows that carry the campaign's own
       state and deserve the room. */
    private void Field2(float x, float y, float width, string label, string value, Color tone)
    {
        DrawText(label, x, y + 9f, 10, Label);

        var box = new Rect2(x, y + 15f, width, FieldHeight);
        DrawRect(box, Field);
        DrawRect(box, Rule, filled: false, width: 1f);

        DrawText(value, x + 8f, y + 15f + FieldHeight - 6f, 14, tone, UiAssets.SemiBold);
    }

    /* Label and field on one line, for the grid of secondary numbers. */
    private void Field1(float x, float y, float width, string label, string value, Color tone)
    {
        var box = new Rect2(x, y, width, FieldHeight);
        DrawRect(box, Field);
        DrawRect(box, Rule, filled: false, width: 1f);

        DrawText(label, x + 7f, y + FieldHeight - 6f, 10, Label);

        Font font = UiAssets.SemiBold ?? ThemeDB.FallbackFont;
        float measured = font.GetStringSize(value, HorizontalAlignment.Left, -1, 13).X;
        DrawText(value, x + width - measured - 7f, y + FieldHeight - 6f, 13, tone, UiAssets.SemiBold);
    }

    private void DrawRule(float y) =>
        DrawLine(new Vector2(Margin, y), new Vector2(Width - Margin, y), Rule, 1f);

    private void DrawText(string text, float x, float y, int size, Color colour, Font? font = null) =>
        DrawString(font ?? UiAssets.Regular ?? ThemeDB.FallbackFont,
            new Vector2(x, y), text, HorizontalAlignment.Left, -1, size, colour);
}
