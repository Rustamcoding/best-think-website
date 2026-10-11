from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "home-workflow-02-agreement-v1.png"
DESTINATION = ROOT / "assets" / "home-workflow-02-agreement-animated-v5.gif"
SIZE = 512
FRAME_MS = 100
FRAME_COUNT = 62
# The document/check are absent across the loop boundary. The GIF encoder
# merges identical frames, so these short durations yield a 500 ms visual pause.
FRAME_DURATIONS = [FRAME_MS] * FRAME_COUNT
for blank_index in range(56, FRAME_COUNT):
    FRAME_DURATIONS[blank_index] = 30
for blank_index in range(9):
    FRAME_DURATIONS[blank_index] = 30 if blank_index < 4 else 20


def smoothstep(progress):
    progress = max(0.0, min(1.0, progress))
    return progress * progress * (3 - 2 * progress)


def apply_mask(image, mask):
    pixels = np.array(image, copy=True)
    pixels[:, :, 3] = np.where(mask, pixels[:, :, 3], 0)
    return Image.fromarray(pixels, "RGBA")


def fade(image, opacity):
    if opacity >= 1:
        return image
    result = image.copy()
    result.putalpha(result.getchannel("A").point(lambda value: round(value * opacity)))
    return result


def centered_mark(image, center, scale):
    bounds = image.getbbox()
    if bounds is None:
        return image
    patch = image.crop(bounds)
    size = (max(1, round(patch.width * scale)), max(1, round(patch.height * scale)))
    patch = patch.resize(size, Image.Resampling.LANCZOS)
    result = Image.new("RGBA", image.size, (0, 0, 0, 0))
    result.alpha_composite(
        patch,
        (round(center[0] - patch.width / 2), round(center[1] - patch.height / 2)),
    )
    return result


def make_masks(source):
    rgba = np.asarray(source).astype(np.int16)
    red, green, blue, alpha = (rgba[:, :, channel] for channel in range(4))
    yy, xx = np.mgrid[:SIZE, :SIZE]

    # Keep the handshake in front of the rising page. Warm tones isolate the hands;
    # the two narrow side zones preserve the blue sleeves and white cuffs.
    warm = (
        (alpha > 12)
        & (yy >= 244)
        & (xx >= 150)
        & (xx <= 385)
        & (red > 82)
        & (red > green * 1.045)
        & (green > blue * 1.045)
    )
    # Preserve only the small visible cuff edges where they overlap the page.
    # A broad white-color mask also selected the paper and left static white ghosts.
    cuff_shape = Image.new("L", (SIZE, SIZE), 0)
    cuff_draw = ImageDraw.Draw(cuff_shape)
    cuff_draw.polygon([(151, 252), (179, 265), (174, 280), (147, 268)], fill=255)
    cuff_draw.polygon([(343, 267), (370, 253), (378, 269), (350, 282)], fill=255)
    cuffs = (
        (np.asarray(cuff_shape) > 0)
        & (alpha > 12)
        & (rgba[:, :, :3].max(axis=2) - rgba[:, :, :3].min(axis=2) < 38)
        & (red > 165)
    )

    sleeve_zones = (
        (((xx >= 140) & (xx <= 190)) | ((xx >= 340) & (xx <= 390)))
        & (yy >= 245)
        & (yy <= 300)
    )
    blue_sleeves = (
        (alpha > 12)
        & sleeve_zones
        & (blue > red * 1.18)
        & (blue > green * 0.92)
    )

    hand_mask = Image.fromarray((warm | cuffs | blue_sleeves).astype(np.uint8) * 255)
    hand_mask = hand_mask.filter(ImageFilter.MaxFilter(3)
    )
    hand_mask = np.asarray(hand_mask) > 0

    # The source paper occupies this rounded, folded-corner silhouette. A slightly
    # wider box also clears its faint shadow so no stationary paper ghost remains.
    sheet = Image.new("L", (SIZE, SIZE), 0)
    draw = ImageDraw.Draw(sheet)
    draw.polygon(
        [(160, 72), (326, 72), (377, 122), (377, 286), (151, 286), (151, 83)],
        fill=255,
    )
    sheet_mask = np.asarray(sheet) > 0

    # Isolate the green approval disk and its white check from the existing artwork.
    check_circle = (
        (alpha > 16)
        & (xx >= 275)
        & (xx <= 349)
        & (yy >= 190)
        & (yy <= 263)
        & (green > red * 1.16)
        & (green > blue * 0.91)
        & ((green - red) > 22)
    )
    check_circle_image = Image.fromarray(check_circle.astype(np.uint8) * 255)
    # Include the soft glow around the badge so it disappears with the badge,
    # instead of leaving a faint circular imprint on the blank page.
    check_circle = np.asarray(check_circle_image.filter(ImageFilter.MaxFilter(15))) > 0
    white_tick = (
        (alpha > 70)
        & (xx >= 286)
        & (xx <= 337)
        & (yy >= 207)
        & (yy <= 245)
        & (rgba[:, :, :3].min(axis=2) > 221)
    )
    check_mask = check_circle | white_tick

    clear_mask = sheet_mask & ~hand_mask
    paper_mask = sheet_mask & ~hand_mask
    return clear_mask, hand_mask, paper_mask, check_mask


