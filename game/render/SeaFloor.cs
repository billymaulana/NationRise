using Godot;

namespace NationRise.Game.Render;

/*
   The sea drawn from measured depth instead of from two sine waves. A coarse
   world raster of Natural Earth's isobaths feeds one plane, so the shelf, the
   abyssal plains and the trenches are where the ocean actually puts them.

   Depth alone cannot carry a trench: at the contour resolution this data has,
   the Sunda Trench and the open Pacific floor are both "five to six thousand
   metres" and land on the same colour. What separates them is shape, so the
   gradient of the field is lit like terrain and the walls of the groove do the
   telling.
*/
public sealed partial class SeaFloor : Node3D
{
    private const string FieldPath = "res://data/bathymetry.bin";
    private const uint Magic = 0x4e524254;
    private const int SupportedVersion = 1;

    /* Degrees times 0.1, the same scale the province mesh is built at. */
    private const float WorldWidth = 36f;
    private const float WorldHeight = 18f;

    [Export] public float SeaLevel { get; set; } = -0.05f;
    [Export] public float Relief { get; set; } = 9.0f;
    [Export] public float Grain { get; set; } = 0.16f;

    /* Written as a colour picker shows them; the source_color uniforms convert
       to linear on the way in, which is why nothing here goes through
       MapPalette.ForVertex. */
    /* Toned well down from the reference's turquoise. On this map the Sunda
       Shelf really is shallow for hundreds of miles, so a colour tuned for a
       narrow European coastal strip filled half the screen and drowned the
       land it was supposed to frame. */
    private static readonly Color Shelf = new(0.204f, 0.545f, 0.541f);
    private static readonly Color Slope = new(0.098f, 0.451f, 0.529f);
    private static readonly Color Basin = new(0.055f, 0.271f, 0.404f);
    private static readonly Color Abyss = new(0.027f, 0.129f, 0.235f);
    private static readonly Color Trench = new(0.008f, 0.043f, 0.090f);

    public override void _Ready()
    {
        ImageTexture? field = LoadField(out int width, out int height);
        if (field is null)
        {
            return;
        }

        var material = new ShaderMaterial { Shader = new Shader { Code = ShaderCode } };
        material.SetShaderParameter("depth_field", field);
        material.SetShaderParameter("field_texels", new Vector2(width, height));
        material.SetShaderParameter("shelf", Shelf);
        material.SetShaderParameter("slope", Slope);
        material.SetShaderParameter("basin", Basin);
        material.SetShaderParameter("abyss", Abyss);
        material.SetShaderParameter("trench", Trench);
        material.SetShaderParameter("relief", Relief);
        material.SetShaderParameter("grain", Grain);

        AddChild(new MeshInstance3D
        {
            Name = "Water",
            Mesh = new PlaneMesh { Size = new Vector2(400f, 200f) },
            Position = new Vector3(0f, SeaLevel, 0f),
            MaterialOverride = material,
        });

        CallDeferred(nameof(RetireFlatOcean));
    }

    private static ImageTexture? LoadField(out int width, out int height)
    {
        width = 0;
        height = 0;

        using var file = Godot.FileAccess.Open(FieldPath, Godot.FileAccess.ModeFlags.Read);
        if (file is null)
        {
            GD.PushError($"Cannot open {FieldPath}: {Godot.FileAccess.GetOpenError()}");
            return null;
        }

        if (file.Get32() != Magic || file.Get16() != SupportedVersion)
        {
            GD.PushError($"{FieldPath} is not a depth field this build understands.");
            return null;
        }

        width = file.Get16();
        height = file.Get16();
        file.Get16();

        byte[] samples = file.GetBuffer(width * height);
        if (samples.Length != width * height)
        {
            GD.PushError($"{FieldPath} is short: {samples.Length} of {width * height} samples.");
            return null;
        }

        /* R8 rather than L8: the bytes are depth, not brightness, and a
           luminance format invites the engine to treat them as colour. */
        Image image = Image.CreateFromData(width, height, false, Image.Format.R8, samples);
        image.GenerateMipmaps();

        GD.Print($"Sea floor: {width}x{height} depth samples.");
        return ImageTexture.CreateFromImage(image);
    }

    /*
       The flat ocean plane and the wide band that stood in for a shelf are
       both built inside the province map. Neither has anything left to say now
       that the depth field is drawn, and hiding them here keeps the change out
       of a file three other renderers share.
    */
    private void RetireFlatOcean()
    {
        Node? map = GetNodeOrNull("../ProvinceMap");
        if (map is null)
        {
            GD.PushWarning("Sea floor: no ProvinceMap beside it, flat ocean left in place.");
            return;
        }

        int retired = 0;
        foreach (Node child in map.GetChildren())
        {
            bool legacy = child is MeshInstance3D { Mesh: PlaneMesh } || child.Name == "shelf";
            if (child is MeshInstance3D mesh && legacy)
            {
                mesh.Visible = false;
                retired++;
            }
        }

        GD.Print($"Sea floor: retired {retired} stand-in water surfaces.");
    }

