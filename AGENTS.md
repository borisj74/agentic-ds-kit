# Kit sandbox rules

Before writing UI, read `packages/kit/contracts/index.json`, then only the matching contract file(s).
If a contract exists, import it from `agentic-ds-kit`. Never invent a local cousin.
If a pattern in `packages/kit/contracts/patterns/` matches the screen, import it from `agentic-ds-kit`.
If something is missing from the index, stop and ask — do not add a one-off.
Never put hex in components; use semantic tokens from `agentic-ds-kit/tokens.css` (not primitive `--color-*` ramps).
One `variant="primary"` Button per view.
