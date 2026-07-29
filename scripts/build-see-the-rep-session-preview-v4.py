#!/usr/bin/env python3
"""Build the context-aligned See the Rep screenshot, version 4.

The untouched ``isession.png`` file remains the source of truth. The image model
is allowed to propose pixels only for the central exercise demonstrator. This
builder then composites that proposal into the baseline, replaces the small
camera feed with the matching real-user photograph, and updates only the
exercise title to ``Goblet squat``.

Usage:
    python3 scripts/build-see-the-rep-session-preview-v4.py --write-mask
    # Run the documented GPT Image CLI edit using the emitted mask.
    python3 scripts/build-see-the-rep-session-preview-v4.py --compose

The final assertion fails if any changed pixel falls outside the three approved
regions: central demonstrator, camera feed, and exercise title.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BASE_SCREEN = ROOT / "src/images/appScreenshots/isession.png"
SUBJECT_PHOTO = ROOT / "src/assets/images/planJourney/generated/see-the-rep/v2/image.jpg"
MODEL_EDIT = ROOT / "output/imagegen/see-the-rep/v4-avatar-edit.png"
EDIT_MASK = ROOT / "tmp/imagegen/see-the-rep-v4-mask.png"
OUTPUT = ROOT / "src/images/appScreenshots/see-the-rep/v4/image.png"

SCREEN_SIZE = (902, 1912)
AVATAR_BOX = (48, 710, 854, 1452)
PIP_BOX = (648, 355, 858, 667)
TITLE_BOX = (34, 1771, 602, 1887)


def cover_crop(image: Image.Image, size: tuple[int, int], focal_y: float = 0.55) -> Image.Image:
    """Resize and crop a photograph to cover ``size`` around a vertical focal point."""

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
    """Return a solid rounded-rectangle alpha mask."""

    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size[0] - 1, size[1] - 1), radius, fill=255
    )
    return mask


def write_edit_mask() -> None:
    """Write an API mask that exposes only the central demonstrator region."""

    mask = Image.new("RGBA", SCREEN_SIZE, (255, 255, 255, 255))
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(AVATAR_BOX, radius=42, fill=(0, 0, 0, 0))
    EDIT_MASK.parent.mkdir(parents=True, exist_ok=True)
    mask.save(EDIT_MASK, format="PNG", optimize=True)
    print(f"Wrote edit mask: {EDIT_MASK}")


def avatar_blend_mask(size: tuple[int, int]) -> Image.Image:
    """Feather the model edit into the untouched charcoal background."""

    width, height = size
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (28, 28, width - 29, height - 29), radius=44, fill=255
    )
    return mask.filter(ImageFilter.GaussianBlur(radius=22))


def replace_title(result: Image.Image) -> None:
    """Replace only the baseline exercise title with exact local typography."""

    draw = ImageDraw.Draw(result)
    font_path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    title_font = ImageFont.truetype(font_path, 47)
    draw.rectangle(TITLE_BOX, fill=(25, 25, 25))
    draw.text((70, 1798), "Goblet squat", font=title_font, fill=(248, 248, 246))


def assert_changes_are_scoped(base: Image.Image, result: Image.Image) -> None:
    """Reject any final output that mutates pixels outside approved regions."""

    difference = ImageChops.difference(base, result)
    if difference.getbbox() is None:
        raise AssertionError("Version 4 produced no pixel changes")

    allowed = Image.new("L", SCREEN_SIZE, 0)
    allowed_draw = ImageDraw.Draw(allowed)
    for box in (AVATAR_BOX, PIP_BOX, TITLE_BOX):
        allowed_draw.rectangle(box, fill=255)

    outside = ImageChops.multiply(difference.convert("L"), ImageChops.invert(allowed))
    if outside.getbbox() is not None:
        raise AssertionError(f"Pixels changed outside approved regions: {outside.getbbox()}")


def compose() -> None:
    """Compose the model-generated avatar, real camera feed, and exact title."""

    if not MODEL_EDIT.exists():
        raise FileNotFoundError(
            f"Missing model edit: {MODEL_EDIT}. Run the GPT Image CLI edit first."
        )

    baseline = Image.open(BASE_SCREEN).convert("RGB")
    model_edit = Image.open(MODEL_EDIT).convert("RGB").resize(
        SCREEN_SIZE, Image.Resampling.LANCZOS
    )
    subject = Image.open(SUBJECT_PHOTO).convert("RGB")

    if baseline.size != SCREEN_SIZE:
        raise ValueError(f"Unexpected baseline screenshot size: {baseline.size}")

    result = baseline.copy()

    avatar_crop = model_edit.crop(AVATAR_BOX)
    avatar_size = (AVATAR_BOX[2] - AVATAR_BOX[0], AVATAR_BOX[3] - AVATAR_BOX[1])
    result.paste(avatar_crop, AVATAR_BOX[:2], avatar_blend_mask(avatar_size))

    pip_size = (PIP_BOX[2] - PIP_BOX[0], PIP_BOX[3] - PIP_BOX[1])
    camera_feed = cover_crop(subject, pip_size)
    result.paste(camera_feed, PIP_BOX[:2], rounded_mask(pip_size, 27))
    ImageDraw.Draw(result).rounded_rectangle(
        (PIP_BOX[0], PIP_BOX[1], PIP_BOX[2] - 1, PIP_BOX[3] - 1),
        radius=27,
        outline=(228, 225, 218),
        width=2,
    )

    replace_title(result)
    assert_changes_are_scoped(baseline, result)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.save(OUTPUT, format="PNG", optimize=True)
    print(f"Wrote final screenshot: {OUTPUT}")
    print(f"Changed pixels are confined to {AVATAR_BOX}, {PIP_BOX}, and {TITLE_BOX}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-mask", action="store_true")
    parser.add_argument("--compose", action="store_true")
    args = parser.parse_args()

    if not args.write_mask and not args.compose:
        parser.error("choose --write-mask or --compose")
    if args.write_mask:
        write_edit_mask()
    if args.compose:
        compose()


if __name__ == "__main__":
    main()
