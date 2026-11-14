# Kit rules

Before writing UI, read this package's `contracts/index.json`, then only the matching contract file(s).
If a contract exists, import it from `agentic-ds-kit`. Never invent a local cousin.
Compose components freely; layout (top bar, side nav, both, neither) is the user's choice. Patterns in `contracts/patterns/` are examples to start from or ignore: `npx agentic-ds-kit add <id>` copies one into the app. In a pattern contract, follow `must` and treat `defaults` as suggestions; ask before breaking a `must`.
Blocks (`"kind": "block"` in `contracts/index.json` and the contract, e.g. AgentOverview) are larger compositions of kit components for a whole area of a screen. Import them from `agentic-ds-kit` like any component; they are not copied in. Put a block inside the page's `<main>`; it brings no app chrome.
Layout accessibility: page content in `<main>`, chrome in `header` / `nav` landmarks (AppHeader, SideNav), and navigation reachable on small screens (e.g. kit Drawer).
If a component is missing from the index, stop and ask — do not add a one-off.
Never put hex in components; use semantic tokens from `agentic-ds-kit/tokens.css` (not primitive `--color-*` ramps).
Lucide icons use strokeWidth 1.5 (--icon-stroke). Don't set other stroke widths on icons.
One `appearance="solid"` `mode="primary"` Button per view.
Before you finish, run `npx agentic-ds-kit review <path>` (or the MCP tool `review_ui`) on the files you changed and fix every error. Warnings name a bigger kit piece or a pattern to start from.
To see which kit pieces a running page renders, start the app with `NEXT_PUBLIC_NISTHA_INSPECT=1` and run `npx agentic-ds-kit inspect <url>` (or the MCP tool `inspect_ui`).
To let a model pick which kit view to render, generate the option list with `npx agentic-ds-kit questions` (https://github.com/borisj74/agentic-ds-kit/blob/main/docs/questions.md); do not hand-write one.

## Build order

Start from the biggest piece that fits, and only go smaller when nothing bigger fits: pattern (`template`), then `block`, `organism`, `molecule`, `atom`.
Check `level` in `contracts/index.json` to see where a piece sits.
Never rebuild a block or organism by hand from atoms when the kit has it. If nothing fits, stop and ask.

## Page layout

Build pages with the kit's layout classes: `layout-shell`, `layout-app`, `layout-canvas`, `layout-header`, `layout-content`, `layout-workspace`, `layout-split` (`--primary`, `--secondary`, `--thirds`, `--quarters`) and `layout-metrics`.
For any custom grid, use the `--grid-*` tokens: `--grid-columns` (12), `--grid-gutter-*`, `--grid-margin-*`, `--grid-width-*`, `--grid-breakpoint-*`.
Don't hard-code column counts, max-widths, gutters or breakpoint values; no raw px/rem in `grid-template-columns`, `gap` or `max-width` when a token exists.
If a layout can't be done with these, stop and propose a new layout class or token instead of a one-off.

Copy this file to your app root as `AGENTS.md` (and `CLAUDE.md` with `@AGENTS.md`) so Cursor and Claude Code load it.
