using Godot;
using GameResource = NationRise.Core.Economy.Resource;

namespace NationRise.Game.Ui;

/*
   Fonts and icons are read off disk as bytes rather than through ResourceLoader.
   A run without the editor never produces the .import sidecars that a res://
   font or texture resource needs, so loading them the ordinary way returns null
   and the interface drops back to the engine face without saying anything.
*/
public static class UiAssets
{
    private const string FontDirectory = "res://assets/fonts/";
    private const string IconDirectory = "res://assets/icons/";

    private static readonly string[] IconNames =
    [
        "money",
        "manpower",
        "food",
        "fuel",
        "materials",
        "technology",
        "rare-resources",
    ];

    private static Font? _regular;
    private static Font? _semiBold;
    private static Font? _bold;
    private static Font? _mono;
    private static Texture2D?[] _icons = [];

    private static bool _loaded;
    private static bool _themed;

    public static Font? Regular
    {
        get
        {
            Load();
            return _regular;
        }
    }

    public static Font? SemiBold
    {
        get
        {
            Load();
            return _semiBold ?? _regular;
        }
    }

    public static Font? Bold
    {
        get
        {
            Load();
            return _bold ?? _regular;
        }
    }

    /* For readouts laid out as a table of figures. The panels pad those
       columns with spaces, which line up only when every glyph is one width. */
    public static Font? Mono
    {
        get
        {
            Load();
            return _mono ?? _regular;
        }
    }

    public static Texture2D? IconOf(GameResource resource)
    {
        Load();
        int index = (int)resource;
        return index >= 0 && index < _icons.Length ? _icons[index] : null;
    }

    /* One theme on the root window instead of an override per label: theme
       lookup walks the whole node chain above a Control, so every panel picks
       the face up without knowing this class exists. */
    public static void InstallTheme(Window root)
    {
        if (_themed)
        {
            return;
        }

        _themed = true;
        Load();

        if (_regular is null)
        {
            return;
        }

        var theme = new Theme
        {
            DefaultFont = _regular,
            DefaultFontSize = 15,
        };

        root.Theme = theme;
    }

    private static void Load()
    {
        if (_loaded)
        {
            return;
        }

        _loaded = true;

        _regular = LoadFont("TitilliumWeb-Regular.ttf");
        _semiBold = LoadFont("TitilliumWeb-SemiBold.ttf");
        _bold = LoadFont("TitilliumWeb-Bold.ttf");
        _mono = LoadFont("RobotoMono-Variable.ttf");

        _icons = new Texture2D?[IconNames.Length];
        for (int i = 0; i < IconNames.Length; i++)
        {
            _icons[i] = LoadIcon(IconNames[i]);
        }
    }

    private static FontFile? LoadFont(string file)
    {
        string path = FontDirectory + file;
        var font = new FontFile();
        Error error = font.LoadDynamicFont(path);

        if (error == Error.Ok)
        {
            return font;
        }

        GD.PushWarning($"UiAssets: {path} did not load ({error}); the engine fallback face will be used.");
        return null;
    }

    private static ImageTexture? LoadIcon(string name)
    {
        string path = $"{IconDirectory}{name}.png";
        byte[] bytes = Godot.FileAccess.GetFileAsBytes(path);

        if (bytes.Length == 0)
        {
            GD.PushWarning($"UiAssets: {path} is missing.");
            return null;
        }

        var image = new Image();
        Error error = image.LoadPngFromBuffer(bytes);

        if (error != Error.Ok)
        {
            GD.PushWarning($"UiAssets: {path} did not decode ({error}).");
            return null;
        }

        /* Shipped at twice the drawn size so the bar stays sharp when the
           window is scaled; without the mip chain that reduction aliases. */
        image.GenerateMipmaps();
        return ImageTexture.CreateFromImage(image);
    }
}
