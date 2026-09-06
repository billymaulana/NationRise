using Godot;

namespace NationRise.Game.Render;

/*
   Turns a click on the map into a province id. Nearest-centroid rather than
   point-in-polygon: at strategy-map zoom the two agree almost everywhere, and
   the exceptions are thin coastal slivers a player is not aiming at anyway.
   A spatial grid keeps the search off the 2,017-province list.
*/
public sealed partial class ProvincePicker : Node3D
{
    private const float CellSize = 2.0f;

    private readonly Dictionary<(int X, int Z), List<int>> _grid = [];
    private Vector3[] _centres = [];

    [Signal] public delegate void ProvincePickedEventHandler(int province);
    [Signal] public delegate void ProvinceTargetedEventHandler(int province);

    public int Selected { get; private set; } = -1;

    public Vector3 CentreOf(int province) =>
        province >= 0 && province < _centres.Length ? _centres[province] : Vector3.Zero;

    public void SetCentres(Vector3[] centres)
    {
        _centres = centres;
        _grid.Clear();

        for (int i = 0; i < centres.Length; i++)
        {
            (int, int) cell = CellOf(centres[i]);
            if (!_grid.TryGetValue(cell, out List<int>? bucket))
            {
                bucket = [];
                _grid[cell] = bucket;
            }

            bucket.Add(i);
        }
    }

    public override void _UnhandledInput(InputEvent @event)
    {
        if (@event is not InputEventMouseButton { Pressed: true } click
            || click.ButtonIndex is not (MouseButton.Right or MouseButton.Left))
        {
            return;
        }

        var camera = GetViewport().GetCamera3D();
        if (camera is null || _centres.Length == 0)
        {
            return;
        }

        /* The map lies flat at y = 0, so the ray always meets it unless the
           camera is looking at the horizon, which this camera cannot do. */
        Vector3 origin = camera.ProjectRayOrigin(click.Position);
        Vector3 direction = camera.ProjectRayNormal(click.Position);

        if (Mathf.IsZeroApprox(direction.Y))
        {
            return;
        }

        Vector3 hit = origin + direction * (-origin.Y / direction.Y);
        int province = NearestTo(hit);

        if (province < 0)
        {
            return;
        }

        Selected = province;
        EmitSignal(
            click.ButtonIndex == MouseButton.Right ? SignalName.ProvincePicked : SignalName.ProvinceTargeted,
            province);
    }

    private int NearestTo(Vector3 point)
    {
        (int cx, int cz) = CellOf(point);
        int best = -1;
        float bestDistance = float.MaxValue;

        /* Widening rings rather than one big radius: a hit is usually in the
           first ring, and stopping early keeps a click cheap. */
        for (int ring = 0; ring <= 6 && best < 0; ring++)
        {
            for (int x = cx - ring; x <= cx + ring; x++)
            {
                for (int z = cz - ring; z <= cz + ring; z++)
                {
                    if (ring > 0 && Mathf.Abs(x - cx) != ring && Mathf.Abs(z - cz) != ring)
                    {
                        continue;
                    }

                    if (!_grid.TryGetValue((x, z), out List<int>? bucket))
                    {
                        continue;
                    }

                    foreach (int province in bucket)
                    {
                        float distance = _centres[province].DistanceSquaredTo(point);
                        if (distance < bestDistance)
                        {
                            bestDistance = distance;
                            best = province;
                        }
                    }
                }
            }
        }

        return best;
    }

    private static (int, int) CellOf(Vector3 point) =>
        (Mathf.FloorToInt(point.X / CellSize), Mathf.FloorToInt(point.Z / CellSize));
}
