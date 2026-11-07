---
description: Jev token gate — check color/type/space tokens before shipping UI in this kit
paths:
  - "packages/kit/ui/**/*.{tsx,ts,css}"
  - "packages/kit/src/**/*.{tsx,ts,css}"
  - "app/**/*.{tsx,ts,css}"
---

# Jev token gate (agentic-ds-kit)

Claude Code twin of `.cursor/rules/jev-token-gate.mdc`. Keep the two in sync.

Use when reviewing or writing kit UI for **color, type, spacing, or grid tokens**.

## Allowed vs forbidden

**Prefer (semantic):** `var(--text-*)`, `var(--surface-*)`, `var(--border-*)`, `var(--icon-*)`, `var(--action-*)`, `var(--status-*)`, `var(--type-*)`, `var(--font-*)`, `var(--space-inset-*)` / `stack` / `inline` / `gap` / `section`, `var(--radius-*)`, `var(--grid-*)` (`--grid-columns`, `--grid-gutter-*`, `--grid-margin-*`, `--grid-width-*`, `--grid-breakpoint-*`), and the layout classes in `packages/kit/lib/layout.css` (`layout-shell`, `layout-app`, `layout-canvas`, `layout-header`, `layout-content`, `layout-workspace`, `layout-split`, `layout-metrics`).

**Forbidden in components / app UI:**
- Raw hex (`#…`), `rgb(`, `hsl(`, arbitrary Tailwind colors
- Primitive ramps in UI: `--color-neutral-*`, `--color-blue-*`, etc. (those belong only inside `tokens.css` mappings)
- Hard-coded `px`/`rem` font sizes or `font-family` / `font-weight` outside `var(--type-*)` / `var(--font-*)`
- One-off spacing that should be `var(--space-*)`
- Raw `px`/`rem` or a hard-coded column count in `grid-template-columns`, `gap`, or `max-width` when a `--grid-*` token exists
- Raw `px`/`rem` widths in `@media` queries (`min-width`, `max-width`, `width <`) instead of a `--grid-breakpoint-*` token
- Lucide `strokeWidth` other than `ICON_STROKE` (1.5, `--icon-stroke`) or `ICON_STROKE_STRONG` (2, `--icon-stroke-strong`) on tiny marks such as the Checkbox check. Do not flag chart, Progress, Meter, or PieChart strokes; those are data lines

Source of truth: `packages/kit/tokens/tokens.json` → emitted as `packages/kit/lib/tokens.css`. Contracts list expected tokens per component under `packages/kit/contracts/`.

## Process (always)

1. **Deterministic scan first** — collect suspect lines (hex, rgb, primitive `--color-*`, raw font sizes, raw values in `grid-template-columns`, `gap`, `max-width`, `@media` widths, and Lucide `strokeWidth` other than `ICON_STROKE` / `ICON_STROKE_STRONG`). No Jev yet. Do not flag `packages/kit/lib/layout.css` or `tokens.css`; those files define the classes and tokens. Do not flag chart, Progress, Meter, or PieChart strokes.
2. If suspects exist (or the change touches `ui/` / tokens), run the **jev-token-check** skill (`.claude/skills/jev-token-check/SKILL.md`), which calls `mcp__jev__jev_triage`.
3. Act only on high-confidence failures. On `review` / `uncertain` / `abstain`, stop and ask Boris — do not invent a new token.
4. If `needs_new_token` is yes: stop. Propose a semantic name; do not ship a literal.
5. Jev is text/JSON only — never send screenshots. Do not use Jev to write JSX.
6. If the `jev` MCP server is not connected, report the scan results and say Jev was skipped. Do not guess its verdicts.

## Related

Always-on compose rules live in `AGENTS.md` (Cursor: `kit.mdc`). This rule only adds the Jev token referee.
