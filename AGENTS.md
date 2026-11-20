# Kit sandbox rules

## Working rules for every task

- Use the `github` remote, never `origin`. One branch and one PR per task. Never merge or push to `main`; Boris merges.
- No tags, publishing or releases without Boris's yes.
- Before any PR, run lint, both `tsc --noEmit` runs, build and test. All must pass.
- Never edit `CHANGELOG.md` in a PR. If a kit user would notice the change, add one `changes/<branch-name>.md` file (`/` in the branch name becomes `-`) with the entry under `### Added`, `### Changed`, `### Fixed` (etc.). See `changes/README.md`. `npm run changelog` folds them into `CHANGELOG.md` at release time.
- Leave `.cursor/mcp.json` uncommitted and never commit secrets.
- Contracts are the source of truth. Don't add contract fields. Compose from kit components and tokens, never make local cousins, and if something is missing, stop and ask.
- Make minimal changes, with no new runtime dependencies.
- Run the Jev token gate (`jev-mcp@0.5.1`): the deterministic scan, then `jev_triage`. Stop on `needs_new_token`.
- Use our own wording and design. Don't copy Affect UI, onsystem or @shadcn/lint.
- In the PR, list what you skipped or are unsure about, then stop and report the link.

Before writing UI, read `packages/kit/contracts/index.json`, then only the matching contract file(s).
If a contract exists, import it from `agentic-ds-kit`. Never invent a local cousin.
Compose components freely; layout (top bar, side nav, both, neither) is the user's choice. Patterns in `packages/kit/contracts/patterns/` are examples to start from or ignore: `npx agentic-ds-kit add <id>` copies one into the app. In a pattern contract, follow `must` and treat `defaults` as suggestions; ask before breaking a `must`.
Blocks (`"kind": "block"` in `packages/kit/contracts/index.json` and the contract, e.g. AgentOverview) are larger compositions of kit components for a whole area of a screen. Import them from `agentic-ds-kit` like any component; they are not copied in. Put a block inside the page's `<main>`; it brings no app chrome.
Layout accessibility: page content in `<main>`, chrome in `header` / `nav` landmarks (AppHeader, SideNav), and navigation reachable on small screens (e.g. kit Drawer).
If a component is missing from the index, stop and ask — do not add a one-off.
Never put hex in components; use semantic tokens from `agentic-ds-kit/tokens.css` (not primitive `--color-*` ramps).
Lucide icons use strokeWidth 1.5 (--icon-stroke). Don't set other stroke widths on icons.
One `appearance="solid"` `mode="primary"` Button per view.
Before you finish, run `npx agentic-ds-kit review <path>` (or the MCP tool `review_ui`) on the files you changed and fix every error. Warnings name a bigger kit piece or a pattern to start from.
To see which kit pieces a running page renders, start the app with `NEXT_PUBLIC_NISTHA_INSPECT=1` and run `npx agentic-ds-kit inspect <url>` (or the MCP tool `inspect_ui`).
To let a model pick which kit view to render, generate the option list with `npx agentic-ds-kit questions` (`docs/questions.md`); do not hand-write one.

## Build order

Start from the biggest piece that fits, and only go smaller when nothing bigger fits: pattern (`template`), then `block`, `organism`, `molecule`, `atom`.
Check `level` in `packages/kit/contracts/index.json` to see where a piece sits.
Never rebuild a block or organism by hand from atoms when the kit has it. If nothing fits, stop and ask.

## Page layout

Build pages with the kit's layout classes: `layout-shell`, `layout-app`, `layout-canvas`, `layout-header`, `layout-content`, `layout-workspace`, `layout-split` (`--primary`, `--secondary`, `--thirds`, `--quarters`) and `layout-metrics`.
For any custom grid, use the `--grid-*` tokens: `--grid-columns` (12), `--grid-gutter-*`, `--grid-margin-*`, `--grid-width-*`, `--grid-breakpoint-*`.
Don't hard-code column counts, max-widths, gutters or breakpoint values; no raw px/rem in `grid-template-columns`, `gap` or `max-width` when a token exists.
Radius and spacing use only 2 or 4px steps: pick a `--radius-*` or `--space-*` token, and never a value off that grid (no 3px, 5px, 10px or 13px corners or gaps).
If a layout can't be done with these, stop and propose a new layout class or token instead of a one-off.