    private const string ShaderCode = """
        shader_type spatial;
        render_mode unshaded, cull_disabled;

        uniform sampler2D depth_field : filter_linear_mipmap, repeat_enable;
        uniform vec2 field_texels;
        uniform vec3 shelf : source_color;
        uniform vec3 slope : source_color;
        uniform vec3 basin : source_color;
        uniform vec3 abyss : source_color;
        uniform vec3 trench : source_color;
        uniform float relief;
        uniform float grain;

        varying vec3 ground;

        void vertex() {
            ground = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
        }

        /* Longitude wraps and the sampler wraps with it, so the Pacific stays
           one ocean across the antimeridian. Latitude must not wrap: folding
           the Arctic onto the Southern Ocean would put a seam at both poles,
           so the outermost row is held instead. */
        vec2 field_uv(vec2 p) {
            float v = clamp(p.y / 18.0 + 0.5, 0.5 / field_texels.y, 1.0 - 0.5 / field_texels.y);
            return vec2(p.x / 36.0 + 0.5, v);
        }

        float depth_at(vec2 p) {
            return texture(depth_field, field_uv(p)).r;
        }

        /* Not the fract(sin(dot(...))) hash: that one leans on sin losing
           precision, and Metal keeps it, so the noise collapses to a constant. */
        float hash(vec2 p) {
            vec3 q = fract(vec3(p.xyx) * 0.1031);
            q += dot(q, q.yzx + 33.33);
            return fract((q.x + q.y) * q.z);
        }

        float value_noise(vec2 p) {
            vec2 cell = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);

            float a = hash(cell);
            float b = hash(cell + vec2(1.0, 0.0));
            float c = hash(cell + vec2(0.0, 1.0));
            float d = hash(cell + vec2(1.0, 1.0));

            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void fragment() {
            vec2 p = ground.xz;
            float depth = depth_at(p);

            /* Stops sit where the data sits rather than at even intervals:
               four fifths of the sea floor falls between two and five
               kilometres, and an even ramp spends most of its range on depths
               almost nothing reaches. */
            /* The bright band is deliberately narrow. Beyond a few hundred
               metres the eye should already be reading open water. */
            vec3 water = mix(shelf, slope, smoothstep(0.00, 0.045, depth));
            water = mix(water, basin, smoothstep(0.10, 0.26, depth));
            water = mix(water, abyss, smoothstep(0.26, 0.46, depth));
            water = mix(water, trench, smoothstep(0.46, 0.75, depth));

            vec2 texel = vec2(36.0 / field_texels.x, 18.0 / field_texels.y);
            float west = depth_at(p - vec2(texel.x, 0.0));
            float east = depth_at(p + vec2(texel.x, 0.0));
            float north = depth_at(p - vec2(0.0, texel.y));
            float south = depth_at(p + vec2(0.0, texel.y));

            vec3 normal = normalize(vec3((west - east) * relief, 1.0, (north - south) * relief));
            vec3 sun = normalize(vec3(-0.55, 0.72, -0.42));

            /* Flat water reads exactly one, so the shelf keeps the colour the
               ramp gave it and only real slope brightens or darkens. */
            float lit = dot(normal, sun) - sun.y;

            /* A coarse mip is the depth of the region around this point, so the
               difference is how far the sea floor drops below its own
               neighbourhood. That is what a trench is, and it is the only thing
               that separates the Sunda Trench from open Pacific floor when both
               sit in the same thousand-metre contour. Held off the shelf, where
               the same term would only outline the coast. */
            float regional = textureLod(depth_field, field_uv(p), 5.0).r;
            float sunk = (depth - regional) * smoothstep(0.16, 0.34, depth);

            float wash = value_noise(p * 0.7) * 0.62 + value_noise(p * 2.9) * 0.38;

            /* The shelf is one flat level with no structure of its own, so it
               leans harder on the grain to avoid reading as painted card. */
            float texture_strength = grain * (1.0 + 0.9 * (1.0 - smoothstep(0.02, 0.22, depth)));

            float shade = 1.0 + lit * 1.5 - sunk * 2.4 + (wash - 0.5) * texture_strength;
            ALBEDO = water * clamp(shade, 0.55, 1.28);
        }
        """;
}
