# Design prompt pack

Brand-agnostic prompts for rebuilding this design system on any campaign. No
client data, no palette, no copy — structure, motion and technique only.

Paste one prompt per Claude Code task. Run them in order: the token foundation
first, the labs next (they are how design decisions get made by looking rather
than describing), the funnel last.

Every prompt assumes the same house rules:

> Single self-contained HTML file — HTML + CSS + vanilla JS, no framework, no
> build step, no external JS. Mobile-first. Inline SVG icons only, never emoji.
> All design values resolve from one `:root` token block. Animate transform,
> opacity, clip-path and stroke-dashoffset only. Every animated element has a
> defined resting state, so nothing depends on JS to look right — only to know
> when to start. `prefers-reduced-motion` puts elements into their **finished
> state**, never a faster animation. WCAG AA, measured rather than assumed.
> Verify in headless Chromium at 360 / 375 / 414 / 768 / 1024 / 1280 / 1440.

---

## P1 · Token foundation

> Build the `:root` token block for a landing-page design system, plus a
> one-page swatch sheet that renders every token with its computed contrast
> ratio against the surfaces it is used on.
>
> Tokens: `--color-primary` (the dark band colour), `--color-primary-dark`,
> `--color-on-primary`, `--color-secondary`, `--color-accent` (the CTA),
> `--color-accent-dark`, `--color-on-accent`, `--cta-on-dark`,
> `--cta-on-dark-text`, `--color-flourish` (icons and rules on dark),
> `--color-on-primary-mut` (body copy on dark), `--color-background`,
> `--color-surface`, `--color-foreground`, `--color-foreground-mut`,
> `--color-muted`, `--color-border`, `--color-border-strong`,
> `--color-success`, `--color-error`, `--color-star`.
>
> Radii: 12 / 8 / 20 / 999px. Spacing on an 8pt rhythm: 8 · 16 · 24 · 32 · 48
> · 64 · 80. Two families — a geometric sans for headings at 600/700, a
> humanist sans for body at 400/600. Easing: one no-overshoot ease-out
> (`cubic-bezier(.22,1,.36,1)`) as the workhorse, one soft ease for panels.
> Durations 240 / 460 / 680ms.
>
> **The rule that matters most:** a CTA sitting on a dark band almost never
> passes contrast in its normal colour. `--cta-on-dark` exists for exactly
> that case and must measure ≥3:1 against the dark band with ≥4.5:1 text on
> it. Prove every pair with relative-luminance maths in the swatch sheet, not
> by eye.
>
> Also produce three complete alternative palettes so the system can be
> re-skinned by swapping one block. Show all three live on the same
> components.

---

## P2 · Background motion lab

> Build an internal reference page showing **six background motion treatments**
> for full-width sections, from calmest to most active, each live and each
> with copy-paste code.
>
> - **A1 Calm Drift** — two large blurred radial blooms drifting on long
>   alternating ease-in-out cycles, 20–30s.
> - **A2 Aurora Wash** — a wide soft gradient sweeping slowly across the band.
> - **A3** — a more active variant of your choosing.
> - **A4 Scan Pulse** — concentric rings expanding and fading from a point.
> - **A5 Parallax Bed** — blobs offset by scroll position rather than time.
> - **A6 Quiet Premium** — a zero-motion control worth A/B testing against
>   every other option.
>
> Rules for all six: the motion layer is `position:absolute; inset:0;
> overflow:hidden; pointer-events:none` behind an `isolation:isolate` parent,
> so it can never intercept a click or escape the band. **Weight the colour to
> the base of the section, never behind the headline** — a bloom sitting under
> running text is the single fastest way to make a page look cheap. Size the
> blobs with explicit heights, not `aspect-ratio`, or a short section gets
> blobs taller than itself.
>
> Never put looping motion behind a form.

---

## P3 · Section cuts

