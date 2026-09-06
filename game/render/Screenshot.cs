using Godot;

namespace NationRise.Game.Render;

/* Development aid: renders a few frames then writes the viewport to disk so
   map output can be inspected without a human watching the window. */
public sealed partial class Screenshot : Node
{
    [Export] public int FrameToCapture { get; set; } = 400;
    [Export] public string OutputPath { get; set; } = "user://map.png";

    private int _frame;

    public override void _Process(double delta)
    {
        _frame++;
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
