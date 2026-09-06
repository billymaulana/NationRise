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
    [Export] public float MarkerSize { get; set; } = 0.30f;

    private MultiMeshInstance3D? _instances;
    private Vector3[] _provinceCentres = [];

    public void SetProvinceCentres(Vector3[] centres) => _provinceCentres = centres;

    private Bridge.SimulationHost? _host;
    private ProvinceMap? _map;
    private ushort _playerNation;
    private bool _linked;

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

    public override void _Ready()
    {
        var mesh = new BoxMesh { Size = new Vector3(MarkerSize, MarkerSize, MarkerSize) };

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

        var armies = snapshot.Armies;
        multi.InstanceCount = armies.Count;

        for (int i = 0; i < armies.Count; i++)
        {
            ArmyView army = armies[i];
            if (army.Province >= _provinceCentres.Length)
            {
                continue;
            }

            Vector3 position = _provinceCentres[army.Province] + new Vector3(0f, 0.5f, 0f);
            multi.SetInstanceTransform(i, new Transform3D(Basis.Identity, position));
            multi.SetInstanceColor(i, army.Nation == playerNation ? FriendlyColour : HostileColour);
        }
    }
}
