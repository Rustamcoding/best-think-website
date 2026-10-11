"""Animate the two documents in the third home-page workflow illustration."""

from pathlib import Path
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "home-workflow-03-handover-v1.png"
DESTINATION = ROOT / "assets" / "home-workflow-03-handover-animated-v3.gif"
SIZE = 512
OUTPUT_SIZE = 256
FRAME_COUNT = 30
FRAME_MS = 100
HOLD_MS = 2000


def smoothstep(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def page(kind):
    """Make a clean document in the source artwork's navy-and-blue style."""
    sheet = Image.new("RGBA", (210, 250), (0, 0, 0, 0))
    shadow = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((23, 19, 190, 237), radius=17, fill=(32, 91, 155, 38))
    sheet.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(8)))

    draw = ImageDraw.Draw(sheet)
    draw.rounded_rectangle((16, 11, 182, 229), radius=15, fill="#ffffff", outline="#c6dffc", width=2)
    draw.polygon([(148, 11), (182, 44), (148, 44)], fill="#a8d4ff")
    draw.line([(148, 11), (148, 44), (182, 44)], fill="#80b9f3", width=2)
    draw.rounded_rectangle((39, 70, 143, 82), radius=6, fill="#123d82")
    draw.rounded_rectangle((39, 102, 161, 110), radius=4, fill="#83baf1")
    draw.rounded_rectangle((39, 124, 156, 132), radius=4, fill="#83baf1")
    draw.rounded_rectangle((39, 146, 145, 154), radius=4, fill="#83baf1")
    if kind == 0:
        draw.rounded_rectangle((39, 177, 78, 209), radius=4, fill="#8fc3f5")
        draw.rounded_rectangle((93, 181, 161, 189), radius=4, fill="#83baf1")
        draw.rounded_rectangle((93, 199, 143, 207), radius=4, fill="#83baf1")
    else:
        draw.rounded_rectangle((39, 177, 160, 185), radius=4, fill="#83baf1")
        draw.rounded_rectangle((39, 199, 129, 207), radius=4, fill="#83baf1")
    return sheet


def placed_page(sheet, center, angle, scale):
    target_size = (round(sheet.width * scale), round(sheet.height * scale))
    transformed = sheet.resize(target_size, Image.Resampling.LANCZOS)
    transformed = transformed.rotate(angle, Image.Resampling.BICUBIC, expand=True)
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    layer.alpha_composite(
        transformed,
        (round(center[0] - transformed.width / 2), round(center[1] - transformed.height / 2)),
    )
    return layer


def static_layers(source):
    """Retain the original folder, check and curved arrow; only papers change."""
    pixels = np.asarray(source).copy()
    yy, xx = np.mgrid[:SIZE, :SIZE]
    blue = pixels[:, :, 2].astype(np.int16)
    green = pixels[:, :, 1].astype(np.int16)
    red = pixels[:, :, 0].astype(np.int16)

    # The top of the folder's rear pocket is reconstructed behind the papers.
    pocket = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pocket_draw = ImageDraw.Draw(pocket)
    pocket_draw.rounded_rectangle((84, 257, 425, 336), radius=24, fill="#082f68")
    pocket_draw.rounded_rectangle((92, 261, 421, 329), radius=20, fill="#0b3d83")

    # Original folder artwork begins at the front lip. It always stays fixed.
    folder = source.copy()
    folder_alpha = np.asarray(folder.getchannel("A")).copy()
    folder_alpha[yy < 282] = 0
    # The original foreground page overlaps the lip by a few pixels. Clear
    # those pale remnants so a stationary white wedge does not remain behind
    # the alternating documents.
    pale_page_remnant = (yy < 311) & (red > 172) & (green > 172) & (blue > 172)
    folder_alpha[pale_page_remnant] = 0
    folder.putalpha(Image.fromarray(folder_alpha))

    # Isolate the saturated blue arrow without keeping either source document.
    arrow = source.copy()
    arrow_alpha = np.asarray(arrow.getchannel("A")).copy()
    arrow_mask = (
        (xx >= 339)
        & (yy >= 162)
        & (yy < 313)
        & (blue > red * 1.35)
        & (blue > green * 1.09)
        & (blue > 140)
    )
    arrow_alpha[~arrow_mask] = 0
    arrow.putalpha(Image.fromarray(arrow_alpha))
    return pocket, folder, arrow


def make_frames(source):
    pocket, folder, arrow = static_layers(source)
    sheets = [page(kind) for kind in range(2)]
    frames = []
    for index in range(FRAME_COUNT):
        # Both papers complete the same circular route in one direction.
        # The last frame of each exchange is held for exactly two seconds.
        if index < 15:
            phase = math.pi * smoothstep((index + 1) / 15)
        else:
            phase = math.pi + math.pi * smoothstep((index - 14) / 15)
        orbit = []
        for kind, sheet in enumerate(sheets):
            angle = 2.4 + phase + math.pi * kind
            frontness = (math.sin(angle) + 1) / 2
            center = (246 + 69 * math.cos(angle), 159 + 33 * math.sin(angle))
            tilt = 6 - 22 * math.cos(angle)
            scale = 0.70 + 0.24 * frontness
            orbit.append((frontness, placed_page(sheet, center, tilt, scale)))

        frame = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        frame.alpha_composite(pocket)
        for _, document in sorted(orbit, key=lambda item: item[0]):
            frame.alpha_composite(document)
        frame.alpha_composite(arrow)
        frame.alpha_composite(folder)
        frames.append(frame)
    return frames


def save_gif(frames):
    # Use one palette for all frames so the background and colors do not flash.
    frames = [frame.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS) for frame in frames]
    background = Image.new("RGBA", (OUTPUT_SIZE, OUTPUT_SIZE), (245, 248, 252, 255))
    sampled_frames = frames[::3]
    sample = Image.new("RGB", (OUTPUT_SIZE * 4, OUTPUT_SIZE * 3), (245, 248, 252))
    for position, frame in enumerate(sampled_frames):
        sample.paste(
            Image.alpha_composite(background, frame).convert("RGB"),
            ((position % 4) * OUTPUT_SIZE, (position // 4) * OUTPUT_SIZE),
        )
    palette = sample.quantize(colors=255, dither=Image.Dither.NONE)
    values = palette.getpalette()[: 255 * 3]
    encoded = []
    for frame in frames:
        visible = Image.alpha_composite(background, frame).convert("RGB")
        quantized = visible.quantize(palette=palette, dither=Image.Dither.NONE)
        indices = np.asarray(quantized, dtype=np.uint8).copy() + 1
        indices[np.asarray(frame.getchannel("A")) == 0] = 0
        indexed = Image.fromarray(indices, "P")
        indexed.putpalette([0, 0, 0] + values)
        encoded.append(indexed)
    durations = [FRAME_MS] * FRAME_COUNT
    durations[14] = HOLD_MS
    durations[29] = HOLD_MS
    encoded[0].save(
        DESTINATION,
        save_all=True,
        append_images=encoded[1:],
        duration=durations,
        loop=0,
        disposal=2,
        transparency=0,
        optimize=True,
    )
    print(f"Saved {DESTINATION} ({DESTINATION.stat().st_size:,} bytes)")


if __name__ == "__main__":
    source_image = Image.open(SOURCE).convert("RGBA").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    save_gif(make_frames(source_image))
