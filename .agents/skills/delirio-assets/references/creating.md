# Creating a new asset from this repo

Read this when the catalog has nothing that fits and a new asset is needed.

`delirio-assets generate` renders a new brand asset from canonical catalog
references and puts it in the catalog, from here, without anyone opening the
DelirioAssetManagement checkout.

**It spends real money and it mints a permanent ID that other repos will pin.**
Everything below exists because of those two facts.

## Before you reach for this: is a new asset actually needed?

Search first, and search properly — the free-text query matches descriptions,
which is where the useful detail lives.

```bash
delirio-assets search iris --kind coach --status current
delirio-assets show coach-iris_head-default_v1
```

**"There is nothing suitable, should I make one?" is a correct and useful answer.**
Say it. It is much better than generating a near-duplicate of something that
already exists, which costs money, adds a permanent ID, and leaves two assets
where a chooser now has to guess between them.

Reach for `generate` when the catalog genuinely lacks the thing: a pose, a scene,
a composition nobody has made. Do not reach for it to resize, recolour or crop
something that exists — that is `fetch --resize`, or a job for the Images tab.

## The two gates

Neither is enforced by the tool. **Both are yours to honour.**

1. **Before spending** — show the resolved plan and wait for a person to agree.
2. **Before it lands in the catalog** — show the image and the description you
   propose to write, and wait again.

The CLI cannot tell whether you actually asked. What it *can* guarantee is that
the operation it runs is the one it printed, via the plan token: you cannot show
one prompt and run another by accident. Deliberate skipping of the gates is on
you, and it is the thing that turns this from a useful tool into a way to fill a
shared catalog with unreviewed images.

## Step 1 — pick canonical references

Every chain is rooted in assets already in the catalog. This is enforced: a file
path is refused, and so is anything not `--status current`. (Later steps of a
chain may reference an earlier candidate instead — step 5b — but the first one
cannot, which is what keeps every generated asset traceable to something
canonical.)

```bash
delirio-assets search iris --kind coach --status current
```

- **One reference per character.** Iris alone → one Iris asset. Iris and Reed
  together → one of each.
- Pick the asset that best constrains what you want. A head-and-shoulders
  reference will not reliably give you a full-body pose.
- **Read the description before choosing.** It will often tell you an asset is
  wrong for what you had in mind.

## Step 2 — build the plan

```bash
delirio-assets generate --plan \
  --ref coach-iris_head-default_v1 \
  --prompt "…" \
  --kind coach --subject iris --variant celebrate \
  --size 2880x2880
```

Nothing is spent. You get back the resolved references, the cost, the ID this
will get, and a token.

**On `--prompt`. Read [`prompting.md`](prompting.md) before you write one.** It
is short, and it is the difference between a $1.32 render you keep and one you
throw away. The one-line version: this is an *edit* of the reference, not a
text-to-image generation, so the prompt says **only what changes** — no character
name, nothing already visible in the reference, nothing about the background or
transparency, nothing about framing. Prompts that work here are one sentence. If
yours is a paragraph, `prompting.md` will tell you which rule you broke.

**On `--size`, which has no default.** Cost scales with pixel count — a 2880×2880
render costs about $1.32; 1024×1024 costs about $0.17. The question you have to
answer is *will this asset be reused elsewhere?*

- **Yes, or you cannot tell** → match the reference asset's own dimensions
  (`show <ref-id>` reports them). Coach masters are 2160–2880px. A downscale is
  always available later; `fetch --resize` refuses to upscale, so a 1024px master
  can never serve a 2880px use.
- **No — a one-off for one screen** → generate at the size that screen needs.

For a coach asset the shape is not a free choice, and it is how framing gets
specified instead of being asked for in the prompt. All 80 `crop: head` assets
are square 2880×2880; all 24 `crop: full-body` assets are portrait 2160×3840.
Match whichever you are making.

**On `--variant`.** It becomes part of a permanent ID that other repos pin.
Reuse the family's existing pattern: if `head-default` and `head-talking` exist,
the next one is `head-listening`, not `listening-head`. Check with `search`.

**On transparency — do NOT reach for `--nobg` here.** Coach assets are
transparent, all 104 of them, because they composite over app UI, and an opaque
one is **refused at approval** rather than shipped as a rectangle. So the cutout
is not optional. But it is a *separate step*, and doing it at generation time is
usually wrong:

```bash
delirio-assets cutout <generation-id>#<n>     # free, local, no re-render
```

The reasoning is about when each decision can be made. `--nobg` has to be chosen
**before** the render exists; which render you want to keep can only be known
**after**. Cutting out every candidate of every step of an iteration chain wastes
time on images you are about to discard, and cutting out none of them used to
leave you stuck — the only way to make a keeper transparent was to pay for
another render of an image you already had. `cutout` is the way out of that, and
it costs nothing.

