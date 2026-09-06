using Godot;
using GameResource = NationRise.Core.Economy.Resource;

namespace NationRise.Game.Ui;

public sealed partial class StatusPanel : PanelContainer
{
    private Label? _label;
    private Bridge.SimulationHost? _host;
    private int _nation = -1;

    public override void _Ready()
    {
        _host = GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");

        _label = new Label { Text = "Loading..." };
        _label.AddThemeFontSizeOverride("font_size", 16);

        var margin = new MarginContainer();
        margin.AddThemeConstantOverride("margin_left", 12);
        margin.AddThemeConstantOverride("margin_right", 12);
        margin.AddThemeConstantOverride("margin_top", 8);
        margin.AddThemeConstantOverride("margin_bottom", 8);
        margin.AddChild(_label);
        AddChild(margin);

        SetAnchorsPreset(LayoutPreset.TopLeft);
        Position = new Vector2(16, 16);
    }

    public override void _Process(double delta)
    {
        if (_host is null || _label is null)
        {
            return;
        }

        if (_nation < 0)
        {
            _nation = _host.World.Nations.IndexOf("IDN");
        }

        var world = _host.World;
        _label.Text =
            $"Day {world.Clock.Date.Day}  {world.Clock.Date.Hour:00}:00   [{NationRise.Core.Time.GameSpeedInfo.Label(_host.Speed)}]\n" +
            $"Victory  {world.VictoryPointsOf((ushort)_nation)} / {_host.VictoryThreshold}   ({_host.VictoryProgressOf(_nation)}%)\n" +
            $"         {_host.ArchetypeOf(_nation)}\n" +
            $"Money      {_host.StockOf(_nation, GameResource.Money),10:N0}\n" +
            $"Food       {_host.StockOf(_nation, GameResource.Food),10:N0}\n" +
            $"Materials  {_host.StockOf(_nation, GameResource.Materials),10:N0}\n" +
            $"Technology {_host.StockOf(_nation, GameResource.Technology),10:N0}\n" +
            $"Battles    {_host.BattlesThisTick,10}\n" +
            $"Wars       {_host.ActiveWars,10}\n" +
            $"Buildings  {_host.BuildingLevelsIn(_nation),10}\n" +
            $"Research   {_host.ResearchCompleted(_nation),10}\n" +
            $"Units      {_host.UnitsInField(_nation),10}\n" +
            $"Manpower   {_host.StockOf(_nation, GameResource.Manpower),10:N0}\n" +
            $"Morale     {_host.AverageMoraleOf(_nation),10:P0}\n" +
            $"Cut off    {_host.CutOffProvincesOf(_nation),10}\n" +
            $"Blockaded  {_host.BlockadedCountOf(_nation),10}\n" +
            $"Tech price {_host.PriceOf(GameResource.Technology) / 1000.0,10:F1}\n" +
            "\nSpace pause  +/- speed  F5 save  F9 load";
    }
}
