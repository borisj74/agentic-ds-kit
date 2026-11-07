# Kit sandbox rules

Before writing UI, read `packages/kit/contracts/index.json`, then only the matching contract file(s).
If a contract exists, import it from `agentic-ds-kit`. Never invent a local cousin.
Compose components freely; layout (top bar, side nav, both, neither) is the user's choice. Patterns in `packages/kit/contracts/patterns/` are examples to start from or ignore: `npx agentic-ds-kit add <id>` copies one into the app. In a pattern contract, follow `must` and treat `defaults` as suggestions; ask before breaking a `must`.
Layout accessibility: page content in `<main>`, chrome in `header` / `nav` landmarks (AppHeader, SideNav), and navigation reachable on small screens (e.g. kit Drawer).
If a component is missing from the index, stop and ask — do not add a one-off.
Never put hex in components; use semantic tokens from `agentic-ds-kit/tokens.css` (not primitive `--color-*` ramps).
Lucide icons use strokeWidth 1.5 (--icon-stroke). Don't set other stroke widths on icons.
One `appearance="solid"` `mode="primary"` Button per view.
To let a model pick which kit view to render, generate the option list with `npx agentic-ds-kit questions` (`docs/questions.md`); do not hand-write one.

## Page layout

Build pages with the kit's layout classes: `layout-shell`, `layout-app`, `layout-canvas`, `layout-header`, `layout-content`, `layout-workspace`, `layout-split` (`--primary`, `--secondary`, `--thirds`, `--quarters`) and `layout-metrics`.
For any custom grid, use the `--grid-*` tokens: `--grid-columns` (12), `--grid-gutter-*`, `--grid-margin-*`, `--grid-width-*`, `--grid-breakpoint-*`.
Don't hard-code column counts, max-widths, gutters or breakpoint values; no raw px/rem in `grid-template-columns`, `gap` or `max-width` when a token exists.
If a layout can't be done with these, stop and propose a new layout class or token instead of a one-off.
