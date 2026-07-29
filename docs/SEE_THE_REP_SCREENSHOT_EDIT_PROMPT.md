# See the Rep screenshot edit prompt

This prompt regenerates the central exercise demonstrator in Delirio's original
`isession.png` screenshot as a goblet squat. The final builder separately adds
the matching user camera feed and exact `Goblet squat` title so generated text
cannot corrupt the interface.

## Input roles

- Edit target: `src/images/appScreenshots/isession.png`
- Edit mask: `tmp/imagegen/see-the-rep-v4-mask.png`
- Camera-feed source: `src/assets/images/planJourney/generated/see-the-rep/v2/image.jpg`

## Final image-edit prompt

```text
Use case: precise-object-edit
Asset type: Delirio mobile workout-session screenshot

Primary request:
Replace only the central exercise-demonstration person in the editable region. The new demonstrator must be performing a technically credible goblet squat at the bottom of the repetition, holding one compact black dumbbell vertically against the center of the chest with both hands.

Subject:
One realistic but slightly polished fitness-demonstration avatar, matching the visual role and approximate appearance of the original demonstrator. Adult man, short dark hair, athletic but attainable build, neutral focused expression. He wears a fitted medium-gray sleeveless athletic shirt, medium-gray training shorts, and clean white training shoes. Both feet are fully visible and planted slightly wider than shoulder width. Toes turn out slightly. Knees track over the toes. Hips sit back and down. Chest remains upright. Heels remain on the floor. Elbows point down near the inside of the knees. The black dumbbell is clearly visible and centered at the chest.

Scene and composition:
Keep the demonstrator centered horizontally in the large dark gray exercise area, directly above the existing circular 0:54 timer. Show the full body from head through both shoes. The squat must read instantly at phone-screen size. Preserve generous empty dark-gray space around the demonstrator. Match the original screenshot's soft studio lighting, restrained realism, neutral charcoal backdrop, camera angle, scale, and understated fitness-app demonstration aesthetic.

Invariants:
Change only the central exercise-demonstration person inside the supplied transparent mask. Preserve the dark gray background around him. Do not edit the top-right camera tile. Do not edit the timer, rep count, weight count, exercise title, set label, navigation, status bar, progress bars, icons, colors, typography, spacing, or any other interface element. Do not add any labels or text.

Avoid:
No push-up or plank pose. No barbell. No extra weights. No extra people. No cropped feet. No floating body parts. No incorrect hands or fingers. No distorted dumbbell. No logos. No watermark. No additional interface elements. No redesign of the app.
```

## CLI fallback command

Generate the mask first:

```sh
python3 scripts/build-see-the-rep-session-preview-v4.py --write-mask
```

Run the masked edit with `gpt-image-2`:

```sh
python3 /Users/andersonblanco/.codex/skills/.system/imagegen/scripts/image_gen.py edit \
  --model gpt-image-2 \
  --image src/images/appScreenshots/isession.png \
  --mask tmp/imagegen/see-the-rep-v4-mask.png \
  --prompt-file tmp/imagegen/see-the-rep-v4.prompt.txt \
  --quality high \
  --size 912x1920 \
  --output-format png \
  --out output/imagegen/see-the-rep/v4-avatar-edit.png
```

Finally, composite the approved regions and verify pixel containment:

```sh
python3 scripts/build-see-the-rep-session-preview-v4.py --compose
```

The resulting website asset is written to
`src/images/appScreenshots/see-the-rep/v4/image.png`.
