# Work log — Pristine Dental Group, Full Arch Implant funnel

Times are UTC, taken from commit timestamps. Blocks are 30 minutes.

---

## Session 1 — Friday 28 August 2026 (10:39–18:41 UTC)

**10:30–11:00** — Built the funnel from the campaign brief: `index.html` (13 sections),
`thank-you.html`, design tokens, and a Playwright verification harness
(`tests/` — contrast, form, structure, typography specs). First commit.

**11:00–11:30** — Added `make-preview.mjs` so the page can be previewed inside hosts
that supply their own document wrapper.

**11:30–12:00** — Built the practice gallery slider; wired the first photography set
into it. Added `optimise-images.mjs`.

**12:00–12:30** — (no commits — image sourcing and Drive access work)

**12:30–13:00** — Added the brand logo lockup, the background-video band, and the
media prep scripts (`optimise-video.mjs`, `lib/ffmpeg.mjs`). Wired the DSC photo set
into the problem cards; added `media.json` + `set-media.mjs` for hosted-URL swapping.

**13:00–13:30** — Pointed five image slots at the existing funnel's hosted CDN URLs.
Adopted the client's `embed-images.py`, extended it for poster frames, retired
`build.mjs` in favour of `preflight.mjs`.

**13:30–14:00** — Built `build-ghl.mjs` — emits one paste-ready fragment for a
GoHighLevel custom-code block — plus `tests/ghl.spec.mjs` to prove the fragment does
not leak styles into the host page. Rebuilt the team section around a portrait.

**14:00–14:30** — Fixed the duplicate brand lockup and the illegible (dark-on-dark)
logo. Fixed doubled step numbers in the journey section and a mismatched card image.
Applied the luxury pass (spacing, weights, motion timings). Removed the hero
photograph and restored the video band.

**14:30–15:00** — Made outstanding-media reporting read the live documents rather than
a hand-kept list; added bulk fill. Wrote `IMAGE-BRIEF.md` with each slot's measured
dimensions.

**15:00–15:30** — Downloaded and reviewed the client's full 91-image Drive library;
selected and cropped 15 images into `assets/img/`; wired them into the gallery, team
portrait and callout cards; produced the first fully embedded `ghl-embedded.html`.

**15:30–16:30** — Wired the hosted hero video into the background band and extracted
its poster frame (`assets/img/hero-poster.jpg`) from the video itself.

**16:30–17:00** — Moved the background video from the trust strip to the hero, behind
the headline and form. Slimmed hero copy (removed the offer strip and one duplicate
tick). Tightened the trust strip, centred the what-you-get heading, fixed 3 orphan
lines.

**17:00–17:30** — Polish round: gallery converted to an auto-sliding marquee, review
cards inverted to dark on the light band, doctor block centred, phone/hours/map
wired in.

**17:30–18:00** — (no commits — content research against the client's live site)

**18:00–18:30** — Added Dr Shabeeb Paktiawal's full name and credentials, the
polygonal mesh ornament behind the team section, FAQ answers rewritten from the
practice's own site copy, opening hours and parking note. Centred the anchor price
against its caption.

**18:30–19:00** — Connected the qualifier form to the GHL inbound webhook. Removed
everything unconfirmed (FCA/finance provider lines, policy links, footer email, GDC
and company numbers). Added the footer logo. Built the adaptive header (light chrome
over light bands).

---

## Session 2 — Saturday 29 August 2026 (14:34–18:21 UTC)

**14:30–15:00** — Removed the "Kingsbury, London" label beside the logo. Retrieved the
real wordmark PNG from the client's Drive folder and embedded it
(`assets/img/logo.png`) in header and footer.

**15:00–15:30** — Set the wordmark to show in its true bronze on light bands and
white on dark. Reworked the header to open transparent with the bronze mark and fade
to the dark bar with the white mark on scroll.

**15:30–16:30** — (no commits — full-page visual QA at five widths)

**16:30–17:00** — QA pass: bound 3 remaining orphan lines (360/768/1024px), cleared
the mobile nav rail's first link from the edge fade, softened the team mesh on
narrow screens.

**17:00–17:30** — Condensed the "my case is too complex" section from 3 paragraphs to
1 line + 3 tick points. Synced the thank-you page with every confirmed detail and
shipped it as its own fragment (`build-ghl-thank-you.mjs`,
`ghl-thank-you-embedded.html`). Removed the WhatsApp buttons and copy from both pages.

**17:30–18:00** — Re-exported Dr Shabeeb's portrait at the full uncropped 4:5 frame.

**18:00–18:30** — Replaced the guessed Full Mouth figures with an explicit
client-fill placeholder. Renamed the pricing cards to the campaign's own words
("Full arch" was "Single arch").

---

## Session 3 — Monday 31 August 2026 (05:32–12:13 UTC)

**05:30–06:00** — Aligned card wording to the page's own voice: "Full arch · upper or
lower" and "Full mouth · upper and lower" (replacing "one jaw / both jaws"); matched
the consultation list and cost FAQ.

**12:00–12:30** — Produced the client-facing change log and this work log.

---

## Files created

| File | Purpose |
|---|---|
| `index.html` | The funnel page |
| `thank-you.html` | Thank-you / confirmation page |
| `build-ghl.mjs` | Emits the paste-ready GHL fragment for the funnel |
| `build-ghl-thank-you.mjs` | Same, for the thank-you page |
| `embed-images.py` | Inlines every image as a data URI |
| `ghl-embedded.html` | **Deliverable** — funnel, single self-contained block |
| `ghl-thank-you-embedded.html` | **Deliverable** — thank-you, single block |
| `assets/img/` (17 files) | Logo, hero poster, portrait, 10 gallery photos, 2 callouts |
| `tests/` (6 specs) | 49 automated checks |
| `IMAGE-BRIEF.md` | Measured spec for every image slot |
| `media.json`, `set-media.mjs`, `preflight.mjs` | Media management utilities |