def build_frames(source, base, paper, approval, hand_mask):
    frames = []
    start_offset = 205
    center = (312, 227)
    # The paper is visible only above the handshake. Its lower edge stays
    # concealed, so the first frame never shows a sheet below the hands.
    behind_hands = np.broadcast_to(
        np.arange(SIZE)[:, None] < 267, (SIZE, SIZE)
    ) & ~hand_mask

    for index in range(FRAME_COUNT):
        if index <= 3:
            offset, mark_opacity, mark_scale, document_opacity = start_offset, 0.0, 0.72, 1.0
        elif 4 <= index <= 31:
            progress = (index - 4) / 27
            offset = round(start_offset * (1 - smoothstep(progress)))
            mark_opacity, mark_scale, document_opacity = 0.0, 0.72, 1.0
        elif index <= 34:
            offset, mark_opacity, mark_scale, document_opacity = 0, 0.0, 0.72, 1.0
        elif 35 <= index <= 40:
            progress = smoothstep((index - 35) / 5)
            offset, mark_opacity = 0, progress
            mark_scale, document_opacity = 0.72 + 0.28 * progress, 1.0
        elif index <= 47:
            offset, mark_opacity, mark_scale, document_opacity = 0, 1.0, 1.0, 1.0
        elif 48 <= index <= 56:
            progress = smoothstep((index - 48) / 8)
            offset, mark_opacity, mark_scale, document_opacity = 0, 1.0, 1.0, 1 - progress
        else:
            offset, mark_opacity, mark_scale, document_opacity = start_offset, 0.0, 0.72, 0.0

        document = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        if index <= 56:
            moving_paper = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
            moving_paper.alpha_composite(paper, (0, offset))
            moving_alpha = np.array(moving_paper.getchannel("A"), copy=True)
            moving_alpha[~behind_hands] = 0
            moving_paper.putalpha(Image.fromarray(moving_alpha))
            document.alpha_composite(moving_paper)

        if mark_opacity and index <= 56:
            mark = centered_mark(approval, center, mark_scale)
            mark_alpha = np.array(mark.getchannel("A"), copy=True)
            mark_alpha[~behind_hands] = 0
            mark.putalpha(Image.fromarray(mark_alpha))
            document.alpha_composite(fade(mark, mark_opacity))

        frame = base.copy()
        frame.alpha_composite(fade(document, document_opacity))
        frames.append(frame)

    return frames


def save_gif(frames):
    # A shared palette keeps colors stable while the sheet moves; palette entry 0
    # is reserved for transparency so the site's card background shows through.
    background = Image.new("RGBA", (SIZE, SIZE), (245, 248, 252, 255))
    palette_sample = Image.new(
        "RGB", (SIZE * 5, SIZE * ((FRAME_COUNT + 4) // 5)), (245, 248, 252)
    )
    for index, frame in enumerate(frames):
        visible = Image.alpha_composite(background, frame).convert("RGB")
        palette_sample.paste(visible, ((index % 5) * SIZE, (index // 5) * SIZE))

    palette = palette_sample.quantize(colors=255, dither=Image.Dither.NONE)
    palette_values = palette.getpalette()[: 255 * 3]
    indexed_frames = []
    for frame in frames:
        visible = Image.alpha_composite(background, frame).convert("RGB")
        quantized = visible.quantize(palette=palette, dither=Image.Dither.NONE)
        indices = np.asarray(quantized, dtype=np.uint8).copy() + 1
        visible_alpha = np.asarray(frame.getchannel("A").convert("1"))
        indices[visible_alpha == 0] = 0
        indexed = Image.fromarray(indices, "P")
        indexed.putpalette([0, 0, 0] + palette_values)
        indexed_frames.append(indexed)

    indexed_frames[0].save(
        DESTINATION,
        save_all=True,
        append_images=indexed_frames[1:],
        loop=0,
        duration=FRAME_DURATIONS,
        disposal=2,
        transparency=0,
        optimize=True,
    )
    print(f"Saved {DESTINATION} ({DESTINATION.stat().st_size:,} bytes)")


def main():
    source = Image.open(SOURCE).convert("RGBA").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    clear_mask, hand_mask, paper_mask, check_mask = make_masks(source)

    base = source.copy()
    base_pixels = np.asarray(base).copy()
    base_pixels[:, :, 3] = np.where(clear_mask, 0, base_pixels[:, :, 3])
    base = Image.fromarray(base_pixels, "RGBA")
    paper = apply_mask(source, paper_mask)
    # Put clean paper beneath the separately animated badge. Leaving the badge
    # pixels transparent here exposes a visible circular hole during the rise.
    paper_pixels = np.asarray(paper).copy()
    paper_pixels[check_mask] = (252, 252, 252, 255)
    paper = Image.fromarray(paper_pixels, "RGBA")
    approval = apply_mask(source, check_mask)

    print(
        "Cleared sheet pixels: "
        f"{int(clear_mask.sum()):,}; preserved handshake pixels: {int(hand_mask.sum()):,}; "
        f"approval pixels: {int(check_mask.sum()):,}"
    )
    save_gif(build_frames(source, base, paper, approval, hand_mask))


if __name__ == "__main__":
    main()
