using Godot;

namespace NationRise.Game.Ui;

/*
   Left-click selects one of the player's stacks; the next left-click plans a
   march and shows what it would cost, and a repeat click on the same province
   commits it. The plan is deliberately a separate step from the order: on this
   map an attack is usually a landing, and a landing is worth reading about
   before it is ordered.
*/
public sealed partial class ArmyCommand : Node3D
{
    private Bridge.SimulationHost? _host;
    private Render.ProvincePicker? _picker;
    private BattlePreviewPanel? _panel;
    private MeshInstance3D? _route;
    private bool _connected;

    private int _armyId = -1;
    private int _pendingTarget = -1;

    public override void _Process(double delta)
    {
        if (_connected)
        {
            return;
        }

        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        _picker ??= GetNodeOrNull<Render.ProvincePicker>("/root/Main/ProvincePicker");
        _panel ??= GetNodeOrNull<BattlePreviewPanel>("/root/Main/Hud/BattlePreviewPanel");

        if (_host is null || _picker is null || _panel is null)
        {
            return;
        }

        _picker.ProvinceTargeted += OnTargeted;
        _connected = true;
    }

    public void OnTargeted(int province)
    {
        if (_host is null || _panel is null)
        {
            return;
        }

        if (_armyId < 0)
        {
            Select(province);
            return;
        }

        if (province == _pendingTarget)
        {
            _host.IssueMove(_armyId, province);
            Clear();
            return;
        }

        Bridge.MovePlan? plan = _host.PlanMove(_armyId, province);
        if (plan is null)
        {
            Select(province);
            return;
        }

        _pendingTarget = province;
        _panel.ShowPlan(plan, _host.NameOfProvince(province));
        DrawRoute(plan);
    }

    private void Select(int province)
    {
        int army = _host!.PlayerArmyAt(province);
        _armyId = army;
        _pendingTarget = -1;
        _panel!.Hide();
        ClearRoute();
    }

    private void Clear()
    {
        _armyId = -1;
        _pendingTarget = -1;
        _panel?.Hide();
        ClearRoute();
    }

    private void DrawRoute(Bridge.MovePlan plan)
    {
        ClearRoute();

        if (_picker is null || plan.Path.Count < 2)
        {
            return;
        }

        var mesh = new ImmediateMesh();
        mesh.SurfaceBegin(Mesh.PrimitiveType.LineStrip);

        foreach (int province in plan.Path)
        {
            Vector3 centre = _picker.CentreOf(province);
            mesh.SurfaceAddVertex(centre with { Y = centre.Y + 0.06f });
        }

        mesh.SurfaceEnd();

        _route = new MeshInstance3D
        {
            Mesh = mesh,
            MaterialOverride = new StandardMaterial3D
            {
                ShadingMode = BaseMaterial3D.ShadingModeEnum.Unshaded,
                AlbedoColor = plan.AmphibiousArrival
                    ? new Color(0.95f, 0.55f, 0.30f)
                    : new Color(0.90f, 0.92f, 0.95f),
            },
        };

        AddChild(_route);
    }

    private void ClearRoute()
    {
        _route?.QueueFree();
        _route = null;
    }
}
