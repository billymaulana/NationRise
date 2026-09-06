using Godot;

namespace NationRise.Game.Render;

/*
   Orthographic top-down camera with drag-to-pan and scroll-to-zoom. Movement
   is clamped to the map's extent so the world cannot be lost off-screen, which
   is the single most common way a strategy map wastes a player's time.
*/
public sealed partial class MapCamera : Camera3D
{
    [Export] public float HomeZoom { get; set; } = 4.0f;
    [Export] public float MinZoom { get; set; } = 2.0f;
    [Export] public float MaxZoom { get; set; } = 40.0f;
    [Export] public float ZoomStep { get; set; } = 1.15f;
    [Export] public float PanLimitX { get; set; } = 20.0f;
    [Export] public float PanLimitZ { get; set; } = 12.0f;

    private bool _dragging;
    private Vector2 _lastMouse;

    public override void _Ready()
    {
        Projection = ProjectionType.Orthogonal;
        Size = HomeZoom;
        Position = new Vector3(0f, 14f, 0f);
        RotationDegrees = new Vector3(-90f, 0f, 0f);
    }

    public override void _UnhandledInput(InputEvent @event)
    {
        if (@event is InputEventMouseButton button)
        {
            HandleButton(button);
            return;
        }

        if (@event is InputEventMouseMotion motion && _dragging)
        {
            /* Pan distance scales with zoom so a drag moves the same amount of
               map regardless of how far out the player is. */
            float scale = Size / 600f;
            Vector2 delta = motion.Position - _lastMouse;
            _lastMouse = motion.Position;

            Position = Clamp(Position + new Vector3(-delta.X * scale, 0f, -delta.Y * scale));
        }
    }

    private void HandleButton(InputEventMouseButton button)
    {
        switch (button.ButtonIndex)
        {
            case MouseButton.Left or MouseButton.Middle:
                _dragging = button.Pressed;
                _lastMouse = button.Position;
                break;

            case MouseButton.WheelUp when button.Pressed:
                Size = Mathf.Clamp(Size / ZoomStep, MinZoom, MaxZoom);
                break;

            case MouseButton.WheelDown when button.Pressed:
                Size = Mathf.Clamp(Size * ZoomStep, MinZoom, MaxZoom);
                break;
        }
    }

    private Vector3 Clamp(Vector3 position) => new(
        Mathf.Clamp(position.X, -PanLimitX, PanLimitX),
        position.Y,
        Mathf.Clamp(position.Z, -PanLimitZ, PanLimitZ));

    /* Opening on the player's own country rather than the middle of the
       Atlantic: the first thing a strategy map should answer is "where am I". */
    public void FocusOn(Vector3 target)
    {
        Position = Clamp(new Vector3(target.X, Position.Y, target.Z));
    }

    public void ResetZoom() => Size = HomeZoom;
}
