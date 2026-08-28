# Pristine Dental Group — Full Arch Implant Campaign

A two-page lead-generation funnel for the full arch dental implant campaign
(£1,500 off · from £116/month · free consultation and CBCT scan worth £250 ·
5-year 0% finance), built on the house design system in `PROMPTPACK.md`.

| File | What it is |
| --- | --- |
| `index.html` | The funnel page. Self-contained: HTML + CSS + vanilla JS, no framework, no build step, no external JS. |
| `thank-you.html` | Post-submission confirmation, on the same tokens, header and footer. Permanently `noindex`. |
| `tests/` | Playwright verification harness — 7 widths, contrast maths, form behaviour, typography line boxes, screenshots. |
| `build.mjs` | Deployment build: inlines every local image as a data URI and prints what still needs setting. |
| `sync-head.mjs` | Copies `<head>` from `index.html` into the other documents so the token block cannot drift. |

```bash
npm install
node tests/fonts/fetch.mjs   # once — see the note below
npm test          # the verification harness
npm run serve     # http://127.0.0.1:4321
npm run build     # → dist/, plus the pre-publish checklist
node make-preview.mjs preview   # → preview/, for a hosted preview
```

`make-preview.mjs` emits the two documents without `<!doctype>`, `<html>`,
`<head>` or `<body>` — a host that supplies its own wrapper needs the page
content only. It also swaps the map embed for an address panel with an outbound
link, because frame embedding is commonly blocked on preview hosts, and takes
`FUNNEL_URL` / `THANKS_URL` so the form still forwards correctly between two
separately hosted pages. Nothing about the design changes.

---

## Before this can go live

`noindex` is in the `<head>` of `index.html` and stays there until the list
below is empty. `npm run build` prints the current list — it reads the
documents rather than this file, so it cannot go stale.

**Blocking — the page does not work without these**

1. **Phone number.** Every click-to-call currently points at the form
   (`data-needs="phone"`). Swap those to `href="tel:+44…"`.
2. **WhatsApp number.** Two CTAs reference it (`data-needs="whatsapp"`).
   Ad copy 2, 4 and 5 all promise "WhatsApp us a photo".
3. **Form endpoint.** `ENDPOINT` in `index.html` is `null`, so the form
   validates, shows its success state and forwards to the thank-you page
   **without posting the lead anywhere**. Set it before spending a penny on ads.
4. **Conversion tag.** One clearly marked block at the foot of
   `thank-you.html`. The funnel page deliberately fires nothing on submit —
   fire it in one place or every lead counts twice. IDs found on the current
   live page, for reference: GTM `GTM-P5KXR2DS`, Meta Pixel `773289062042919`.
5. **Photography.** 12 images, listed by `npm test`. Each missing file renders
   as a labelled slot naming the expected filename and dimensions, so the page
   is legible without them — but they are placeholders, not a design choice.

**Commercial — check these against what the practice will actually honour**

6. **Full mouth (both arches) price and monthly figure.** The brief gives
   single-arch numbers only. `£13,500` / `£225` are bracketed guesses derived
   from doubling the single-arch price, and are almost certainly wrong.
7. **The "was" price.** `£8,500` is inferred from £7,000 + £1,500 off. If the
   pre-discount price was never £8,500, the discount claim is not substantiated
   and must be reworded — CAP rules on savings claims apply.
8. **Single implant at £795 / £13.25pm.** Carried over from the current live
   page, not from this campaign brief. Confirm it is still current or drop the card.
9. **Opening hours**, and whether concierge pick-up has a catchment radius.

**Regulatory — do not publish without these**

10. **GDC numbers** — practice registration and Dr Shabeeb's.
11. **Company number** and registered details.
12. **Finance provider name and FCA firm reference number**, plus the correct
    permission wording. Appointed-representative status reads differently from
    direct authorisation and the footer must match the register.
13. **Privacy policy, terms and complaints procedure URLs.**
14. **Patient photo consent** on file for every before-and-after image.
15. **Review provenance.** The quotes are carried over from the practice's own
    live page. Verify each against the Google listing before publishing; the
    ninth is a bracketed placeholder.
16. Sedation availability, treatment timeline, and any warranty — three FAQ
    answers carry a bracketed note where the brief was silent.

---

## Colour, proven rather than eyeballed

The full token block sits in one `:root` in `index.html`. Every pair is
computed from relative luminance by `tests/contrast.spec.mjs`, which measures
what the browser actually rendered on every dark band rather than checking the
tokens against themselves.