> Build an internal reference page showing **eight SVG section dividers** — the
> shaped transitions between two full-width bands.
>
> Shapes: wave · layered wave · slant · curve · arch · notch/plinth · torn
> edge · steps. Each `viewBox="0 0 1440 120"` with
> `preserveAspectRatio="none"`, 64px tall on mobile and 96px on desktop.
>
> The technique that matters:
>
> - The divider is an **overlay**, absolutely positioned at `bottom:-1px` of
>   the *outgoing* section, painted in the *incoming* section's colour via
>   `currentColor`. That 1px bleed is what stops a hairline seam appearing on
>   fractional device pixel ratios.
> - The clip lives on the motion layer, not the section — `overflow:hidden` on
>   the section itself would shave the bleed off and reintroduce the seam.
> - The outgoing section reserves room for it:
>   `padding-bottom: calc(<normal> + 64px)`, 96px on desktop. Use a compound
>   selector so it beats the base section padding regardless of source order.
> - **Layer the shape 3–4 times** at ascending opacity, with the back layers
>   filled in the accent colour and the front layers in the destination
>   colour. A single low-opacity dark shape over a near-white ground
>   desaturates to grey; layering makes it gradate light → accent → dark
>   instead. This is the difference between a cut that looks designed and one
>   that looks like a mistake.
> - A cut runs one direction only. Reversing the band order means inverting
>   the layer colours, not reusing the same rule.
> - `aria-hidden` on every one — they are decoration.

---

## P4 · Funnel blocks

> Build an internal reference page of **reusable funnel sections**, each live
> and each with copy-paste code, all on the shared token names:
>
> Alternative hero layouts (form-right, form-below, split-image) · a
> before/after comparison slider · a price comparison table · full-width CTA
> bands · a stat strip · sticky-bar variants · a review marquee · a numbered
> journey/steps row · a clickable team roster driving one profile panel.
>
> The before/after slider must be a native `<input type="range">` driving a
> CSS custom property that clips the top layer — keyboard-accessible by
> construction, no custom drag handling, no ARIA to get wrong.
>
> The marquee is a track holding the list plus an `aria-hidden` clone added by
> JS, translated `-50%` on a linear loop, paused on hover, masked at both
> edges. Only add the clone when motion is allowed, so reduced-motion users
> get a plain static list rather than a duplicated one.

---

## P5 · Funnel page structure

> Build a single-page, mobile-first lead-generation landing page with these
> sections in order:
>
> 1. **Sticky header** — logo, section nav, click-to-call, primary CTA, and a
>    scroll-progress bar painted over the header's own bottom border so it
>    costs no height.
> 2. **Hero** — H1, subhead, four benefit ticks, an anchor figure, trust
>    chips, the embedded multi-step form, a photograph.
> 3. **Trust strip** — dark band, three or four proof points.
> 4. **Problem cards** — "is this you?" — 3–4 image-topped cards.
> 5. **Solutions and pricing** — three cards, one marked as most enquired
>    about.
> 6. **Before and after** — three comparison sliders with captions saying what
>    was treated.
> 7. **Reviews** — a three-column vertical marquee, columns drifting
>    down/up/down at different speeds.
> 8. **Reassurance** — dark band addressing the main objection.
> 9. **Journey** — three numbered steps with connectors.
> 10. **Team** — a wide photo above a clickable roster that drives one profile
>     panel below it (`aria-controls`, `aria-expanded`, `aria-live`).
> 11. **What's included** — a check-list beside two callouts.
> 12. **FAQ** — accessible accordion, real buttons, correct `aria-expanded`.
> 13. **Final CTA** — dark band, address, map embed.
> — **Footer** with regulatory disclosures, and a **sticky mobile CTA bar**
> with `env(safe-area-inset-bottom)` padding.
>
> **Image-on-top-of-card pattern:** the media block and the card body are
> siblings in a flex column, media with top-only radius and no bottom border,
> card with bottom-only radius. Do not nest the image inside the card and
> fight its padding.
>
> **Image fallback without JS:** the media block carries a `::before` striped
> slot showing the expected filename, and the `<img>` sits above it at
> `z-index:1` with `color:transparent`. A missing file leaves a labelled slot
> instead of a broken-image icon.
>
> Every unconfirmed value renders as a highlighted `[bracketed placeholder]`,
> and `noindex` stays in `<head>` until they are all resolved.

---

## P6 · Qualifier form

