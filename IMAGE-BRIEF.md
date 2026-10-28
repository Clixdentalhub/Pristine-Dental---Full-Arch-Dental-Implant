# What to upload to the GHL media library

Measured off the live page at 1440px. Minimum width is 2× the rendered width,
so it stays sharp on a retina screen. Anything larger is fine — GHL resizes on
delivery, which is why the URLs in the page carry `/r_768/` and similar.

---

## 1 · Problem cards — 3 images

Ratio **4:3** · rendered 361×271 · **min 800×600**

These sit directly under their headings, so each has to read as that specific
problem within about a second. Tight, well-lit clinical shots; the current ones
are carried over from the live page and work.

| # | Must show |
| --- | --- |
| 1 | **Loose or ill-fitting dentures** — a denture out of the mouth, or a visibly poor fit |
| 2 | **Several failing or broken-down teeth** — worn, chipped, heavily restored |
| 3 | **A full top or bottom set already gone** — an edentulous arch |

Not: anything smiling or post-treatment. These three are the "before you", not
the promise.

---

## 2 · Team portrait — 1 image

Ratio **1:1** · rendered 342×342 · **min 800×800**

Dr Shabeeb, head and shoulders, centred with room around the head so a square
crop doesn't clip it. The current one is pre-cropped to a circle with
transparent corners, which works, but a plain square crop is easier to reuse.

---

## 3 · Practice gallery — up to 10 images

Ratio **4:3** · rendered 398×298 · **min 800×600**

A horizontal slider under *"Where your treatment happens"*. Pick for variety —
ten near-identical shots read as padding.

Worth including: the treatment room, the CBCT scanner or 3D planning on screen,
reception, the exterior with signage, the team working, the branded car. Avoid
anything with a visible patient face unless consent covers marketing use.

The ten in place now are from the old funnel. The new shoot is almost certainly
better — send whichever you'd put on a brochure.

---

## 4 · Background video — 1 file + 1 still

Sits behind the trust strip (the £1,500 / £250 / £116 figures).

- **MP4**, H.264, **1600px wide**, no audio track (it is muted and can never be
  heard — the track is pure weight), ideally under about 3MB
- **A poster frame** as a separate JPG, same width

It is heavily scrimmed, so it wants slow ambient movement — a room, a walk-in,
hands working. Anything fast or high-contrast fights the text over it.

---

## 5 · The highest-value thing you could send

**Paired before/after photographs of the same patient**, full arch cases.

That section is built and removed only because the images don't exist. Same
framing, same lighting, same angle for each pair. It is the single most
persuasive block on a page like this, and it cannot be faked from a general
practice shoot — which is why I left it out rather than filling it.

Ratio **4:3** · **min 800×600** · 3 pairs = 6 files.

---

## Then

```bash
node set-media.mjs --slots        # what the page still cannot render
node set-media.mjs --fill urls.txt
node set-media.mjs
npm test && node build-ghl.mjs
```
