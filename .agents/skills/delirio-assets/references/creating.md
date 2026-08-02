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
  --size 2880x2880 \
  --nobg
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

**On `--nobg`.** Coach assets are transparent — all 104 of them — because they
composite over app UI. `--nobg` runs the cutout through the local BG-removal
sidecar. Without it a coach asset will be **refused at approval** rather than
shipped as an opaque rectangle.

The sidecar has to be running on this machine; the command starts it and waits.
If it cannot, you get an error before anything is spent, never a silent skip.

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
[`prompting.md`](prompting.md).

> **A fringed cutout is not a refine case.** Do not approve it, do not
> regenerate, and do not run another step to "clean up the edges" — the render
> is fine, the cutout is what failed, and a further generation would pay $1.32
> to re-render an image that was already right. The opaque original is saved in
> the catalog's `data/images/` with its generation record. Say that the cutout
> needs redoing in the Images tab with different edge settings —
> `refine_foreground` off preserves solid bright regions like eye whites that
> the refinement pass erodes. That costs nothing.
>
> The distinction worth holding: **refine when the IMAGE is wrong, redo the
> cutout when only its EDGES are.**

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
