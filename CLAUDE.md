# Clix Dental — funnel copy rules

These apply to **every funnel, every page and every GHL paste file**: page copy,
headings, buttons, meta descriptions, JSON-LD, image alt text and any ad copy
written here.

## Never use the word "specialist"

- No "specialist", "specialists", "specialist-led", "specialist care" or any
  other form of the word.
- **Why:** "specialist" is a GDC-protected title. Using it for clinicians who are
  not on the GDC specialist register is misleading, and the practices have asked
  for it to be removed (October 2026).
- **Say instead:** "experienced team", "multidisciplinary team", "planned as one
  team", "implant dentist".
- **Patient reviews:** if a verbatim review contains the word, use a different
  review — never edit a patient's words.
- `tests/copy-rules.spec.mjs` enforces this: `npx playwright test` fails if the
  word appears in any `.html` file in the repo root.
