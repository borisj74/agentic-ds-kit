---
description: Jev token gate — check color/type/space tokens before shipping UI in this kit
paths:
  - "packages/kit/ui/**/*.{tsx,ts,css}"
  - "packages/kit/src/**/*.{tsx,ts,css}"
  - "app/**/*.{tsx,ts,css}"
---

# Jev token gate (agentic-ds-kit)

Claude Code twin of `.cursor/rules/jev-token-gate.mdc`. Keep the two in sync.

Use when reviewing or writing kit UI for **color, type, or spacing tokens**.

## Allowed vs forbidden

**Prefer (semantic):** `var(--text-*)`, `var(--surface-*)`, `var(--border-*)`, `var(--icon-*)`, `var(--action-*)`, `var(--status-*)`, `var(--type-*)`, `var(--font-*)`, `var(--space-inset-*)` / `stack` / `inline` / `gap` / `section`, `var(--radius-*)`, layout tokens from `packages/kit/lib/tokens.css`.

**Forbidden in components / app UI:**
- Raw hex (`#…`), `rgb(`, `hsl(`, arbitrary Tailwind colors
- Primitive ramps in UI: `--color-neutral-*`, `--color-blue-*`, etc. (those belong only inside `tokens.css` mappings)
- Hard-coded `px`/`rem` font sizes or `font-family` / `font-weight` outside `var(--type-*)` / `var(--font-*)`
- One-off spacing that should be `var(--space-*)`

Source of truth: `packages/kit/tokens/tokens.json` → emitted as `packages/kit/lib/tokens.css`. Contracts list expected tokens per component under `packages/kit/contracts/`.

## Process (always)

1. **Deterministic scan first** — collect suspect lines (hex, rgb, primitive `--color-*`, raw font sizes). No Jev yet.
2. If suspects exist (or the change touches `ui/` / tokens), run the **jev-token-check** skill (`.claude/skills/jev-token-check/SKILL.md`), which calls `mcp__jev__jev_triage`.
3. Act only on high-confidence failures. On `review` / `uncertain` / `abstain`, stop and ask Boris — do not invent a new token.
4. If `needs_new_token` is yes: stop. Propose a semantic name; do not ship a literal.
5. Jev is text/JSON only — never send screenshots. Do not use Jev to write JSX.
6. If the `jev` MCP server is not connected, report the scan results and say Jev was skipped. Do not guess its verdicts.

## Related

Always-on compose rules live in `AGENTS.md` (Cursor: `kit.mdc`). This rule only adds the Jev token referee.
