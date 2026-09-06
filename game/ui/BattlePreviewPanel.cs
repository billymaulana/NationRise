using Godot;
using NationRise.Core.Military;

namespace NationRise.Game.Ui;

/*
   Layer one of the battle preview: the multiplication chain the engine will
   actually use, shown before the attack is ordered. It quotes a range of ticks
   and losses rather than a win percentage, because the damage roll really is a
   range and a quoted "80%" that loses reads as a lie.
*/
public sealed partial class BattlePreviewPanel : PanelContainer
{
    private static readonly Color Heading = new(0.85f, 0.80f, 0.68f);
    private static readonly Color Favourable = new(0.55f, 0.80f, 0.50f);
    private static readonly Color Adverse = new(0.88f, 0.45f, 0.40f);
    private static readonly Color Uncertain = new(0.90f, 0.75f, 0.35f);

    private Label? _title;
    private Label? _chain;
    private Label? _verdict;
    private Bridge.SimulationHost? _host;
    private Render.ProvincePicker? _picker;
    private bool _connected;

    public override void _Ready()
    {
        var background = new StyleBoxFlat
        {
            BgColor = new Color(0.07f, 0.09f, 0.12f, 0.94f),
            BorderColor = new Color(0.62f, 0.40f, 0.28f, 0.85f),
        };
        background.SetBorderWidthAll(1);
        background.SetCornerRadiusAll(3);
        AddThemeStyleboxOverride("panel", background);

        _title = new Label { Text = string.Empty };
        _title.AddThemeFontSizeOverride("font_size", 15);
        _title.AddThemeColorOverride("font_color", Heading);

        /* Monospace so the factor column lines up; an unaligned chain of
           multipliers is exactly as unreadable as no chain at all. */
        _chain = new Label { Text = string.Empty };
        _chain.AddThemeFontSizeOverride("font_size", 14);
        _chain.AddThemeFontOverride("font", ThemeDB.FallbackFont);

        _verdict = new Label { Text = string.Empty, AutowrapMode = TextServer.AutowrapMode.WordSmart };
        _verdict.AddThemeFontSizeOverride("font_size", 14);
        _verdict.CustomMinimumSize = new Vector2(320, 0);

        var column = new VBoxContainer();
        column.AddThemeConstantOverride("separation", 6);
        column.AddChild(_title);
        column.AddChild(_chain);
        column.AddChild(new HSeparator());
        column.AddChild(_verdict);

        var margin = new MarginContainer();
        margin.AddThemeConstantOverride("margin_left", 12);
        margin.AddThemeConstantOverride("margin_right", 12);
        margin.AddThemeConstantOverride("margin_top", 8);
        margin.AddThemeConstantOverride("margin_bottom", 8);
        margin.AddChild(column);
        AddChild(margin);

        SetAnchorsPreset(LayoutPreset.TopLeft);
        CustomMinimumSize = new Vector2(344, 0);
        Position = new Vector2(980, 250);
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

        _picker.ProvincePicked += ShowFor;
        _connected = true;
    }

    public void ShowFor(int province)
    {
        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");

        if (_host is null)
        {
            return;
        }

        Render(_host.PreviewAttackOn(province), null, _host.NameOfProvince(province));
    }

    public void ShowPlan(Bridge.MovePlan plan, string destination) =>
        Render(plan.Battle, plan, destination);

    private void Render(Bridge.AttackPreview? preview, Bridge.MovePlan? plan, string destination)
    {
        if (_title is null || _chain is null || _verdict is null)
        {
            return;
        }

        if (preview is null)
        {
            /* A march into empty ground still deserves an answer: how long, and
               does it end in a landing. */
            if (plan is null)
            {
                Visible = false;
                return;
            }

            _title.Text = $"MARCH TO {Named(destination)}".ToUpperInvariant();
            _chain.Text = $"{Provinces(plan.Path.Count - 1)}  ·  {Hours(plan.Hours)}";
            _verdict.AddThemeColorOverride("font_color", Heading);
            _verdict.Text = plan.AmphibiousArrival
                ? "Arrives by sea. Click again to order."
                : "No defenders. Click again to order.";
            Visible = true;
            return;
        }

        BattleForecast forecast = preview.Forecast;
        StrengthBreakdown attack = forecast.Attacker;
        StrengthBreakdown defence = forecast.Defender;

        _title.Text = $"IF YOU ATTACK  ·  {preview.DefenderName}".ToUpperInvariant();

        _chain.Text =
            $"                you    them\n" +
            $"Base rating  {attack.BaseRating,7:0.0} {defence.BaseRating,7:0.0}\n" +
            $"x Terrain    {attack.Terrain,7:0.00} {defence.Terrain,7:0.00}   {preview.Terrain}\n" +
            $"x Stack      {attack.StackPenalty,7:0.00} {defence.StackPenalty,7:0.00}   " +
            $"{preview.AttackerUnits} v {preview.DefenderUnits}\n" +
            $"x Health     {attack.HealthPenalty,7:0.00} {defence.HealthPenalty,7:0.00}\n" +
            (preview.Amphibious
                ? $"x Landing    {attack.Situational,7:0.00} {defence.Situational,7:0.00}   opposed landing\n"
                : string.Empty) +
            $"= Strength   {attack.Total,7:0.0} {defence.Total,7:0.0}";

        string losses =
            $"You lose {Span(forecast.AttackerLossesLow, forecast.AttackerLossesHigh)} of {preview.AttackerUnits}, " +
            $"they lose {Span(forecast.DefenderLossesLow, forecast.DefenderLossesHigh)} of {preview.DefenderUnits}.";

        string outcome = forecast switch
        {
            { AttackerWinsWorstCase: true } => "You take the province.",
            { AttackerWinsBestCase: false } => "You do not take the province.",
            _ => "Too close to call.",
        };

        _verdict.AddThemeColorOverride("font_color", forecast switch
        {
            { AttackerWinsWorstCase: true } => Favourable,
            { AttackerWinsBestCase: false } => Adverse,
            _ => Uncertain,
        });

        string march = plan is null
            ? string.Empty
            : $"\nMarch {Hours(plan.Hours)}. Click again to order.";

        _verdict.Text =
            $"{outcome}  Around {Span(forecast.FastestTicks, forecast.SlowestTicks)} hours.\n{losses}{march}";

        Visible = true;
    }

    private static string Named(string name) => name.Length > 0 ? name : "the target";

    private static string Provinces(int count) => count == 1 ? "1 province" : $"{count} provinces";

    private static string Hours(float hours) => hours < 24f
        ? $"{hours:0} hours"
        : $"{hours / 24f:0.0} days";

    private static string Span(int low, int high) => low == high ? $"{low}" : $"{low}-{high}";
}
