# What a description owes its reader

**This file is the single source for how a Delirio asset gets described.** It is
read by two procedures that would otherwise drift apart:

- `.claude/skills/annotate-asset/` in the catalog checkout, which describes
  assets promoted or ingested there.
- `references/creating.md` beside this file, which describes assets generated
  from a consuming repo.

If you are about to write a second account of how to describe an asset, edit this
one instead.

---

A description's reader is **an agent in another repo choosing between assets it
cannot see.** It needs enough to pick correctly and to place the thing on a page.

Cover, in prose — not as a checklist, and not padded to hit a length:

- **What is literally depicted.** Name the letterforms, objects, shapes. "A bold
  capital D", not "a glyph".
- **Its role**, when determinable — the primary brand mark, a UI state icon, a
  splash animation.
- **Composition and safe area.** Full-bleed with no padding? Needs its own
  margin? This is what stops it being placed wrong.
- **Colour and treatment**, including what ground it requires. "White on
  transparency — invisible on light backgrounds."
- **The motion arc**, for animation: first frame, what happens, last frame,
  whether it loops or holds.
- **What it is wrong for.** The single most useful sentence you can write, and
  the one most often missing.

Length follows from content, and the target is density of true specifics.

**There is deliberately no length floor**, because a floor measures the one
property fabrication is best at producing. Inventing detail has no upper bound on
length — "with a slight overshoot at the end" costs nothing to write and is one of
the parts that was false. *Looking* at the asset is what has a cost. So a floor
taxes the honest path and subsidises the other one, and whatever it rejects,
padding clears.

## Write only what you can see

The two procedures that read this file fail in opposite directions, and both
produce the same artifact: confident prose about an image nobody looked at.

- **Describing from the filename.** `toggle-expand` on a wordmark reveal became
  "a chevron rotating with overshoot" — a chevron that exists nowhere in the file.
  The defence is the order: render first, source second, filename last.
- **Describing from the prompt.** A generation prompt says what was **asked
  for**, never what came back, and image models routinely ignore parts of one.
  "Iris with both arms raised" is what you typed; "arms at chest height, palms
  open" may be what arrived. An agent describing its own generation is describing
  something it wanted to succeed, which is a specific and repeatable bias.

Both have the same remedy: **the description is written while looking at the
render, and it describes the render.** If your sentence would have been the same
before the image existed, you have not written a description.

> **Measure anything you are about to state as a fact.** Your reading of a render
> is an impression, and impressions are wrong in a repeatable direction: a
> checkerboard makes antialiased edges look like drop shadows, and a transparent
> ground looks like a white one. Three readings in one sitting were wrong this
> way; two would have landed in a sidecar. If you are about to write "has a soft
> shadow", count the partially-transparent pixels first.

## `kind: screenshot` has a second reader, and a shelf life

A screenshot's reader is not only choosing between assets — they are deciding
whether this capture still resembles the product. So two things belong in the
prose that no other kind needs:

- **Name the screen and the state it is in, in the app's own words.** "The Home
  screen with a plan in progress", then the controls and copy actually on it:
  the labels, the section headings, the button text. Whoever reads it next is
  checking those strings against a running build, and a paraphrase makes that
  impossible. This is also what stops two captures of the same screen in
  different states from being interchangeable in a search result.
- **Say what is accent-tinted and what is not.** The app recolours to the
  selected coach, so a Reed capture reads blue and the same screen under Iris
  reads purple. A description that treats the tint as fixed sends someone to a
  screenshot that will look wrong beside their copy.

Then the pairing, because every screen is catalogued twice:

- **The bare capture** is full-bleed and opaque, with no device frame and no
  system status bar — the app renders none, so the capture begins at the app's
  own top edge. Right for App Store uploads and for compositing into a frame of
  your own.
- **The `-framed` sibling** is the same pixels in an iPhone 17 Pro body over a
  transparent ground, and its status bar is **drawn, not captured**. Say so. It
  is the single most important "wrong for" sentence in the kind: the 9:41 is
  synthesized, which makes the asset wrong anywhere a real device state or a
  different device is required.

Each description should point at its counterpart and say which job it is for.
These two are the case where "what it is wrong for" does the most work, because
the two files look nearly identical in a listing and are not substitutable.

## Referring to other assets is good — and it creates an obligation

The most useful sentences in this catalog point somewhere else. "Prefer the
filled `logo-brand_primary_*` for general use." "Use `icon-brand_app-icon-light_v1`
on light grounds." "The same gym kit as `coach-reed_full-body-default_v1`." An
agent choosing between assets it cannot see is served far better by *this one, not
that one, and here is why* than by any amount of description of one asset alone.
So write them. In a family they are often the single most valuable line.

**But every one is an edge that nothing renders and nothing recompiles.** 52 of
the 125 descriptions carry 69 outbound references today. They are prose: no
foreign key, no import, no build step that breaks. They rot in three ways:

1. **`reclassify` renames the target.** The renamed asset records the old name in
   `previous_ids`, so lookups still resolve — but every *other* asset's prose
   still says the old ID, and nothing rewrote it.
2. **The target is superseded or deprecated.** The reference still resolves, and
   now recommends something retired. `verify` cannot judge this one for you:
   "supersedes X" is a legitimate mention of a retired asset, while "use X" is
   not.
3. **The target is deleted**, and the sentence points at nothing.

So, when you write a reference, **make it worth the maintenance**. Point at a
family prefix (`logo-brand_primary_*`) rather than a specific version where the
advice is about the family. Prefer naming *why* over naming *what* — "use the
white variant on dark grounds" survives a rename; "use
`logo-brand_primary_white_v1`" does not.

> The matching obligation — grepping the catalog for an ID before renaming,
> superseding or retiring the asset that holds it — is catalog-side work and
> lives in `annotate-asset`. It cannot be done from a consuming repo, which has
> no `assets/` tree to grep.

## The fields judged against the render

- `background` — `transparent` | `solid` | `scene`. Read it off the checkerboard:
  checker showing through means transparency, not white.
- `has_visible_text` — does the render show letterforms a viewer reads as text? A
  logo letterform counts. **This is cross-checked**: `extracted.live_text` is
  derived mechanically from the source, and `verify` fails with
  `text-contradiction` if the file contains a live text primitive while you
  claimed no visible text. If you are about to set this `false` on something with
  words in it, look again.
- `motion` — animated formats only. Describe the actual movement, briefly.
- `crop` / `energy` — `kind: coach` only. Leave null elsewhere; `verify` rejects
  them on assets they do not apply to.
