using Godot;
using NationRise.Core.World;

namespace NationRise.Game.Render;

/*
   Draws one instanced marker per stack. MultiMesh rather than a node per army:
   a late-campaign map can carry hundreds of stacks, and nodes would cost a
   draw call each for something the player reads as a single symbol.
*/
public sealed partial class ArmyMarkers : Node3D
{
    [Export] public Color FriendlyColour { get; set; } = new(0.95f, 0.42f, 0.28f);
    [Export] public Color HostileColour { get; set; } = new(0.32f, 0.55f, 0.85f);
    [Export] public float MarkerSize { get; set; } = 0.14f;

    private MultiMeshInstance3D? _instances;
    private Vector3[] _provinceCentres = [];

    public void SetProvinceCentres(Vector3[] centres) => _provinceCentres = centres;

    private Bridge.SimulationHost? _host;
    private ProvinceMap? _map;
    private ushort _playerNation;
    private bool _linked;
    private readonly HashSet<ushort> _hostile = [];
    private int _lastVisible = -1;

    public override void _Process(double delta)
    {
        if (!_linked)
        {
            _host = GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
            _map = GetNodeOrNull<ProvinceMap>("/root/Main/ProvinceMap");

            if (_host is null || _map is null || _map.ProvinceCentres.Length == 0)
            {
                return;
            }

            SetProvinceCentres(_map.ProvinceCentres);
            _playerNation = (ushort)_host.World.Nations.IndexOf("IDN");
            _linked = true;
        }

        if (_host is not null)
        {
            Update(_host.Snapshot(), _playerNation);
        }
    }

    private void RefreshHostiles(ushort playerNation)
    {
        if (_host is null)
        {
            return;
        }

        _hostile.Clear();
        foreach (int enemy in _host.Relations.EnemiesOf(playerNation))
        {
            _hostile.Add((ushort)enemy);
        }
    }

    public override void _Ready()
    {
        /* A flat quad lying on the map rather than a cube: the marker is a
           counter on a board, not an object standing in the terrain. */
        var mesh = new QuadMesh
        {
            Size = new Vector2(MarkerSize, MarkerSize),
            Orientation = PlaneMesh.OrientationEnum.Y,
        };

        var multi = new MultiMesh
        {
            TransformFormat = MultiMesh.TransformFormatEnum.Transform3D,
            UseColors = true,
            Mesh = mesh,
            InstanceCount = 0,
        };

        _instances = new MultiMeshInstance3D
        {
            Multimesh = multi,
            MaterialOverride = new StandardMaterial3D
            {
                VertexColorUseAsAlbedo = true,
                ShadingMode = BaseMaterial3D.ShadingModeEnum.Unshaded,
            },
        };

        AddChild(_instances);
    }

    public void Update(WorldSnapshot snapshot, ushort playerNation)
    {
        if (_instances?.Multimesh is not MultiMesh multi || _provinceCentres.Length == 0)
        {
            return;
        }

        RefreshHostiles(playerNation);

        /* Drawing all four hundred stacks buries the map. Only the player's
           forces and whoever they are fighting carry information the player
           can act on; the rest is noise. Recomputed every frame because wars
           start and end while the game runs. */
        var visible = new List<ArmyView>();
        foreach (ArmyView army in snapshot.Armies)
        {
            if (army.Province >= _provinceCentres.Length)
            {
                continue;
            }

            if (army.Nation == playerNation || _hostile.Contains(army.Nation))
            {
                visible.Add(army);
            }
        }

        if (_lastVisible != visible.Count)
        {
            _lastVisible = visible.Count;
            GD.Print($"Markers: {visible.Count} of {snapshot.Armies.Count} stacks, {_hostile.Count} hostile nations.");
        }

        multi.InstanceCount = visible.Count;

        for (int i = 0; i < visible.Count; i++)
        {
            ArmyView army = visible[i];
            Vector3 position = _provinceCentres[army.Province] + new Vector3(0f, 0.4f, 0f);
            multi.SetInstanceTransform(i, new Transform3D(Basis.Identity, position));
            multi.SetInstanceColor(i, army.Nation == playerNation ? FriendlyColour : HostileColour);
        }
    }
}
