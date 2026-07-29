# See the Rep session preview, version 2

This app screenshot is a deterministic local composite. It is not an AI-generated redraw of Delirio's interface.

## Purpose

The original screenshot showed three conflicting contexts:

- A long-haired person standing in the camera tile
- A push-up demonstration in the main exercise view
- A `Push-up` exercise title

The active carousel photograph shows a short-haired male user performing a goblet squat. Version 2 aligns the camera tile, main exercise view, title, reps, and weight with that photograph.

## Sources

- Base UI: `src/images/appScreenshots/isession.png`
- Subject and exercise: `src/assets/images/planJourney/generated/see-the-rep/v2/image.jpg`
- Builder: `scripts/build-see-the-rep-session-preview.py`

## Output contract

- Subject: the same male user shown in the active See the Rep photograph
- Exercise: goblet squat
- Reps: 8
- Weight: 20
- Exercise title: `Goblet squat`
- Set: `Set 2 of 3`

Rebuild from the repository root:

```sh
python3 scripts/build-see-the-rep-session-preview.py
```
