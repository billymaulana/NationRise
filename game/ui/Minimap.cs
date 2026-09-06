using Godot;
using NationRise.Game.Render;

namespace NationRise.Game.Ui;

/*
   The whole world in the corner, with a box showing where the camera is. Once
   the main view is zoomed in far enough to read terrain it no longer answers
   "where am I", and every map in this genre solves that the same way.

   Provinces are stamped into a small image rather than rendered a second time:
   a second camera would draw the entire world again every frame for a picture
   two hundred pixels wide.
*/
public sealed partial class Minimap : Control
{
    private const int Width = 300;
    private const int Height = 160;

    /* The map plane spans roughly this many units either side of the origin;
       the province geometry is built from degrees scaled by a tenth. */
    private const float SpanX = 18.0f;
    private const float SpanZ = 9.0f;

    [Export] public float RedrawSeconds { get; set; } = 4.0f;

    private TextureRect? _canvas;
    private Control? _overlay;
    private Image? _image;
    private ImageTexture? _texture;

    private Bridge.SimulationHost? _host;
    private ProvinceMap? _map;
    private MapCamera? _camera;

    private double _sinceRedraw = double.MaxValue;
    private int _stamp = -1;

    public override void _Ready()
    {
        var background = new StyleBoxFlat
        {
            BgColor = new Color(0.07f, 0.09f, 0.12f, 0.94f),
            BorderColor = new Color(0.45f, 0.42f, 0.36f, 0.85f),
        };
        background.SetBorderWidthAll(1);

        var frame = new PanelContainer();
        frame.AddThemeStyleboxOverride("panel", background);

        var margin = new MarginContainer();
        margin.AddThemeConstantOverride("margin_left", 4);
        margin.AddThemeConstantOverride("margin_right", 4);
        margin.AddThemeConstantOverride("margin_top", 4);
        margin.AddThemeConstantOverride("margin_bottom", 4);

        _canvas = new TextureRect
        {
            CustomMinimumSize = new Vector2(Width, Height),
            StretchMode = TextureRect.StretchModeEnum.Scale,
        };

        margin.AddChild(_canvas);
        frame.AddChild(margin);
        AddChild(frame);

        /* A Control paints itself before its children, so the viewport box has
           to live in a node of its own added after the picture. Drawn on the
           panel itself it would sit underneath the map and never be seen. */
        _overlay = new Control
        {
            Position = new Vector2(5f, 5f),
            CustomMinimumSize = new Vector2(Width, Height),
            MouseFilter = MouseFilterEnum.Ignore,
        };

        _overlay.Draw += DrawViewportBox;
        AddChild(_overlay);

        _image = Image.CreateEmpty(Width, Height, false, Image.Format.Rgba8);
        _texture = ImageTexture.CreateFromImage(_image);
        _canvas.Texture = _texture;

        SetAnchorsPreset(LayoutPreset.TopLeft);
        MouseFilter = MouseFilterEnum.Ignore;
    }

    public override void _Process(double delta)
    {
        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");
        _map ??= GetNodeOrNull<ProvinceMap>("/root/Main/ProvinceMap");
        _camera ??= GetNodeOrNull<MapCamera>("/root/Main/Camera");

        if (_host is null || _map is null || _camera is null || _map.ProvinceCentres.Length == 0)
        {
            return;
        }

        Vector2 viewport = GetViewportRect().Size;
        Position = new Vector2(viewport.X - Width - 24f, viewport.Y - Height - 24f);

        _sinceRedraw += delta;
        if (_sinceRedraw >= RedrawSeconds)
        {
            _sinceRedraw = 0.0;
            Redraw();
        }

        _overlay?.QueueRedraw();
    }

    /* The viewport box is drawn over the texture rather than into it, so it can
       follow the camera every frame while the far more expensive province stamp
       is only redone when the world changes hands. */
    private void DrawViewportBox()
    {
        if (_camera is null || _overlay is null)
        {
            return;
        }

        float halfWidth = _camera.Size * 0.5f * (GetViewportRect().Size.X / GetViewportRect().Size.Y);
        float halfDepth = _camera.Size * 0.5f;

        Vector2 centre = ToMinimap(_camera.Position.X, _camera.Position.Z);
        Vector2 corner = ToMinimap(_camera.Position.X - halfWidth, _camera.Position.Z - halfDepth);

        var size = new Vector2(Mathf.Abs(centre.X - corner.X) * 2f, Mathf.Abs(centre.Y - corner.Y) * 2f);
        var box = new Rect2(centre - size * 0.5f, size);

        _overlay.DrawRect(box, new Color(1f, 0.84f, 0.48f, 0.95f), filled: false, width: 1.5f);
    }

    private static Vector2 ToMinimap(float x, float z) => new(
        (x + SpanX) / (SpanX * 2f) * Width,
        (z + SpanZ) / (SpanZ * 2f) * Height);

    private void Redraw()
    {
        if (_image is null || _texture is null || _host is null || _map is null)
        {
            return;
        }

        var world = _host.World;
        int stamp = world.Provinces.Count * 31 + _host.ActiveWars * 7 + world.Clock.Date.Day;
        if (stamp == _stamp)
        {
            return;
        }

        _stamp = stamp;
        _image.Fill(MapPalette.MinimapSea);

        ushort player = _host.PlayerNation;
        Vector3[] centres = _map.ProvinceCentres;
        float[] radii = _map.ProvinceRadii;

        for (int province = 0; province < centres.Length && province < world.Provinces.Count; province++)
        {
            ushort nation = world.Provinces.Controller[province];
            if (nation == NationRise.Core.World.ProvinceStore.NoOwner)
            {
                continue;
            }

            Vector2 at = ToMinimap(centres[province].X, centres[province].Z);
            Color colour = MapPalette.NationColour(nation, nation == player);

            /* A fixed dot rather than the province's own reach. A polygon that
               crosses the antimeridian has a centroid near zero and a radius
               spanning half the world, and stamping that covers the minimap in
               one country's colour. Two thousand dots draw the continents on
               their own. */
            float reach = province < radii.Length ? radii[province] : 0f;
            int spread = reach > 3.0f ? 1 : 2;

            Stamp(at, spread, colour);
        }

        _texture.Update(_image);
    }

    private void Stamp(Vector2 at, int spread, Color colour)
    {
        int cx = Mathf.RoundToInt(at.X);
        int cy = Mathf.RoundToInt(at.Y);

        for (int y = cy - spread; y <= cy + spread; y++)
        {
            if (y < 0 || y >= Height)
            {
                continue;
            }

            for (int x = cx - spread; x <= cx + spread; x++)
            {
                if (x < 0 || x >= Width)
                {
                    continue;
                }

                _image!.SetPixel(x, y, colour);
            }
        }
    }
}
