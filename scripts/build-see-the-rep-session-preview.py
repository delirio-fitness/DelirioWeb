#!/usr/bin/env python3
"""Build the context-aligned See the Rep app screenshot locally.

This compositor intentionally avoids sending Delirio UI or project imagery to an
external image service. It keeps the original app screenshot as the UI source of
truth and replaces only the exercise video, camera tile, exercise title, and
weight value with content aligned to the active carousel photograph.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BASE_SCREEN = ROOT / "src/images/appScreenshots/isession.png"
SUBJECT_PHOTO = ROOT / "src/assets/images/planJourney/generated/see-the-rep/v2/image.jpg"
OUTPUT = ROOT / "src/images/appScreenshots/see-the-rep/v2/image.png"


def cover_crop(image: Image.Image, size: tuple[int, int], focal_y: float = 0.5) -> Image.Image:
    """Resize and crop an image to fill a target rectangle around a vertical focal point."""

    target_width, target_height = size
    scale = max(target_width / image.width, target_height / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = max(0, (resized.width - target_width) // 2)
    available_y = max(0, resized.height - target_height)
    top = round(available_y * min(1, max(0, focal_y)))
    return resized.crop((left, top, left + target_width, top + target_height))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius, fill=255)
    return mask


def centered_text(
    draw: ImageDraw.ImageDraw,
    center_x: int,
    y: int,
    value: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
) -> None:
    bounds = draw.textbbox((0, 0), value, font=font)
    width = bounds[2] - bounds[0]
    draw.text((center_x - width / 2, y), value, font=font, fill=fill)


def main() -> None:
    screen = Image.open(BASE_SCREEN).convert("RGB")
    subject = Image.open(SUBJECT_PHOTO).convert("RGB")

    if screen.size != (902, 1912):
        raise ValueError(f"Unexpected base screenshot size: {screen.size}")

    # Main live-session view. The same source person and goblet-squat repetition
    # now replace the unrelated push-up demonstration.
    main_box = (31, 350, 871, 1442)
    main_size = (main_box[2] - main_box[0], main_box[3] - main_box[1])
    main_feed = cover_crop(subject, main_size, focal_y=0.60)
    main_feed = ImageEnhance.Color(main_feed).enhance(0.78)
    main_feed = ImageEnhance.Brightness(main_feed).enhance(0.70)
    main_feed = ImageEnhance.Contrast(main_feed).enhance(1.08)

    # Fade the photographed feed into the dark Delirio interface at both edges.
    # Clear the old push-up layer first so no original limbs can show through
    # the translucent edge treatment.
    ImageDraw.Draw(screen).rectangle(main_box, fill=(47, 45, 47))
    fade = Image.new("L", main_size, 255)
    fade_pixels = fade.load()
    fade_depth = 105
    for y in range(main_size[1]):
        edge_alpha = min(255, round(255 * min(y / fade_depth, (main_size[1] - 1 - y) / fade_depth)))
        for x in range(main_size[0]):
            fade_pixels[x, y] = max(0, edge_alpha)
    screen.paste(main_feed, main_box[:2], fade)

    # Picture-in-picture camera tile. It uses the identical source photograph,
    # which guarantees the subject, clothing, room, floor, and exercise agree.
    pip_box = (648, 355, 858, 667)
    pip_size = (pip_box[2] - pip_box[0], pip_box[3] - pip_box[1])
    pip_feed = cover_crop(subject, pip_size, focal_y=0.55)
    screen.paste(pip_feed, pip_box[:2], rounded_mask(pip_size, 27))

    draw = ImageDraw.Draw(screen)
    din_font_path = "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"
    arial_font_path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    weight_font = ImageFont.truetype(din_font_path, 76)
    title_font = ImageFont.truetype(arial_font_path, 47)

    # Correct the load to a plausible goblet-squat weight while preserving the
    # existing reps label, timer, weight label, and set counter.
    draw.rectangle((722, 1504, 866, 1628), fill=(42, 39, 41))
    centered_text(draw, 794, 1518, "20", weight_font, (248, 248, 246))

    # Replace only the exercise title inside the existing bottom sheet.
    draw.rectangle((34, 1771, 602, 1887), fill=(25, 25, 25))
    draw.text((70, 1798), "Goblet squat", font=title_font, fill=(248, 248, 246))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    screen.save(OUTPUT, format="PNG", optimize=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
