using Godot;

namespace NationRise.Game.Render;

/* Development aid: exercises save and load in the running engine, then writes
   the viewport to disk so the map can be inspected without a human watching. */
public sealed partial class Screenshot : Node
{
    [Export] public int SaveAtFrame { get; set; } = 300;
    [Export] public int LoadAtFrame { get; set; } = 600;
    [Export] public int FrameToCapture { get; set; } = 900;
    [Export] public string OutputPath { get; set; } = "user://map.png";

    private int _frame;
    private int _pointsAtSave = -1;

    public override void _Process(double delta)
    {
        _frame++;
        var host = GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");

        if (_frame == SaveAtFrame && host is not null)
        {
            int nation = host.World.Nations.IndexOf("IDN");
            _pointsAtSave = host.World.VictoryPointsOf((ushort)nation);
            GD.Print($"Saving at day {host.World.Clock.Date.Day}, {_pointsAtSave} victory points.");
            host.SaveGame();
        }

        if (_frame == LoadAtFrame && host is not null)
        {
            int nation = host.World.Nations.IndexOf("IDN");
            int before = host.World.VictoryPointsOf((ushort)nation);
            GD.Print($"Before load: day {host.World.Clock.Date.Day}, {before} victory points.");

            host.LoadGame();

            int after = host.World.VictoryPointsOf((ushort)nation);
            GD.Print(after == _pointsAtSave
                ? $"Load verified: {after} victory points restored."
                : $"Load MISMATCH: expected {_pointsAtSave}, got {after}.");
        }

        if (_frame != FrameToCapture)
        {
            return;
        }

        Image image = GetViewport().GetTexture().GetImage();
        Error error = image.SavePng(OutputPath);
        GD.Print(error == Error.Ok
            ? $"Screenshot written to {ProjectSettings.GlobalizePath(OutputPath)}"
            : $"Screenshot failed: {error}");

        GetTree().Quit();
    }
}
