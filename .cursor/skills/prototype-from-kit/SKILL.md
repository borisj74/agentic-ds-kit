---
name: prototype-from-kit
description: Use when building a playground screen from this design system. Compose only from contracted kit components.
---

# Prototype from kit

Use this skill when adding or changing playground screens in this repo.

## Steps

1. **Search the index** — Read `contracts/index.json` for available components, groups, and status.
2. **Open contracts** — Read only the 1–2 contract files that match the UI you need (e.g. `contracts/scoreboard.json` for a metrics row).
3. **Compose from `ui/`** — Import kit components. Match props exactly to contract enums; do not add variants.
4. **Stop if missing** — If no contract covers what you need, stop and ask. Do not scaffold a one-off component.

## Hard rules

- Never define local cousins of `Button`, `Scorecard`, or `Scoreboard`.
- Never use raw hex in component styles; semantic tokens only.
- Scoreboard rows use `<Scoreboard items={...} />`, not hand-rolled flex layouts with borders.
