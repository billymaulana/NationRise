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

    private const float ReferenceZoom = 8f;
    private const float BaseCountSize = 0.0072f;

    private MultiMeshInstance3D? _instances;
    private readonly List<Label3D> _counts = [];
    private MapCamera? _camera;
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
           counter on a board, not an object standing in the terrain. Size
           carries strength, so a large stack is visible before it is read. */
        var mesh = new QuadMesh
        {
            Size = new Vector2(MarkerSize, MarkerSize),
            Orientation = PlaneMesh.OrientationEnum.Y,
        };

        var multi = new MultiMesh
        {
            TransformFormat = MultiMesh.TransformFormatEnum.Transform3D,
            UseColors = true,
            UseCustomData = true,
            Mesh = mesh,
            InstanceCount = 0,
        };

        _instances = new MultiMeshInstance3D
        {
            Multimesh = multi,
            MaterialOverride = CounterMaterial(),
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
        _camera ??= GetNodeOrNull<MapCamera>("/root/Main/Camera");

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

            /* Held at a constant size on screen, like the counters on the
               reference maps: a symbol that grows with the terrain stops being
               a symbol. Stack size still varies it, just within that. */
            float zoom = _camera?.Size ?? ReferenceZoom;
            float scale = (0.75f + Mathf.Min(army.UnitCount, 10) * 0.09f) * zoom / ReferenceZoom;
            var basis = Basis.Identity.Scaled(new Vector3(scale, 1f, scale));
            multi.SetInstanceTransform(i, new Transform3D(basis, position));

            /* Health drains the colour rather than changing it: a battered
               stack still reads as friendly or hostile at a glance. */
            Color colour = army.Nation == playerNation ? FriendlyColour : HostileColour;
            multi.SetInstanceColor(i, colour);
            multi.SetInstanceCustomData(i, new Color(army.Health, 0f, 0f, 0f));
        }

        UpdateCounts(visible);
    }

    /*
       A counter, not a blob: dark rim, national colour inside, and a strength
       bar along the bottom. The reference maps all use the same three parts,
       and each one answers a question the player asks constantly — whose is it,
       how big, how hurt.

       Drawn in one shader over instance colour and custom data so the whole
       set still costs a single draw call.
    */
    private static ShaderMaterial CounterMaterial()
    {
        var shader = new Shader
        {
            Code = @"
            shader_type spatial;
            render_mode unshaded, cull_disabled, blend_mix, depth_draw_never;

            /* Instance colour and custom data are only readable in vertex(),
               so both are carried across by hand. Reading them in fragment()
               compiles and silently draws nothing. */
            varying vec3 tint;
            varying float strength;

            void vertex() {
                tint = COLOR.rgb;
                strength = INSTANCE_CUSTOM.r;
            }

            void fragment() {
                vec2 d = abs(UV - 0.5) * 2.0;
                float edge = max(d.x, d.y);

                float rim = smoothstep(0.78, 0.86, edge);
                vec3 body = mix(tint, tint * 0.30, rim);

                float health = clamp(strength, 0.0, 1.0);
                float inBar = step(UV.y, 0.16) * step(0.10, UV.x) * step(UV.x, 0.90);
                float filled = step(UV.x, 0.10 + health * 0.80);

                vec3 bar = mix(vec3(0.10, 0.10, 0.12), vec3(0.35, 0.78, 0.40), filled);
                ALBEDO = mix(body, bar, inBar);
                ALPHA = 1.0 - step(1.0, edge);
            }
            ",
        };

        return new ShaderMaterial { Shader = shader };
    }

    /*
       Unit counts as real text. A pool rather than one node per stack: the set
       of visible stacks churns as wars start and end, and creating text nodes
       is the expensive part.
    */
    private void UpdateCounts(List<ArmyView> visible)
    {
        while (_counts.Count < visible.Count)
        {
            var label = new Label3D
            {
                FontSize = 26,
                Modulate = new Color(1f, 1f, 1f),
                OutlineSize = 10,
                OutlineModulate = new Color(0.04f, 0.05f, 0.07f, 0.95f),
                Billboard = BaseMaterial3D.BillboardModeEnum.Disabled,
                NoDepthTest = true,
                RotationDegrees = new Vector3(-90f, 0f, 0f),
                HorizontalAlignment = HorizontalAlignment.Center,
            };

            AddChild(label);
            _counts.Add(label);
        }

        float zoom = _camera?.Size ?? ReferenceZoom;

        for (int i = 0; i < _counts.Count; i++)
        {
            Label3D label = _counts[i];

            if (i >= visible.Count)
            {
                label.Visible = false;
                continue;
            }

            ArmyView army = visible[i];

            label.Text = army.UnitCount.ToString();
            label.PixelSize = BaseCountSize * zoom / ReferenceZoom;
            label.Position = _provinceCentres[army.Province] + new Vector3(0f, 0.45f, 0.012f * zoom / ReferenceZoom);
            label.Visible = true;
        }
    }
}
