using Godot;

namespace NationRise.Game.Render;

/* Development aid: exercises save and load in the running engine, then writes
   the viewport to disk so the map can be inspected without a human watching. */
public sealed partial class Screenshot : Node
{
    [Export] public int SaveAtFrame { get; set; } = 900;
    [Export] public int LoadAtFrame { get; set; } = 1800;
    [Export] public int FrameToCapture { get; set; } = 2700;
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

        if (_frame == FrameToCapture - 60 && host is not null)
        {
            ExerciseOrderFlow(host);
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

    /* Drives the same signal path a click drives, so the screenshot proves the
       order flow rather than a hand-built panel. */
    private void ExerciseOrderFlow(Bridge.SimulationHost host)
    {
        int home = -1;
        for (int province = 0; province < host.World.Provinces.Count && home < 0; province++)
        {
            if (host.PlayerArmyAt(province) >= 0)
            {
                home = province;
            }
        }

        if (home < 0)
        {
            GD.Print("No player stack to command.");
            return;
        }

        int army = host.PlayerArmyAt(home);
        int target = FarthestHostileProvince(host, home);

        var provincePanel = GetNodeOrNull<Ui.ProvincePanel>("/root/Main/Hud/ProvincePanel");
        provincePanel?.Show(home);
        GD.Print($"ProvincePanel: found={provincePanel is not null}, visible={provincePanel?.Visible}, " +
                 $"size={provincePanel?.Size}, pos={provincePanel?.GlobalPosition}");

        var command = GetNodeOrNull<Ui.ArmyCommand>("/root/Main/ArmyCommand");
        if (command is null || target < 0)
        {
            GD.Print($"Order flow unavailable: command={command is not null}, target={target}.");
            return;
        }

        command.OnTargeted(home);
        command.OnTargeted(target);

        var battlePanel = GetNodeOrNull<Ui.BattlePreviewPanel>("/root/Main/Hud/BattlePreviewPanel");
        GD.Print($"BattlePanel: found={battlePanel is not null}, visible={battlePanel?.Visible}, " +
                 $"size={battlePanel?.Size}, pos={battlePanel?.GlobalPosition}");

        Bridge.MovePlan? plan = host.PlanMove(army, target);
        GD.Print(plan is null
            ? $"No route from {home} to {target}."
            : $"Planned {plan.Path.Count - 1} steps, {plan.Hours:0} hours, " +
              $"landing={plan.AmphibiousArrival}, battle={plan.Battle is not null}.");
    }

    private static int FarthestHostileProvince(Bridge.SimulationHost host, int from)
    {
        for (int province = 0; province < host.World.Provinces.Count; province++)
        {
            if (host.PreviewAttackOn(province) is not null)
            {
                return province;
            }
        }

        ushort player = host.PlayerNation;
        for (int province = 0; province < host.World.Provinces.Count; province++)
        {
            ushort owner = host.World.Provinces.Controller[province];
            if (owner != player && host.Relations.AtWar(player, owner))
            {
                return province;
            }
        }

        /* At peace there is still a march to preview, which is the case the
           panel has to handle anyway. */
        for (int province = 0; province < host.World.Provinces.Count; province++)
        {
            if (province != from && host.World.Provinces.Controller[province] == player)
            {
                return province;
            }
        }

        return -1;
    }
}
