# Park Dumbbell Curl Hero, V1

The landing-page hero background for all three acquisition cells, replacing
`../../generated/glp1-group-runners/v2`.

## Files

- `source.jpeg`: original supplied file, 2752 by 1536.
- `image.jpg`: web-optimized production asset, 2048 by 1143 (`sips -Z 2048`, quality 82).

## No baked-in scrim — the CSS carries all of it

The image it replaces was generated with a deliberately dark left region, so
`.d3-hero-contrast` only had to top that up to make the hero copy readable. **This photograph is
bright edge to edge** — sunlit foliage and blown-out sky on the left, exactly where the V3 hero
sets its heading. The contrast gradients in `design3.css` were re-tuned to carry the full
readability burden, so they are much heavier than a scrim over a dark photo would need to be.
Swapping in another image without checking those gradients will either wash out the copy or
needlessly mud up a photo that does not need it.

## Composition, and why mobile re-crops

The subject sits at roughly 59–75% of the width, and the left half is empty path and trees.
At a phone viewport `object-fit: cover` shows only the middle ~26% of the width, so the default
`object-position: center` cropped her out of frame entirely and left the hero as anonymous
greenery. Mobile therefore shifts `object-position` toward the subject — see the `max-width: 760px`
block in `design3.css`.

## Provenance

Supplied directly by the project team, not generated and not from the image-generation CLI — which
is why this sits under `supplied/` rather than alongside the `generated/` heroes. Provenance and
licensing for this file were not established in this repo; confirm before it goes out in paid
placements.