So: **generate opaque, iterate, then cut out the one you are keeping.** `--nobg`
still exists and is fine when you are confident in one shot — it probes the
sidecar before spending, so a dead sidecar fails before the money does.

Either way, **look at the cutout on the checkerboard before approving it.** A
fringe is invisible on white and is the thing a cutout gets wrong.

**On the supersede warning.** If the plan says `supersedes`, this generation will
retire an existing asset — and the warning names which repos ship it. That is a
decision, not a detail. Show it and let a person decide; a different `--variant`
is usually what was actually wanted.

## Step 3 — show the plan and WAIT

Put the references, the prompt, the size and the dollar cost in front of the
person you are working with, in your own words, and stop.

Do not run step 4 until they have said to.

## Step 4 — run it

```bash
delirio-assets generate --token <token>
```

This spends. Masters are written into the catalog checkout — nothing lands in
this repo except review previews under `tmp/delirio-gen/`.

## Step 5 — look at the previews, then show them

**Read each preview PNG.** The Read tool displays images; that is the point of
them being here.

Previews are composited on a **checkerboard**, deliberately:

- Checker showing through means transparency, not white.
- **With `--nobg`, look at the EDGES.** A halo or a fringe around the subject is
  a bad cutout, and it is invisible against white. This is the single thing the
  checkerboard is for.

Say what you actually see before you say anything else. Then show the image to
the person approving it.

### Always give the full path. Every candidate, every time.

**This is not optional and it is not conditional on being asked.** A 768px
preview rendered inline is enough to notice a pose is wrong and nowhere near
enough to judge an edge, a face, or fine detail — so the person approving will
want to open the real file, and having to ask for the path every time is pure
friction.

List every candidate with its paths, one line each:

```
1  /Users/…/DelirioMarketing/tmp/delirio-gen/a1b2c3d4_1.png   (preview)
   /Users/…/DelirioAssetManagement/data/images/2026-08-01_…_1.png   (full resolution)
2  …
```

The paths are already in the output — `preview` and `path` on each candidate,
both absolute. You do not have to construct or shorten them. Give them whole:
a relative path means nothing to someone who does not know which of four repos
you were run from.

Under `--nobg` there is a third, `original_path` — the opaque original. Include
it. It is what a fringed cutout gets redone from, and it is the file someone
will want the moment the edges are wrong.

