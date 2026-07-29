#!/usr/bin/env python3
"""Replace only the camera-feed tile in the baseline See the Rep screenshot."""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
BASE_SCREEN = ROOT / "src/images/appScreenshots/isession.png"
SUBJECT_PHOTO = ROOT / "src/assets/images/planJourney/generated/see-the-rep/v2/image.jpg"
OUTPUT = ROOT / "src/images/appScreenshots/see-the-rep/v3/image.png"
PIP_BOX = (648, 355, 858, 667)


def cover_crop(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_width, target_height = size
    scale = max(target_width / image.width, target_height / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = max(0, (resized.width - target_width) // 2)
    top = max(0, round((resized.height - target_height) * 0.55))
    return resized.crop((left, top, left + target_width, top + target_height))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius, fill=255)
    return mask


def assert_only_camera_tile_changed(base: Image.Image, result: Image.Image) -> None:
    difference = ImageChops.difference(base, result)
    changed_bounds = difference.getbbox()
    if changed_bounds is None:
        raise AssertionError("The camera-feed replacement produced no pixel changes")

    left, top, right, bottom = changed_bounds
    allowed_left, allowed_top, allowed_right, allowed_bottom = PIP_BOX
    if not (
        left >= allowed_left
        and top >= allowed_top
        and right <= allowed_right
        and bottom <= allowed_bottom
    ):
        raise AssertionError(
            f"Pixels changed outside the camera tile: {changed_bounds}; allowed: {PIP_BOX}"
        )


def main() -> None:
    baseline = Image.open(BASE_SCREEN).convert("RGB")
    result = baseline.copy()
    subject = Image.open(SUBJECT_PHOTO).convert("RGB")

    if baseline.size != (902, 1912):
        raise ValueError(f"Unexpected baseline screenshot size: {baseline.size}")

    tile_size = (PIP_BOX[2] - PIP_BOX[0], PIP_BOX[3] - PIP_BOX[1])
    camera_feed = cover_crop(subject, tile_size)
    result.paste(camera_feed, PIP_BOX[:2], rounded_mask(tile_size, 27))

    # Restore a subtle iOS-style tile edge without touching surrounding pixels.
    ImageDraw.Draw(result).rounded_rectangle(
        (PIP_BOX[0], PIP_BOX[1], PIP_BOX[2] - 1, PIP_BOX[3] - 1),
        radius=27,
        outline=(228, 225, 218),
        width=2,
    )

    assert_only_camera_tile_changed(baseline, result)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.save(OUTPUT, format="PNG", optimize=True)
    print(f"Wrote {OUTPUT}")
    print(f"Changed pixels are confined to {PIP_BOX}")


if __name__ == "__main__":
    main()