> Build a **three-step qualifier form** and an internal lab showing four
> visual treatments of it, all live and clickable, all on the same token
> names:
>
> - **Ink Atelier** — the card itself goes dark, glass rows, accent bloom
>   weighted to its base. The form stops being a widget on the hero and
>   becomes the thing the hero points at.
> - **Gilded Hairline** — 1px hairlines instead of 2px boxes, a gradient rule
>   replacing the slab, a small-caps step counter, answers as a divided list
>   with a chevron that slides in. Luxury by subtraction.
> - **Concierge Tiles** — lettered chips, rows that lift, a pill CTA.
> - **Editorial** — no boxes at all: underline-only fields, a large display
>   headline, wide letter-spaced labels, a lot of air.
>
> Steps: two single-choice questions, then name / surname / phone / email.
> Progress indicator, per-step validation, inline errors wired with
> `aria-invalid` and `aria-describedby`, back navigation preserving answers, a
> honeypot field, and a success state.
>
> **Selection auto-advances — on pointer input only.** Arrow keys move between
> radios in a group and fire `change` at every stop, so advancing on keyboard
> selection throws a keyboard user past the question the instant they start
> reading it. Track pointer intent with `pointerdown` and check it in the
> `change` handler. Keyboard users get the Continue button, which is why it
> stays in all four treatments. Leave a ~260ms beat before the step changes so
> the tick is visibly acknowledged rather than swallowed.
>
> Enter advances a step rather than submitting early.
>
> On a dark treatment the standard error colour will fail contrast — ship an
> on-dark twin token and prove it.

---

## P7 · Motion lab

> Build an internal reference page of **27 motion patterns**, every one live,
> replayable, and built on the shared token names. Group them:
>
> - **S · Section entrances** (5) — rise · clip wipe · rule-draws-first ·
>   settle from 97% · blur-to-sharp focus pull.
> - **C · Card choreography** (5) — cascade left-to-right · centre-out ·
>   dealt with slight rotation · per-column depth · mask rise in place.
> - **H · Headline reveals** (4) — line mask · word rise · underline draw ·
>   emphasis sweep behind one phrase.
> - **M · Media reveals** (4) — colour curtain · zoom settle from 114% · clip
>   sweep · split panels.
> - **I · Hover** (5) — lift · media zoom inside a still frame · arrow travel
>   · edge sweep · sheen.
> - **U · Micro** (4) — count up · tick draw · icon trace · sticky bar
>   entrance.
>
> Each case shows a name, a one-line note on where it belongs and what it
> costs, and a **Replay** button. A sticky bar offers Replay-all and a
> reduced-motion toggle that mirrors the media query through a root class, set
> from the OS on load, so what it shows is the finished state rather than a
> faster animation.
>
> **Replay is where this goes wrong.** Removing the trigger class does not
> snap an element back to its resting state — it starts a transition *towards*
> it, so a forced reflow reads a value still sitting at the finished end and
> nothing moves. Suppress transitions across the reset: add a `no-anim` class,
> remove the trigger, force a reflow, remove `no-anim`, force a second reflow,
> then replay. Both reflows are load-bearing.
>
> Close with a panel naming the handful you would actually apply **and the
> ones you would refuse**, with reasons. `filter:blur` repaints every frame
> and will stutter on mid-range Android. A sheen sweeping a button reads as a
> sale. Showpieces are charming once and mannered on a page with fourteen
> sections.

---

## P8 · Applying motion to the funnel

> Apply the chosen motion patterns to the funnel, **one pattern per section,
> never two.** A page where every band moves differently reads as nervous
> rather than considered; a page with one vocabulary used consistently reads
> as designed. Map each pattern to exactly one home and audit that no section
> carries two.
>
> Where a section has its own entrance pattern, neutralise that section's own
> baseline reveal — otherwise the container fades in as one lump and swallows
> the stagger inside it.
>
> Drive staggers from one custom property per item so re-timing a whole
> sequence is a handful of numbers rather than a rewrite.
>
> **Headline masking must be per word, built from the live text at runtime.**
> Masking hand-written lines means hard-coding the line breaks, and the
> headline then re-wraps inside them — a three-line headline becomes five
> ragged ones at 1280px. Per word preserves natural wrapping at every width,
> and the plain text stands if the script never runs. Give each mask
> `padding-bottom` taken straight back off with a negative margin, or
> `overflow:hidden` shaves the descenders.

---

## P9 · Header navigation and scroll progress

