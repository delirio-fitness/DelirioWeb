# Writing the prompt

`--prompt` is the only input to `generate` the tool has no opinion about, and it
is the one most likely to waste the money. This file is the standard.

It is short on purpose. So are the prompts.

## What this operation actually is

`generate` always calls OpenAI's **edits** endpoint. References are mandatory —
there is no text-to-image path here, and that changes what a prompt is *for*.

The reference already carries the character, the palette, the lighting, the
3D-Memoji idiom, the proportions, the line weight. **The prompt's only job is to
say what is different from the reference.**

This is the reverse of text-to-image prompting, where you specify everything
because nothing else constrains the model. Here, everything you specify is
something you have taken *out* of the reference's hands and asked the model to
re-derive from a sentence — and a sentence is lossier than the pixels it
describes.

The house style comes from the prompts that actually produced the 104 coach
assets in the catalog. Nearly all of them are one sentence:

> Rotate the character's head at a +/- 45-degree yaw.

> Give this character an expression of surprise.

> Have this character stand straight with their arms to their sides. The palms
> should be facing inward towards their body.

> Imagine this character with a fit body and gym clothes. He should be lean and
> vascular.

That is the target length. **If your prompt is a paragraph, something has gone
wrong.** Go back and find which of the five rules below you broke; it will
usually be more than one.

## Always append the artefact block

gpt-image-2 has an acknowledged model-level defect: a repeating "tiling texture"
that lands hardest on skin and other organic surfaces. OpenAI confirmed it in May
2026 and no fix has shipped. It is the source of the blotchy shading on the coach
bodies, and it is not something the reference or the framing can avoid.

**Append this to every gpt-image-2 prompt, generation or cleanup:**

```
STRICTLY NO cellular texture, NO webbing, NO neural network patterns, NO
repeating Voronoi patterns, NO grain, NO speckled or mottled skin. Skin must be
perfectly smooth with clean even gradients.
```

This is the one sanctioned exception to rules 1 and 3 below. It does not describe
the subject, so it cannot cause the drift those rules exist to prevent — it
describes a rendering failure to avoid.

**On a cleanup pass it is measurably strong.** Feeding an already-finished asset
back in with this block plus "keep the character, pose, proportions, clothing,
framing and expression exactly as they are" improved complexion evenness on 4 of
4 coach assets (−2% to −14%) with identity intact (silhouette IoU 0.949–0.965).
That is now the standard remedy for an existing asset with visible blotching, and
it beats every local filter tried: a filter can only subtract within a frequency
band, while this removes fine noise AND corrects chroma.

**On generation the measurement was ambiguous and the eye won.** Over three runs
each, the block scored slightly WORSE than no block on both automated measures —
but the ranges overlapped, and on inspection the renders with it were judged
cleaner of the artefact specifically. Automated texture metrics disagreed with
human judgement repeatedly during this investigation and were wrong often enough
that human judgement governs. Keep the block; do not re-litigate it from metrics
alone.

Two things that do NOT work, so nobody spends money rediscovering them:

- **Masked inpainting of a region.** The mask is honoured (unmasked pixels move
  by ~1.6 levels against ~25 inside), but gpt-image-2 treats the transparent
  region as empty canvas to fill rather than content to refine, and paints
  something arbitrary — a test on an eye region returned a black bar across the
  face. Cleanup works precisely BECAUSE the model can see the pixels it is
  fixing.
- **`gpt-image-1.5` as an escape.** It rejects custom sizes outright
  (`400 Invalid size` — only 1024x1024, 1024x1536, 1536x1024), so it cannot
  produce a catalog master at all, and its output measured worse than
  gpt-image-2's on every axis.

## The five rules

### 1. Say what changes. Nothing else.

Everything in the reference stays in the reference for free. You do not have to
ask for it, and asking is not free.

### 2. Never use the character's name.

The model has never heard of Reed or Iris. `Reed from the waist up` is not an
instruction — it is a token the model has to resolve against nothing, and what it
does with a name it cannot resolve is invent.

Say **"this character"**. Every prompt that built the catalog does.

### 3. Never restate what should stay the same.

This is the one that feels most like diligence and is most wrong:

> ✗ The same gold-toned 3D character in the Apple-Memoji idiom as the reference,
> unchanged: dark olive flat-brim cap, heavy straight brows, black t-shirt.

The cap, the brows and the shirt are *in the image you are sending*. Naming them
does not pin them down — it moves them from something the model copies to
something the model renders from a description. "Heavy straight brows" is a
weaker specification of those brows than those brows are.

A restated attribute is a re-rendered attribute. That is where drift comes from.

### 4. Never mention the background, transparency, or shadows.

> ✗ Fully transparent background, no shadow and no ground plane.

Three separate reasons this is worse than saying nothing:

- The API's `background` parameter is pinned to `auto` by this tool. The prompt
  cannot change it.
- `gpt-image-2` does not reliably produce clean transparent output anyway. That
  is *why* the local BG-removal sidecar exists.
- So the model cannot give you transparency, and asking makes it render its idea
  of a transparent background instead — flat grey, a checkerboard, a white void
  with a halo. All three are harder to cut out than a plain background.

Transparency is `--nobg`. It is a flag, not a sentence.