The rule that drives the palette: **a CTA sitting on a dark band almost never
passes contrast in its normal colour.** `--color-accent` (`#96610F`) is 5.23:1
with white text on the light ground, but only 1.7:1 against `--color-primary`.
`--cta-on-dark` (`#F2C14E`) exists for that case and measures 11.16:1 against
the dark band, with `--cta-on-dark-text` at 11.05:1 on top of it. The same
applies to errors: `--color-error` fails on the dark form card, so
`--color-error-on-dark` (`#FF9C8E`, 9.28:1) is what the form actually uses.

| Pair | Ratio | Needs |
| --- | --- | --- |
| `--color-on-primary` on `--color-primary` | 18.73:1 | 4.5 |
| `--color-on-primary-mut` on `--color-primary` | 10.36:1 | 4.5 |
| `--color-flourish` on `--color-primary` | 11.32:1 | 3 |
| `--cta-on-dark` on `--color-primary` | 11.16:1 | 3 |
| `--cta-on-dark-text` on `--cta-on-dark` | 11.05:1 | 4.5 |
| `--color-error-on-dark` on `--color-primary` | 9.28:1 | 4.5 |
| `--color-on-accent` on `--color-accent` | 5.23:1 | 4.5 |
| `--color-foreground` on `--color-background` | 17.35:1 | 4.5 |
| `--color-foreground-mut` on `--color-background` | 7.51:1 | 4.5 |
| `--color-muted` on `--color-background` | 5.04:1 | 4.5 |
| `--color-accent` on `--color-background` | 4.94:1 | 4.5 |
| `--color-border-strong` on `--color-background` | 3.19:1 | 3 |

---

## Motion

One pattern per section, never two — a page where every band moves differently
reads as nervous; one vocabulary used consistently reads as designed.

| Section | Pattern |
| --- | --- |
| Hero | H2 word rise (headline only, masked per word at runtime) |
| Trust strip | U1 count up |
| Problem cards | C1 cascade left-to-right |
| Options and pricing | C2 centre-out |
| Before and after | M3 clip sweep |
| Reviews | vertical marquee, three columns at different speeds |
| Reassurance | S3 rule draws first |
| Journey | U2 numbered step draw |
| Team | M2 zoom settle from 114% |
| What's included | C5 mask rise in place |
| FAQ | S4 settle from 97% |
| Final CTA | M1 colour curtain |

Headline masking is built from the live text at runtime, per word. Masking
hand-written lines means hard-coding the line breaks, and the headline then
re-wraps inside them — a three-line headline becomes five ragged ones at
1280px. Per word preserves natural wrapping at every width, and the plain text
stands if the script never runs.

Every animated element has a defined resting state, so nothing depends on JS to
look right — only to know when to start. `prefers-reduced-motion` puts elements
into their **finished** state, not a faster animation, and the review marquee's
duplicate clone is never added at all.

---

## Notes for whoever picks this up next

- **The form auto-advances on pointer input only.** Arrow keys move between
  radios and fire `change` at every stop, so advancing on keyboard selection
  throws a keyboard user past the question the instant they start reading it.
  Pointer intent is tracked with `pointerdown` and checked in the `change`
  handler; keyboard users get the Continue button, which is why it stays.
- **`--header-h` must be ≥ the real rendered header at every width**, because
  every anchor offset resolves from it. Below 1200px the nav drops to its own
  rail, which is a second row — hence 112/120px there and 80px above it. JS
  measures and corrects it, and the harness asserts it at all seven widths.
- **Section cuts are overlays on the outgoing band**, at `bottom:-1px`, painted
  in the incoming band's colour. That 1px bleed is what stops a hairline seam on
  fractional device pixel ratios. A cut runs one direction only — reversing the
  band order means inverting the layer colours, not reusing the rule.
- **Never put looping motion behind a form.** The hero's drift layer sits behind
  an opaque form card that carries its own static bloom.
- **`.nb` binds hyphenated compounds** (`pick-up`, `interest-free`). A hyphen is
  a break opportunity and `word-break: keep-all` does not suppress it in
  Chromium. Never use one as a direct child of a `display:flex` row — it becomes
  a flex item and the words render out of order.
- **The two documents duplicate the token block** because each is
  self-contained. Edit `index.html` and run `node sync-head.mjs`.
- **The harness serves Google Fonts from a local cache.** Chromium cannot
  reach `fonts.googleapis.com` from CI, and each blocked request stalled page
  load by ~12 seconds while leaving the typography pass measuring the fallback
  stack rather than the real font metrics — which is the opposite of useful.
  `node tests/fonts/fetch.mjs` caches the stylesheet and its woff2 files
  (gitignored); the suite went from 1.8 minutes to 16 seconds. Without the
  cache the suite still runs, on fallback metrics, and says so.
- The harness ignores network failures from `fonts.googleapis.com`,
  Google Maps and `/assets/` — the first two are unreachable from CI, and the
  third is the outstanding photography, inventoried separately. Anything the
  page itself throws is always a hard failure.