The same applies at every later step: when an asset is approved, say where it
landed (`path` in `approve`'s output). Anything this tool writes, name in full.

## Step 5b — expect to refine, and refine rather than re-roll

**The first render is usually not the keeper.** Assume two or three steps, not
one. A candidate that is close but needs cleaning up is the normal outcome, and
there is a command for exactly that:

```bash
delirio-assets generate --plan \
  --ref <generation-id>#2 \
  --prompt "lower this character's arms to chest height" \
  --kind coach --subject iris --variant celebrate \
  --size 2880x2880
```

`<generation-id>#<n>` names one candidate of an earlier generation — the id that
generation printed, and the `pick` number from its previews. It goes wherever a
catalog id goes, so you can mix one with a canonical reference if you need to.

Three things about this that are easy to get wrong:

- **Refine; do not re-roll.** Re-running the original prompt with a tweak gives
  you a *different* image. Referencing the candidate gives you *that* image with
  one thing changed. When something is close, the second is what you want, and
  the difference compounds over a few steps.
- **One correction per step.** Two corrections in one prompt and you cannot tell
  which one caused the result you did not want.
- **Pick the candidate that is closest to right**, not the one whose flaw is
  easiest to describe.

The plan reports a `chain` block once you are past step 1:

```
chain:
  step: 3
  rooted_at: [coach-iris_head-default_v1]
  spent_so_far: $2.64
  chain_total:  $3.96
```

**`chain_total` is the number to say out loud.** The `max_generation_usd`
ceiling is *per call* — five 2880px steps come to about $6.60 without any single
call reaching $5 — so a chain is the one shape that walks past it. Nothing
refuses on your behalf here; the person approving each step is the guard.

At depth 3 the plan adds a warning naming the canonical asset the chain started
from. Each step re-renders the last, so a long chain drifts: **compare the
result against that asset before approving it**, and if it has drifted, start
again from the canonical reference rather than trying to correct your way back.

Both `--size` and `--nobg` have chain rules — see
[`prompting.md`](prompting.md). Do not add a step to "clean up the edges": that
is never a render problem, and step 5c is where it belongs.

## Step 5c — cut out the keeper

Once a candidate is the one, and **before** you ask for approval of anything:

```bash
delirio-assets cutout <generation-id>#<n>
```

Free — the sidecar is local and no re-render happens. It writes the cutout as a
variant of that candidate, so `approve --pick <n>` promotes the cutout with no
extra flag, and it writes a fresh checkerboard preview.

**Skip this only if the asset is genuinely meant to be opaque** (a background, a
marketing composite). For `kind: coach` it is not optional: approval refuses an
opaque one, and it refuses it *after* you have asked a person to look at
something you cannot promote.

Read the new preview and **look at the edges**. `has_alpha` in the output tells
you the cutout produced real transparency at all — if it is `false`, the cutout
failed rather than the image having had no background, and approving is not the
next step.

> **A fringed cutout is not a refine case.** Do not approve it, do not
> regenerate, and do not run another generation step to "clean up the edges" —
> the render is fine, the cutout is what failed, and another generation pays
> $1.32 to re-render an image that was already right. `original_path` is the
> untouched opaque render; **give it in full**, because redoing the cutout means
> opening that exact file. It gets redone in the Images tab in the catalog
> checkout, where the matting model and edge settings are compared by eye —
> `refine_foreground` off preserves solid bright regions like eye whites that the
> refinement pass erodes. That costs nothing.
>
> The distinction worth holding: **refine when the IMAGE is wrong, redo the
> cutout when only its EDGES are, and never pay for a render to fix either.**

## Step 5d — de-mottle the keeper

```bash
delirio-assets denoise <generation-id>#<n>          # --strength light|standard|strong
```

Also free, also local, also no re-render. Run it **after** the cutout, not
before: it cleans whatever the candidate's terminal file is, so after a cutout it
cleans the cutout and leaves the alpha BEN2 produced bit-identical. Doing it the
other way round strands the result and `approve` will ignore it.

**What it is for.** gpt-image renders carry blob-scale, chroma-heavy noise in
low-gradient areas — a broad forehead, the crown of a cap, a throat. It is not
compression, and downscaling does not remove it.

**What it is NOT for.** It does not fix blotchy, patchy-looking shading on a
face. That complaint is face RESOLUTION: a `2160x3840` full-body and a
`2880x2880` head crop have the identical 8.3 MP budget, but the full-body spends
15% of its height on the face against the head crop's 74% — 560-800px of face
versus 2140px. At that size the shading gradations *are* the blotches, and no
filter recovers detail that was never rendered. If the face matters, generate or
source it from a head or chest-up crop. Nor does denoising a reference stop the
next generation being mottled: tested directly, cleaning a reference cut its own
mottle 28% but the derived render's only 10%, because each generation adds its
own regardless.

The output reports `mottle_before` and `mottle_after`. Anchors for reading them:
vector-derived art measures 0.00, the cleanest coach head 0.50, the coach median
0.97, the worst asset in the catalog 2.36.

**Skip it when `mottle_before` is already under 0.6** — the command says so in its
`next` field. Filtering something that does not need it costs detail for nothing.

Look at the preview against `source_path` before approving, on the broad
soft-lit areas, because that is both where the defect lives and where
over-filtering shows first. If skin has gone plastic, re-run at `--strength
light`; if mottle is still visible, `--strength strong`. Both are free, and
neither costs a render.

> Same distinction as the cutout: **this is not a refine case.** Mottle is never
> a reason to pay for another render, and never something to put in a prompt —
> `prompting.md` covers why asking the model about surface quality backfires.

## Step 6 — write the description, then approve

**Read [`describing.md`](describing.md) before writing.** It is the standard both
this procedure and the catalog's own annotation procedure are held to, and it is
short.

The one thing that bites hardest here: **you are describing your own generation,
so you are describing something you wanted to succeed.** The failure is not
inventing an asset that does not exist — you have the image. It is optimistic
reading. You asked for "both arms raised"; if the model returned arms at chest
height, the description says chest height.

A useful check before you write: *would this sentence have been the same before
the image existed?* If yes, you have paraphrased the prompt, not described the
render.

```bash
delirio-assets approve <generation-id> --pick 1 \
  --description "…" \
  --background transparent \
  --has-visible-text false \
  --crop full-body --energy high        # kind: coach only
```

Show the description alongside the image and get agreement on both together. Then
run it.

The classification is **not** re-passed here — it comes from the plan that was
approved, so it cannot drift.

## After it lands

The asset is usable immediately.

```bash
delirio-assets fetch <new-id> --to ./Resources/Coaches --resize 960
```

**Check the size before you ship it.** The catalog holds masters; 112 of 125
assets are over 2 MB. See the main SKILL.md on `--resize` and on `pin`.

Its description is recorded as `agent-written` — an agent wrote it and a person
glanced at it, which is not the same as a person having confirmed the wording.
Someone will confirm it in the catalog's review queue later. Nothing is blocked
meanwhile.

## What still cannot be done from here

- **Lottie animations.** They are authored by a skill in the catalog checkout,
  not generated by a model.
- **Editing an existing catalog asset in place.** Generate a new version, or ask.
- **Marking a description `human-confirmed`.** That belongs to whoever reviews it
  in `/catalog`.
- **Redoing a cutout with different settings.** Images tab, in the catalog
  checkout — the knobs there are the reason it is a manual step.
