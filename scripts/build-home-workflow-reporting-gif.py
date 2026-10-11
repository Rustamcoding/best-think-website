"""Animate only the growing columns on the reporting laptop screen."""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "home-workflow-04-reporting-v1.png"
DESTINATION = ROOT / "assets" / "home-workflow-04-reporting-animated-v3.gif"
SIZE = 512
OUTPUT_SIZE = 256
FRAME_COUNT = 62
FRAME_MS = 100

# Only the four columns on the laptop screen; the report stays unchanged.
BARS = [
    (124, 248, 162, 303),
    (165, 225, 207, 303),
    (210, 201, 255, 303),
    (259, 166, 307, 303),
]


def smoothstep(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def fade(layer, opacity):
    if opacity >= 1:
        return layer
    result = layer.copy()
    result.putalpha(result.getchannel("A").point(lambda value: round(value * opacity)))
    return result


def separate_bars(source):
    pixels = np.asarray(source).copy()
    yy, xx = np.mgrid[:SIZE, :SIZE]
    alpha = pixels[:, :, 3]

    masks = []
    for left, top, right, bottom in BARS:
        inside = (xx >= left) & (xx < right) & (yy >= top) & (yy < bottom)
        masks.append(inside & (alpha > 10))

    all_bars = np.logical_or.reduce(masks)
    base_pixels = pixels.copy()
    base_pixels[all_bars, :3] = (252, 252, 252)
    base = Image.fromarray(base_pixels, "RGBA")
    base_draw = ImageDraw.Draw(base)
    # Remove the original screen bars, including their soft edges, while
    # leaving the laptop frame, axes, and foreground report untouched.
    base_draw.rectangle((120, 151, 307, 302), fill=(252, 252, 252, 254))
    base_draw.line((111, 297, 304, 297), fill="#9bc8f5", width=8)

    layers = []
    for mask in masks:
        layer_pixels = pixels.copy()
        layer_pixels[:, :, 3] = np.where(mask, alpha, 0)
        layers.append(Image.fromarray(layer_pixels, "RGBA"))
    return base, layers


def make_frames(source):
    base, bars = separate_bars(source)
    frames = []

    for index in range(FRAME_COUNT):
        artwork = base.copy()
        if index <= 46:
            bars_opacity = 1.0
        elif index <= 55:
            bars_opacity = 1 - smoothstep((index - 46) / 9)
        else:
            bars_opacity = 0.0

        for bar_index, layer in enumerate(bars):
            progress = smoothstep((index - (11 + bar_index * 7)) / 6)
            if not progress or not bars_opacity:
                continue
            top, bottom = BARS[bar_index][1], BARS[bar_index][3]
            current_top = round(bottom - (bottom - top) * progress)
            visible = layer.copy()
            bar_alpha = np.asarray(visible.getchannel("A")).copy()
            bar_alpha[:current_top, :] = 0
            visible.putalpha(Image.fromarray(bar_alpha))
            artwork.alpha_composite(fade(visible, bars_opacity))

        frames.append(artwork.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS))
    return frames


def save_gif(frames):
    background = Image.new("RGBA", (OUTPUT_SIZE, OUTPUT_SIZE), (245, 248, 252, 255))
    sampled = frames[::6]
    palette_sample = Image.new("RGB", (OUTPUT_SIZE * 4, OUTPUT_SIZE * 3), (245, 248, 252))
    for position, frame in enumerate(sampled):
        palette_sample.paste(
            Image.alpha_composite(background, frame).convert("RGB"),
            ((position % 4) * OUTPUT_SIZE, (position // 4) * OUTPUT_SIZE),
        )
    palette = palette_sample.quantize(colors=255, dither=Image.Dither.NONE)
    values = palette.getpalette()[: 255 * 3]
    indexed_frames = []
    for frame in frames:
        visible = Image.alpha_composite(background, frame).convert("RGB")
        quantized = visible.quantize(palette=palette, dither=Image.Dither.NONE)
        indices = np.asarray(quantized, dtype=np.uint8).copy() + 1
        indices[np.asarray(frame.getchannel("A")) == 0] = 0
        indexed = Image.fromarray(indices, "P")
        indexed.putpalette([0, 0, 0] + values)
        indexed_frames.append(indexed)
    indexed_frames[0].save(
        DESTINATION,
        save_all=True,
        append_images=indexed_frames[1:],
        duration=FRAME_MS,
        loop=0,
        disposal=2,
        transparency=0,
        optimize=True,
    )
    print(f"Saved {DESTINATION} ({DESTINATION.stat().st_size:,} bytes)")


if __name__ == "__main__":
    original = Image.open(SOURCE).convert("RGBA").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    save_gif(make_frames(original))
