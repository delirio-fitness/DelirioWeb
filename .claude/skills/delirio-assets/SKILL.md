---
name: delirio-assets
description: Find and pull Delirio's shared visual assets — coach art (Reed, Iris), logos, icons, backgrounds, marketing imagery, Lottie animations. Use when a task needs a brand or character asset, when an asset is missing or looks wrong or out of date, when adding an image to this repo, or when checking whether committed assets are still current.
---

# Delirio Assets

Delirio's finished visual assets live in one committed catalog, reachable from
any repo on this machine through the `delirio-assets` CLI. Search it before
asking anyone for a file, and before adding an image to this repo by hand.

**This skill is read-only.** Assets are created and promoted in the
DelirioAssetManagement checkout, not here.

> Installed by `delirio-assets install-skill`. Do not hand-edit — the next
> install replaces it, and `delirio-assets check` reports it stale when the
> source moves on. Fixes belong in DelirioAssetManagement.

## Is it available?

```bash
delirio-assets doctor
```

If the command is missing, the catalog checkout hasn't been linked on this
machine. Say so and stop — do not fall back to hunting for files in Google
Drive or copying an asset from another repo. Setup is `make install` in the
DelirioAssetManagement checkout, which the owner runs once.

## Finding an asset

```bash
delirio-assets search reed --kind coach --status current
delirio-assets show coach-reed_celebrate_v3
```

- **Always pass `--status current`** unless you specifically want history.
  `search` returns superseded and deprecated entries too, and a superseded asset
  looks entirely usable from its metadata.
- Filters: `--kind` `--subject` `--variant` `--treatment` `--format` `--status`
  `--review`. `kind` is one of `coach | icon | logo | background | marketing`;
  `subject` is `reed | iris | base | brand | none`.
- The free-text query matches the description, which is where the useful detail
  lives — what the asset depicts, what ground it needs, and what it is wrong for.
  **Read the description before choosing.** It will often tell you an asset is
  unsuitable for what you had in mind.

### Check `stale.behind` before trusting an empty result

Every response carries `stale: { behind, checked }`.

```
behind === 0     verified current
behind > 0       this checkout is behind origin — it is MISSING assets added since
behind === null  the check could not run (offline, no upstream) — treat as possibly stale
```

**Branch on `stale.behind !== 0`, never `> 0`.** An empty search result from a
stale checkout is indistinguishable from "that asset does not exist," and `null`
means "we don't know," which must never collapse into "you're current." If it is
non-zero, say the catalog may be out of date rather than reporting that an asset
is missing.

## Pulling one into this repo

```bash
delirio-assets fetch coach-reed_celebrate_v3 --to ./Resources/Coaches --lock
```

`--lock` writes `.delirio-assets.lock` here, recording the version and checksum
of what you took. **Commit that lockfile alongside the bytes.** It is the only
thing that can later answer "which render is in the shipped build" — the copied
file carries no identity of its own.

`fetch` refuses to overwrite an existing file and names `--force` if you really
mean it. That refusal is deliberate: an asset id can collide with a hand-written
file in this repo, and silently replacing it would be the worst outcome. Look at
what is already there before forcing.

A retired id still resolves — if an asset was reclassified, `fetch` follows the
old name, tells you the new one, and pins the new one. Update your references.

## Recording an asset this repo already has

`fetch` is for taking a copy. Most assets already in a repo are not that shape:
they have been **resized** for the bundle, or **renamed** because an Xcode
imageset or an asset loader dictates the filename. Fetching over those would
either drop a multi-megabyte master into a shipping bundle or leave a second
copy under a name nothing loads.

`pin` records the relationship and copies nothing:

```bash
delirio-assets pin coach-iris_head-default_v1 \
  --file DelirioShared/SharedAssets.xcassets/.../Iris_default.png \
  --derived-by "sips -z 960 960"
```

It **hashes your file and compares it with the catalog's** rather than believing
you:

- **Byte-identical** → recorded as an exact copy. Passing `--derived-by` here is
  refused, because it would be untrue.
- **Different** → `--derived-by` is **required**. State the transform that
  produced the file. Whoever refreshes it after the master changes needs to
  reproduce it, and it is what stops a mistyped `--file` from quietly pinning an
  unrelated image.

Use `pin` when you add an asset to this repo in any form other than a straight
copy — a resize, a re-encode, a format conversion, a rename. An unpinned file is
invisible to `check` forever after.

## Checking what you already have

```bash
delirio-assets check
```

Run it from this repo (it reads the local `.delirio-assets.lock`). It reports
anything **superseded**, **deprecated**, **renamed**, or **byte-drifted** since
you took it, each with a remedy. Worth running when something looks out of date,
and worth wiring into CI.

The remedy differs by how the file got here, which is why `pin` measures it: an
exact copy is re-fetched, a derived one is re-derived with the transform the
lockfile recorded. **Follow the remedy given** — running `fetch` over a derived
file replaces a bundle-sized asset with a full-resolution master.

## What you cannot do from here

Promoting a new asset into the catalog, and writing or editing descriptions.
Both happen in the DelirioAssetManagement checkout, because both require looking
at the asset and asking the owner about things no file can answer. If this repo
has produced something worth keeping, say so and hand it over — do not copy it
into `assets/` anywhere.

`pin` is not an exception to this. It records that a file here came from an
asset that is **already in the catalog**; it cannot put anything into one.

## Output shape

JSON by default; `--human` pretty-prints. Success is
`{ ok: true, stale, data }`; failure is `{ ok: false, stale, error, remedy }`.
**Read `remedy` before improvising** — it names the actual next command.
