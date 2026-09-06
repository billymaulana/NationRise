using Godot;

namespace NationRise.Game.Ui;

/*
   Shows why the AI did what it did. The research found that "the AI cheats" is
   almost always a legibility complaint rather than a balance one: Firaxis
   crippled Civilization IV's AI trading purely for perception. The scores are
   already computed to make the decision, so showing them costs nothing.
*/
public sealed partial class DecisionPanel : PanelContainer
{
    private Label? _label;
    private Bridge.SimulationHost? _host;
    private int _lastWarCount = -1;

    public override void _Ready()
    {
        _label = new Label { Text = string.Empty };
        _label.AddThemeFontSizeOverride("font_size", 14);

        var margin = new MarginContainer();
        margin.AddThemeConstantOverride("margin_left", 12);
        margin.AddThemeConstantOverride("margin_right", 12);
        margin.AddThemeConstantOverride("margin_top", 8);
        margin.AddThemeConstantOverride("margin_bottom", 8);
        margin.AddChild(_label);
        AddChild(margin);

        SetAnchorsPreset(LayoutPreset.TopLeft);
        Position = new Vector2(16, 620);
        Visible = false;
    }

    public override void _Process(double delta)
    {
        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        if (_host is null || _label is null)
        {
            return;
        }

        int wars = _host.ActiveWars;
        if (wars == _lastWarCount)
        {
            return;
        }

        _lastWarCount = wars;

        string reasoning = _host.LastDecisionExplanation;
        if (string.IsNullOrEmpty(reasoning))
        {
            Visible = false;
            return;
        }

        _label.Text = $"Latest declaration of war\n{reasoning}";
        Visible = true;
    }
}