### 5. Framing is `--size` and the reference, not prose.

> ✗ Head entirely within the frame with clear margin above the cap and to both
> sides, nothing cropped at any edge. Waist at the lower edge.

The catalog is completely consistent about this, and it is enforced by geometry
rather than by asking:

| | | |
|---|---|---|
| `crop: head` | 80 assets | all square, all 2880×2880 |
| `crop: full-body` | 24 assets | all portrait, all 2160×3840 |

Pick the square size for a head, the portrait size for a body, and give it a
reference already framed the way you want. Then say nothing about framing.

Where framing genuinely is the change you are asking for, it is still a clause,
not a paragraph — "show this character from the waist up" — because the model is
matching a reference, not composing from scratch.

## When you pass more than one reference

This is the one place where describing an image is **required**, and the
distinction matters: you are describing them to *tell them apart*, not to
specify what they contain.

References are sent in `--ref` order, so `--ref A --ref B` makes A image #1 and B
image #2. They arrive with no names, so the model cannot act on a relationship
between them unless you index them:

> Change the character's mouth in image #2 (the one with the dreads and
> mustache) to be just like the character's mouth in image #1 (the bald one).

> Have the character in image #2 glance at their watch with their floating hand,
> wrist, and watch in view. Just like the character in image #1.

The parenthetical carries **one distinguishing feature**, chosen because it
separates the two — bald vs. dreads, male vs. female. Not a description of the
character. If one clause cannot tell them apart, pick a different clause, not a
longer one.

Without the indexing the model will usually blend the two references instead of
transferring a feature from one to the other, which is a plausible-looking result
that is not what you asked for.

## One instruction per generation — then refine

The catalog's own assets were built in steps, not in one shot:

1. `Imagine this character with a fit body and gym clothes. He should be lean and vascular.`
2. `Have this character stand straight with their arms to their sides. The palms should be facing inward towards their body.`

Two prompts, because "what body does this character have" and "what is that body
doing" are separate decisions, and you want to see the first one land before you
commit to the second.

**Do the same thing.** `--ref` takes an earlier candidate as well as a catalog
id, so the second step edits the first result rather than starting over:

```bash
delirio-assets generate --plan --ref <generation-id>#2 --prompt "…" …
```

`<generation-id>#<n>` is the same pair `approve` takes — the id printed when the
generation ran, and the candidate number from the previews. See
[`creating.md`](creating.md) for the loop; what matters *here* is what it does to
the prompt:

**A refinement prompt is shorter than a first prompt, not longer.** It is one
correction to one image you are looking at. Everything else in that image stays
by default, exactly as with a canonical reference — the five rules apply
unchanged, and rule 3 applies hardest, because the temptation to re-describe the
parts you liked is strongest when you can see them.

> ✓ Lower this character's arms to chest height.

> ✓ Open the eyes fully.

> ✓ Remove the shadow under the feet.

If you find yourself writing two corrections, do two steps. One correction per
step is what makes it obvious which one caused a bad result.

**Do not re-prompt from scratch when a candidate is close.** Re-running the
original prompt gives you a different image, not a better one; refining gives you
that image with one thing changed. The first is a lottery and the second is work.

Two things that are specifically about chains:

- **Keep `--size` the same across a chain.** Refining a 1024px candidate at
  2880px does not add detail, it invents it. Pick the final size at step 1. The
  plan warns if you change it.
- **Do not use `--nobg` while iterating at all.** A cutout is not a better thing
  to edit — the model composites onto its own background anyway, and a fringe in
  an intermediate cutout becomes subject matter in the next render. Cut out the
  keeper afterwards with `delirio-assets cutout <generation-id>#<n>`, which is
  free and needs no re-render. (Earlier advice here said "leave `--nobg` until
  the last step", which was unfollowable: `--nobg` is chosen *before* a render
  exists and you only know which step was the last *after*.)

## The worked example

A real plan, refused before it was ever run:

> ✗ Reed from the waist up, front-on and square to camera, eyes looking directly
> at the camera, mouth closed with a faint neutral expression. Both arms relaxed
> at the sides, visible to about the elbow. The same gold-toned 3D character in
> the Apple-Memoji idiom as the reference, unchanged: dark olive flat-brim cap,
> heavy straight brows, black t-shirt. Head entirely within the frame with clear
> margin above the cap and to both sides, nothing cropped at any edge. Waist at
> the lower edge. Fully transparent background, no shadow and no ground plane.

Ninety words, of which about twelve are instructions and the rest are rules
1–5 being broken in order. With a front-on Reed head as the reference, the whole
of it is:

> ✓ Show this character from the waist up, with their arms relaxed at their
> sides.

Front-on, the expression, the cap, the brows and the shirt come from the
reference. The framing comes from `--size`. The transparency comes from `--nobg`.

## Before you show the plan

- Is there a proper noun in it? Take it out.
- Is there an attribute in it that is already visible in the reference? Take it
  out.
- Does it mention background, transparency, shadow, or a ground plane? Take it
  out and use `--nobg`.
- Does it describe the frame? Take it out and set `--size`.
- More than one reference, and no `image #1` / `image #2`? Add them.
- Is it still longer than two sentences? Then either the reference is wrong for
  the job, or you are asking for more than one thing.