> Add section links and a scroll-progress bar to the sticky header.
>
> The links scroll-spy: whichever section the reader is in is the one marked
> `aria-current`. On a narrow rail, scroll the active chip to centre — the
> rail only, never the page.
>
> Below the width where the links can share a row with the logo, the phone and
> the CTA, drop them to their own horizontally scrollable rail with masked
> edges. Six links plus that furniture needs roughly 1200px; below it the row
> collapses.
>
> **`justify-content:center` on an overflowing flex track spills out of both
> sides**, and the left overflow is unreachable — the first link ends up under
> the logo, visible but unclickable. `width:max-content` with
> `min-width:100%` makes it grow and scroll instead.
>
> **`--header-h` must be ≥ the real rendered header at every width**, because
> every anchor offset resolves from it. Measure the header and assert it; a
> token 18px short drops every heading behind the header on a link click.
>
> The progress bar goes over the header's existing bottom border so it costs
> no height. Progress and scroll-spy share one `requestAnimationFrame`-
> throttled scroll listener — a scroll event fires dozens of times per frame,
> and doing layout reads in each one is how a smooth page starts to feel
> sticky. Give the spy an explicit bottom-of-page case, or the last section
> never reaches the trigger line and its link never lights up.

---

## P10 · Thank-you page

> Build the post-submission confirmation page on the same tokens, header and
> footer as the funnel, self-contained in the same way.
>
> A dark confirmation band with a tick that draws itself once, reusing the
> form card's treatment so the visitor feels they are still inside the thing
> they just filled in · what happens next in three numbered steps that
> choreograph on entry · a call band · what to think about before the call ·
> social proof. One action in the mobile bar, not two — they have already
> converted.
>
> **`noindex`.** A confirmation page that ranks is one people reach without
> converting, which silently inflates every conversion fired on it.
>
> Fire the conversion event in exactly one place — here or on submit, never
> both, or every lead counts twice. Leave a clearly marked block for the tag.
>
> If a name is passed in the query string to personalise the greeting: values
> arriving in a URL are attacker-controlled. Write with `textContent`, never
> `innerHTML`, and screen the value first — drop anything that is not
> plausibly a name rather than printing it. Choose the `?`/`&` separator from
> whether the destination already has a query string; do not assume.

---

## P11 · Verification harness

> Write a Playwright harness that runs against every page at 360 / 375 / 414 /
> 768 / 1024 / 1280 / 1440 and asserts:
>
> - `document.documentElement.scrollWidth - clientWidth === 0`
> - no console errors, no page errors
> - every image loads and carries an `alt`
> - exactly one `h1`; no dead, bracketed or `#`-only hrefs
> - JSON-LD parses
> - contrast, computed from relative luminance, for every text/background pair
>   on dark bands
> - the form: pointer selection advances, arrow keys do not, validation blocks
>   an empty step, errors clear on input, back navigation preserves answers
> - `--header-h` ≥ the real header height
> - typography: group words into real line boxes with
>   `Range.getClientRects()`, then flag any block whose last line holds a
>   single word, and any hyphenated compound split across two lines
>
> Grouping words by `rect.top` is wrong — a `<small>` or `<strong>` on the
> same visual line has a different top and reports one line as two.
>
> **Screenshot as well as measure.** The worst bug on the reference build —
> words rendering out of order in a card — passed every measurement and was
> only visible in a picture.

---

## P12 · Typography and wrapping pass

> Audit and fix wrapping at mobile widths.
>
> `text-wrap: balance` on headlines, `text-wrap: pretty` on body copy. Neither
> can rescue a three-word heading — one line always ends up holding a single
> word — so bind the final pair with a non-breaking space.
>
> A hyphen is a break opportunity, so compounds split down the middle at
> narrow widths. **`word-break: keep-all` does not suppress that** in
> Chromium; it only covers implicit opportunities. A `white-space:nowrap`
> wrapper is the only thing that holds a compound together.
>
> That wrapper has a hazard worth knowing: inside a `display:flex` list item
> it becomes a **flex item**, laid out beside the surrounding text rather than
> flowing with it, and the words render out of order. Never use one in a flex
> row.
>
> A wider border on one card of a row shifts its content by that many pixels
> and puts three headings on three different left edges. Use an inset ring for
> emphasis — it paints inside the box and moves nothing.

---

## P13 · Deployment build

> Write a build script producing standalone paste-and-go documents: every
> local image inlined as a data URI so there is no assets folder to upload
> alongside them.
>
> State the trade-off in the output rather than burying it: a data URI cannot
> be cached separately from the document and base64 costs about a third more
> bytes than the file, so every visitor re-downloads the whole payload.
> Inlining is the get-it-live-today option; hosting the images and keeping URL
> `src` attributes is the fast one.
>
> Print what still needs setting before publish — any URL that ships as a
> relative path and only resolves while the files sit in one folder.
