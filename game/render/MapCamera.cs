using Godot;

namespace NationRise.Game.Render;

/*
   Orthographic camera over the map with drag-to-pan, scroll-and-pinch zoom, and
   a tilt that can be raised so the relief reads as ground rather than as a
   diagram. Movement is clamped to the map's extent so the world cannot be lost
   off-screen, which is the single most common way a strategy map wastes a
   player's time.
*/
public sealed partial class MapCamera : Camera3D
{
    [Export] public float HomeZoom { get; set; } = 4.0f;
    [Export] public float MinZoom { get; set; } = 1.2f;
    [Export] public float MaxZoom { get; set; } = 40.0f;
    [Export] public float ZoomStep { get; set; } = 1.15f;
    [Export] public float PanLimitX { get; set; } = 20.0f;
    [Export] public float PanLimitZ { get; set; } = 12.0f;

    /* Straight down for the flat view, and a shallow angle for the raised one.
       Anything steeper hides as much ground behind the relief as it reveals. */
    [Export] public float FlatPitch { get; set; } = -90.0f;
    [Export] public float RaisedPitch { get; set; } = -58.0f;
    [Export] public float TiltSeconds { get; set; } = 0.45f;

    private bool _dragging;
    private Vector2 _lastMouse;
    private float _pitch = -90.0f;
    private float _targetPitch = -90.0f;
    private Vector3 _focus = Vector3.Zero;
    private bool _settled;

    public bool Raised { get; private set; }

    /* The point on the ground the camera is looking at. Once the camera can
       tilt this stops being the same thing as its position, and everything that
       asks "where is the player looking" wants this one. */
    public Vector3 Focus => _focus;

    public override void _Ready()
    {
        Projection = ProjectionType.Orthogonal;
        Size = HomeZoom;
        _pitch = FlatPitch;
        _targetPitch = FlatPitch;
        Place();
    }

    /*
       Orbits the focus rather than turning on the spot. Rotating in place moves
       the point the camera is aimed at off into the distance the moment the
       pitch leaves vertical, and the map leaves the frustum entirely.
    */
    private void Place()
    {
        const float Distance = 16f;

        float radians = Mathf.DegToRad(-_pitch);
        Position = _focus + new Vector3(0f, Mathf.Sin(radians) * Distance, Mathf.Cos(radians) * Distance);
        RotationDegrees = new Vector3(_pitch, 0f, 0f);
    }

    public void SetRaised(bool raised)
    {
        Raised = raised;
        _targetPitch = raised ? RaisedPitch : FlatPitch;

        /* The opening tilt is snapped, not eased. While the camera is moving a
           screen point and a world point disagree, and anything aiming at the
           map during those frames lands somewhere else. */
        if (!_settled)
        {
            _settled = true;
            _pitch = _targetPitch;
            Place();
        }
    }

    public override void _Process(double delta)
    {
        if (Mathf.IsEqualApprox(_pitch, _targetPitch))
        {
            return;
        }

        /* Eased rather than snapped: the tilt changes what the player is
           looking at, and a jump costs them their place on the map. */
        float step = (float)delta / Mathf.Max(0.01f, TiltSeconds) * Mathf.Abs(FlatPitch - RaisedPitch);
        _pitch = Mathf.MoveToward(_pitch, _targetPitch, step);
        Place();
    }

    public override void _UnhandledInput(InputEvent @event)
    {
        switch (@event)
        {
            case InputEventMouseButton button:
                HandleButton(button);
                return;

            /* Trackpad pinch. Godot reports it as a factor either side of one,
               and it arrives far more often than a wheel click, so the step is
               applied directly rather than through the wheel's fixed ratio. */
            case InputEventMagnifyGesture magnify:
                ZoomBy(1f / Mathf.Max(0.01f, magnify.Factor));
                return;

            case InputEventPanGesture pan:
                PanBy(pan.Delta * 12f);
                return;

            case InputEventMouseMotion motion when _dragging:
                Vector2 delta = motion.Position - _lastMouse;
                _lastMouse = motion.Position;
                PanBy(-delta);
                return;
        }
    }

    private void ZoomBy(float factor) => Size = Mathf.Clamp(Size * factor, MinZoom, MaxZoom);

    /* Pan distance scales with zoom so a drag moves the same amount of map
       regardless of how far out the player is. */
    private void PanBy(Vector2 screenDelta)
    {
        float scale = Size / 600f;

        /* Dragging up the screen should walk north whatever the tilt, so the
           vertical component is stretched by how flat the ground looks from
           here rather than taken at face value. */
        float foreshortening = 1f / Mathf.Max(0.35f, Mathf.Sin(Mathf.DegToRad(-_pitch)));

        _focus = Clamp(_focus + new Vector3(
            screenDelta.X * scale,
            0f,
            screenDelta.Y * scale * foreshortening));

        Place();
    }

    private void HandleButton(InputEventMouseButton button)
    {
        switch (button.ButtonIndex)
        {
            case MouseButton.Middle:
                _dragging = button.Pressed;
                _lastMouse = button.Position;
                break;

            case MouseButton.WheelUp when button.Pressed:
                ZoomBy(1f / ZoomStep);
                break;

            case MouseButton.WheelDown when button.Pressed:
                ZoomBy(ZoomStep);
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
        _focus = Clamp(new Vector3(target.X, 0f, target.Z));
        Place();
    }

    public void ResetZoom() => Size = HomeZoom;
}
