# Kit sandbox rules

Before writing UI, read `contracts/index.json`, then only the matching contract file(s).
If a contract exists, use the kit component from `ui/`. Never invent a local cousin.
If a pattern in `contracts/patterns/` matches the screen, compose from `ui/patterns/`.
If something is missing from the index, stop and ask — do not add a one-off.
Never put hex in components; use semantic tokens from `lib/tokens.css` (not primitive `--color-*` ramps).
One `variant="primary"` Button per view.
