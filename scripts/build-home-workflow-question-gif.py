from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "home-workflow-01-needs-v1.png"
DESTINATION = ROOT / "assets" / "home-workflow-01-needs-animated-v1.gif"
SIZE = 512
FRAME_MS = 100
FRAME_COUNT = 24


def connected_pixels(alpha, seed):
    """Return the alpha-connected icon component around a known point."""
    height, width = alpha.shape
    start_x, start_y = seed
    if alpha[start_y, start_x] == 0:
        raise ValueError(f"The animation seed {seed} is transparent in {SOURCE.name}.")

    mask = np.zeros((height, width), dtype=bool)
    mask[start_y, start_x] = True
    queue = deque([seed])
    while queue:
        x, y = queue.pop()
        for next_x, next_y in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if (
                0 <= next_x < width
                and 0 <= next_y < height
                and not mask[next_y, next_x]
                and alpha[next_y, next_x] > 0
            ):
                mask[next_y, next_x] = True
                queue.append((next_x, next_y))
    return mask


def alpha_layer(source, mask):
    pixels = np.array(source, copy=True)
    pixels[:, :, 3] = np.where(mask, pixels[:, :, 3], 0)
    return Image.fromarray(pixels, "RGBA")


def faded(layer, opacity):
    if opacity >= 1:
        return layer
    result = layer.copy()
    result.putalpha(result.getchannel("A").point(lambda value: round(value * opacity)))
    return result


def centered_scale(layer, scale, y_offset=0):
    bounds = layer.getbbox()
    if bounds is None:
        return layer
    patch = layer.crop(bounds)
    new_size = (max(1, round(patch.width * scale)), max(1, round(patch.height * scale)))
    patch = patch.resize(new_size, Image.Resampling.LANCZOS)
    center_x = (bounds[0] + bounds[2]) / 2
    center_y = (bounds[1] + bounds[3]) / 2 + y_offset
    layer_out = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    layer_out.alpha_composite(
        patch,
        (round(center_x - patch.width / 2), round(center_y - patch.height / 2)),
    )
    return layer_out


def main():
    source = Image.open(SOURCE).convert("RGBA")
    pixels = np.asarray(source)
    red, green, blue, alpha = (pixels[:, :, channel].astype(np.int16) for channel in range(4))
    height, width = alpha.shape

    # The bubble and question mark are one connected, opaque cutout in the source art.
    bubble_mask = connected_pixels(alpha, (950, 330))

    # Pick out the two green accent strokes so they can blink after the bubble appears.
    yy, xx = np.ogrid[:height, :width]
    accent_mask = (
        (alpha > 12)
        & (xx >= 1030)
        & (yy >= 155)
        & (yy <= 270)
        & (green > red * 1.12)
        & (green > blue * 0.92)
        & ((green - red) > 24)
    )
    # Retain the source stroke pixels and its narrow antialiased edge.
    accent_mask = np.asarray(
        Image.fromarray(accent_mask.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(3))
    ) > 0
    accent_mask &= xx < 1160

    # Separate the accent pixels from the rest of the bubble even where a stroke meets its rim.
    bubble_only_mask = bubble_mask & ~accent_mask
    clear_mask = bubble_mask | accent_mask

    base_pixels = np.array(source, copy=True)
    base_pixels[:, :, 3] = np.where(clear_mask, 0, base_pixels[:, :, 3])
    base = Image.fromarray(base_pixels, "RGBA").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    bubble = alpha_layer(source, bubble_only_mask).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    accents = alpha_layer(source, accent_mask).resize((SIZE, SIZE), Image.Resampling.LANCZOS)

    base_bbox = bubble.getbbox()
    accent_bbox = accents.getbbox()
    if base_bbox is None or accent_bbox is None:
        raise ValueError("Could not isolate the question bubble and its accent strokes.")

    print(f"Bubble pixels: {int(bubble_mask.sum())}; accent pixels: {int(accent_mask.sum())}")
    print(f"Bubble bounds at {SIZE}px: {base_bbox}; accent bounds: {accent_bbox}")

    frames = []
    for index in range(FRAME_COUNT):
        # Pop the question bubble in, blink the green accents, then let the icon fade away.
        bubble_opacity, scale = 0.0, 1.0
        if index in (4, 5, 6):
            bubble_opacity, scale = ((0.28, 0.91), (0.62, 0.96), (1.0, 1.0))[index - 4]
        elif 7 <= index <= 14:
            bubble_opacity = 1.0
        elif index in (15, 16, 17):
            bubble_opacity, scale = ((0.82, 1.0), (0.56, 0.99), (0.28, 0.97))[index - 15]

        accent_opacity = {
            6: 0.4,
            7: 0.8,
            8: 1.0,
            9: 0.75,
            10: 0.3,
        }.get(index, 0.0)

        frame = base.copy()
        if bubble_opacity:
            frame.alpha_composite(faded(centered_scale(bubble, scale, y_offset=-index * 0.15), bubble_opacity))
        if accent_opacity:
            frame.alpha_composite(faded(accents, accent_opacity))
        frames.append(frame)

    # Reserve one GIF palette entry for transparency; flatten a copy only for color matching.
    palette_sample = Image.new("RGB", (SIZE * 4, SIZE * 6), (245, 248, 252))
    background = Image.new("RGBA", (SIZE, SIZE), (245, 248, 252, 255))
    for index, frame in enumerate(frames):
        visible = Image.alpha_composite(background, frame).convert("RGB")
        palette_sample.paste(visible, ((index % 4) * SIZE, (index // 4) * SIZE))
    palette = palette_sample.quantize(colors=255, dither=Image.Dither.NONE)
    palette_values = palette.getpalette()[: 255 * 3]

    indexed_frames = []
    for frame in frames:
        visible = Image.alpha_composite(background, frame).convert("RGB")
        quantized = visible.quantize(palette=palette, dither=Image.Dither.NONE)
        indices = np.asarray(quantized, dtype=np.uint8).copy() + 1
        visible_alpha = np.asarray(frame.getchannel("A").convert("1", dither=Image.Dither.FLOYDSTEINBERG))
        indices[visible_alpha == 0] = 0
        indexed = Image.fromarray(indices, "P")
        indexed.putpalette([0, 0, 0] + palette_values)
        indexed_frames.append(indexed)

    indexed_frames[0].save(
        DESTINATION,
        save_all=True,
        append_images=indexed_frames[1:],
        loop=0,
        duration=FRAME_MS,
        disposal=2,
        transparency=0,
        optimize=True,
    )
    print(f"Saved {DESTINATION} ({DESTINATION.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
