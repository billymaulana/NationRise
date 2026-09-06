using System.Globalization;
using Godot;
using GameResource = NationRise.Core.Economy.Resource;

namespace NationRise.Game.Ui;

/*
   The resource bar. A stockpile figure on its own answers nothing, so each cell
   carries the rate under it and lets colour, not a word, carry the sign.

   Every cell is measured once against the widest figure it will ever hold, not
   against the figure it holds now: a width that grew with the digits would
   shuffle all seven columns sideways on the game day a nation passed a
   thousand.
*/
public sealed partial class CommandBar : Control
{
    private static readonly GameResource[] Order =
    [
        GameResource.Money,
        GameResource.Manpower,
        GameResource.Food,
        GameResource.Fuel,
        GameResource.Materials,
        GameResource.Technology,
        GameResource.RareResources,
    ];

    private static readonly string[] Labels =
        ["MONEY", "MANPOWER", "FOOD", "FUEL", "MATERIALS", "TECH", "RARE"];

    private const string WidestValue = "8,888,888";
    private const string WidestRate = "+888,888 /h";

    private const int BarHeight = 56;
    private const int PadX = 12;
    private const int MinCellWidth = 150;
    private const int LabelSize = 10;
    private const int ValueSize = 17;
    private const int RateSize = 11;
    private const int LabelBaseline = 16;
    private const int ValueBaseline = 34;
    private const int RateBaseline = 48;

    private static readonly Color CellDark = new(0.278f, 0.329f, 0.361f, 0.96f);
    private static readonly Color CellLight = new(0.345f, 0.400f, 0.424f, 0.96f);
    private static readonly Color TopEdge = new(0.53f, 0.61f, 0.65f, 0.95f);
    private static readonly Color Edge = new(0.81f, 0.81f, 0.81f, 0.85f);
    private static readonly Color Divider = new(0.56f, 0.55f, 0.51f, 0.85f);
    private static readonly Color LabelInk = new(0.70f, 0.77f, 0.81f);
    private static readonly Color ValueInk = new(0.937f, 0.941f, 0.945f);
    private static readonly Color Rising = new(0.569f, 0.918f, 0.224f);
    private static readonly Color Falling = new(0.941f, 0.282f, 0.235f);
    private static readonly Color Flat = new(0.56f, 0.61f, 0.64f);

    private readonly long[] _stock = new long[Order.Length];
    private readonly long[] _rate = new long[Order.Length];

    private Font? _font;
    private Bridge.SimulationHost? _host;
    private int _cellWidth;
    private float _viewportWidth;

    public override void _Ready()
    {
        _font = ThemeDB.FallbackFont;
        _cellWidth = MeasureCellWidth();

        /* The picker reads clicks from _UnhandledInput, so a bar that stopped
           the mouse would silently eat orders aimed at the map beneath it. */
        MouseFilter = MouseFilterEnum.Ignore;

        SetAnchorsPreset(LayoutPreset.TopLeft);
        Size = new Vector2(_cellWidth * Order.Length, BarHeight);
        Recentre();
    }

    public override void _Process(double delta)
    {
        _host ??= GetNodeOrNull<Bridge.SimulationHost>("/root/Main/SimulationHost");

        if (_host is null)
        {
            return;
        }

        Recentre();

        int nation = _host.PlayerNation;
        for (int i = 0; i < Order.Length; i++)
        {
            _stock[i] = _host.StockOf(nation, Order[i]);
            _rate[i] = _host.DailyIncomeOf(nation, Order[i]) / 24;
        }

        QueueRedraw();
    }

    public override void _Draw()
    {
        if (_font is null)
        {
            return;
        }

        Vector2 size = Size;
        float textWidth = _cellWidth - (PadX * 2);

        for (int i = 0; i < Order.Length; i++)
        {
            float left = i * _cellWidth;
            DrawRect(new Rect2(left, 0f, _cellWidth, size.Y), (i & 1) == 1 ? CellLight : CellDark);

            if (i > 0)
            {
                DrawRect(new Rect2(left, 1f, 1f, size.Y - 2f), Divider);
            }

            DrawString(_font, new Vector2(left + PadX, LabelBaseline), Labels[i],
                HorizontalAlignment.Left, textWidth, LabelSize, LabelInk);

            DrawString(_font, new Vector2(left + PadX, ValueBaseline),
                _stock[i].ToString("N0", CultureInfo.InvariantCulture),
                HorizontalAlignment.Right, textWidth, ValueSize, ValueInk);

            DrawString(_font, new Vector2(left + PadX, RateBaseline), RateText(_rate[i]),
                HorizontalAlignment.Right, textWidth, RateSize, RateInk(_rate[i]));
        }

        DrawRect(new Rect2(1f, 1f, size.X - 2f, 1f), TopEdge);
        DrawRect(new Rect2(0f, 0f, size.X, 1f), Edge);
        DrawRect(new Rect2(0f, size.Y - 1f, size.X, 1f), Edge);
        DrawRect(new Rect2(0f, 0f, 1f, size.Y), Edge);
        DrawRect(new Rect2(size.X - 1f, 0f, 1f, size.Y), Edge);
    }

    private void Recentre()
    {
        float width = GetViewportRect().Size.X;
        if (Mathf.IsEqualApprox(width, _viewportWidth))
        {
            return;
        }

        _viewportWidth = width;
        /* Centred in the space left of the nation panel rather than in the
           window. Conflict of Nations offsets its own bar the same way and for
           the same reason: a bar centred on the screen runs under the panel in
           the corner. */
        const float PanelEdge = 372f;
        float span = _cellWidth * Order.Length;
        float free = Mathf.Max(0f, width - PanelEdge);

        Position = new Vector2(PanelEdge + Mathf.Round(Mathf.Max(0f, free - span) * 0.5f), 0f);
    }

    private int MeasureCellWidth()
    {
        if (_font is null)
        {
            return MinCellWidth;
        }

        float widest = 0f;
        for (int i = 0; i < Labels.Length; i++)
        {
            widest = Mathf.Max(widest, _font.GetStringSize(Labels[i], HorizontalAlignment.Left, -1f, LabelSize).X);
        }

        widest = Mathf.Max(widest, _font.GetStringSize(WidestValue, HorizontalAlignment.Left, -1f, ValueSize).X);
        widest = Mathf.Max(widest, _font.GetStringSize(WidestRate, HorizontalAlignment.Left, -1f, RateSize).X);

        return Mathf.Max(MinCellWidth, Mathf.CeilToInt(widest) + (PadX * 2));
    }

    private static string RateText(long rate) => rate > 0
        ? $"+{rate.ToString("N0", CultureInfo.InvariantCulture)} /h"
        : $"{rate.ToString("N0", CultureInfo.InvariantCulture)} /h";

    private static Color RateInk(long rate) => rate switch
    {
        > 0 => Rising,
        < 0 => Falling,
        _ => Flat,
    };
}
