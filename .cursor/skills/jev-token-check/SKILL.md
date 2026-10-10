---
name: jev-token-check
description: Use when checking agentic-ds-kit components or a PR for proper color, type, and spacing tokens — run a deterministic scan then jev_triage.
---

# Jev token check

## When

- Reviewing `packages/kit/ui/**` or app screens that import the kit
- PR / cloud-agent review for token misuse
- After an agent wrote or edited component styles

## Step 1 — deterministic scan

From repo root, list changed or target files, then flag lines matching roughly:

- `#` hex colors, `rgb(`, `hsl(`
- `--color-neutral-`, `--color-blue-`, `--color-red-`, other primitive ramps in UI files (not in `lib/tokens.css`)
- `font-size:` / `fontFamily` / `font-weight:` without `var(--type-` or `var(--font-`
- raw spacing like `padding: 13px` when a `var(--space-*)` exists

Keep the suspect list short. If clean, skip Jev and report pass.

## Step 2 — load token vocabulary (for state)

Read (do not dump entire files into chat unless needed):

- `packages/kit/lib/tokens.css` — semantic custom properties
- Matching `packages/kit/contracts/<Component>.json` `tokens` field if present

## Step 3 — `jev_triage`

Call MCP tool `jev_triage` with one item per file (`path` relative to kit roots). Use this question set (same for every item):

```json
{
  "questions": [
    {
      "id": "uses_only_tokens",
      "type": "check",
      "question": "In this UI file, every color, type (font family/size/weight/line-height), and spacing value is expressed via kit semantic CSS variables (e.g. var(--text-*), var(--surface-*), var(--type-*), var(--space-*)). There are no raw hex/rgb literals and no primitive --color-* ramps used as the styling API."
    },
    {
      "id": "token_correctness",
      "type": "classify",
      "question": "If tokens are used, are they the right semantic tokens for the role (text vs surface vs border vs action; body vs heading type; inset/stack/gap space)?",
      "options": {
        "correct": "Semantic tokens match the role",
        "wrong_semantic": "Uses a token but the wrong one for the role",
        "missing_token": "Needs a token that does not exist yet",
        "literals_present": "Still has raw literals or primitive ramps"
      }
    },
    {
      "id": "needs_new_token",
      "type": "check",
      "question": "This file justifies adding a new semantic token to tokens.json rather than reusing an existing one."
    }
  ]
}
```

Also pass a short shared preamble in each item or as part of triage `query` / state context if the tool allows:  
`Kit rule: components must use semantic tokens from packages/kit/lib/tokens.css; primitives only inside tokens.css mappings. Repo: agentic-ds-kit.`

Question types are the live `jev_triage` ones: `check` (yes/no/uncertain verdict), `classify` (pick one option; `add_none` defaults true), `score` (needs `levels`; unused here). Thresholds are top-level args (`yes_at_or_above` 0.7, `no_at_or_below` 0.3, `act_above` 0.8, `review_above` 0.5); prefer defaults (`act` / `review` / `abstain`). Results echo `check` as `type: noul` (`noul` probability + `verdict`) and `classify` as `type: choice` (`choice` + `confidence` + `action`) — read those fields, but never send `noul`/`choice` as input types. Only auto-fix on `uses_only_tokens` no with high confidence, or `token_correctness` in `wrong_semantic` | `literals_present` with `action: act`.

## Step 4 — report

Return a table: file → uses_only_tokens → token_correctness → needs_new_token → action.  
Do not rewrite styles in the same breath as inventing tokens. Ask Boris before adding tokens.

## Anti-patterns

- Calling Jev on every single-line question in chat (answer those yourself)
- Sending Figma screenshots to Jev
- Using Jev to generate JSX or pick fonts by taste
