# See the Rep session preview, version 4

Version 4 starts from the untouched `isession.png` screenshot and changes only
the three elements required to align the session with the active carousel scene:

- The small upper-right camera feed shows the photographed user performing a
  goblet squat.
- The central exercise demonstrator performs a goblet squat while wearing a
  gray training outfit and white shoes.
- The exercise title reads `Goblet squat`.

Every other interface element remains sourced from the baseline screenshot,
including the status bar, controls, progress bars, rep count, weight count,
timer, set label, colors, and spacing.

## Sources

- Baseline interface: `src/images/appScreenshots/isession.png`
- Camera feed: `src/assets/images/planJourney/generated/see-the-rep/v2/image.jpg`
- Model edit: `output/imagegen/see-the-rep/v4-avatar-edit.png`
- Prompt: `docs/SEE_THE_REP_SCREENSHOT_EDIT_PROMPT.md`
- Builder: `scripts/build-see-the-rep-session-preview-v4.py`

## Rebuild

First write the API mask:

```sh
python3 scripts/build-see-the-rep-session-preview-v4.py --write-mask
```

Run the CLI edit documented in `docs/SEE_THE_REP_SCREENSHOT_EDIT_PROMPT.md`,
then compose and validate the final screenshot:

```sh
python3 scripts/build-see-the-rep-session-preview-v4.py --compose
```

The builder rejects the output if a changed pixel appears outside the approved
central-avatar, camera-feed, or exercise-title regions.
