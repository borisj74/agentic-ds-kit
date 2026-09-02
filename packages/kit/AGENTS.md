# Kit rules

Before writing UI, read this package's `contracts/index.json`, then only the matching contract file(s).
If a contract exists, import the kit component from `agentic-ds-kit`. Never invent a local cousin.
If a pattern in `contracts/patterns/` matches the screen, import it from `agentic-ds-kit`.
If something is missing from the index, stop and ask — do not add a one-off.
Never put hex in components; use semantic tokens from `agentic-ds-kit/tokens.css` (not primitive `--color-*` ramps).
One `variant="primary"` Button per view.

Copy this file to your app root as `AGENTS.md` (and `CLAUDE.md` with `@AGENTS.md`) so Cursor and Claude Code load it.
