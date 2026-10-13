# Kit sandbox rules

Before writing UI, read `packages/kit/contracts/index.json`, then only the matching contract file(s).
If a contract exists, import it from `agentic-ds-kit`. Never invent a local cousin.
Compose components freely; layout (top bar, side nav, both, neither) is the user's choice. Patterns in `packages/kit/contracts/patterns/` are examples to start from or ignore: `npx agentic-ds-kit add <id>` copies one into the app. In a pattern contract, follow `must` and treat `defaults` as suggestions; ask before breaking a `must`.
Layout accessibility: page content in `<main>`, chrome in `header` / `nav` landmarks (AppHeader, SideNav), and navigation reachable on small screens (e.g. kit Drawer).
If a component is missing from the index, stop and ask — do not add a one-off.
Never put hex in components; use semantic tokens from `agentic-ds-kit/tokens.css` (not primitive `--color-*` ramps).
One `variant="primary"` Button per view.
