using Godot;

namespace NationRise.Game.Ui;

/*
   The last declaration of war, written as an event rather than as the scoring
   that produced it. The player wants to know who moved against whom and
   roughly why; the full consideration vector belongs in a log, and putting it
   on the map was showing someone the machinery instead of the news.
*/
public sealed partial class DecisionPanel : PanelContainer
{
    private const int Width = 340;
    private const int Margin = 14;

    private static readonly Color Panel = new(0.129f, 0.161f, 0.196f, 0.96f);
    private static readonly Color Rule = new(0.30f, 0.34f, 0.38f, 0.55f);
    private static readonly Color Heading = new(0.90f, 0.45f, 0.38f);
    private static readonly Color Label = new(0.62f, 0.66f, 0.70f);
    private static readonly Color Value = new(0.94f, 0.95f, 0.96f);

    private Bridge.SimulationHost? _host;
    private Bridge.WarReport? _shown;

    public override void _Ready()
    {
        var background = new StyleBoxFlat
        {
            BgColor = Panel,
            BorderColor = new Color(0.50f, 0.34f, 0.32f, 0.85f),
        };
        background.SetBorderWidthAll(1);
        AddThemeStyleboxOverride("panel", background);

        SetAnchorsPreset(LayoutPreset.TopLeft);
        CustomMinimumSize = new Vector2(Width, 92);
        MouseFilter = MouseFilterEnum.Ignore;
        Visible = false;
    }

    public override void _Process(double delta)
    {
        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        if (_host is null)
        {
            return;
        }

        /* Anchored to the bottom of the window rather than to a fixed y, so it
           keeps its place when the window is resized. */
        Vector2 viewport = GetViewportRect().Size;
        Position = new Vector2(16f, viewport.Y - CustomMinimumSize.Y - 24f);

        Bridge.WarReport? latest = _host.LastWar;
        if (latest is null)
        {
            Visible = false;
            return;
        }

        if (!ReferenceEquals(latest, _shown))
        {
            _shown = latest;
            QueueRedraw();
        }

        Visible = true;
    }

    public override void _Draw()
    {
        if (_shown is null)
        {
            return;
        }

        DrawText("WAR DECLARED", Margin, 24f, 12, Heading, UiAssets.Bold);
        DrawText($"DAY {_shown.Day}", Width - Margin - 52f, 24f, 11, Label);

        DrawLine(new Vector2(Margin, 32f), new Vector2(Width - Margin, 32f), Rule, 1f);

        DrawText($"{_shown.Attacker}  →  {_shown.Defender}", Margin, 55f, 15, Value, UiAssets.SemiBold);
        DrawText($"over {_shown.Reason.ToLowerInvariant()}", Margin, 75f, 12, Label);
    }

    private void DrawText(string text, float x, float y, int size, Color colour, Font? font = null) =>
        DrawString(font ?? UiAssets.Regular ?? ThemeDB.FallbackFont,
            new Vector2(x, y), text, HorizontalAlignment.Left, -1, size, colour);
}
