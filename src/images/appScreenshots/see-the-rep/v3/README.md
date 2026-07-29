# See the Rep session preview, version 3

Version 3 starts from the untouched baseline `isession.png` and changes only the small camera-feed tile in the upper-right corner.

Everything else remains baseline content, including:

- The central push-up demonstration
- `8` reps
- `0` weight
- The `0:54` timer
- The `Push-up` title
- `Set 2 of 3`
- All navigation, status, progress, icon, color, and spacing pixels

## Camera-feed source

The replacement tile uses the male goblet-squat photograph from:

`src/assets/images/planJourney/generated/see-the-rep/v2/image.jpg`

## Rebuild and verification

```sh
python3 scripts/build-see-the-rep-camera-feed-v3.py
```

The builder asserts that every changed pixel is contained within the camera-feed rectangle `(648, 355, 858, 667)`.
