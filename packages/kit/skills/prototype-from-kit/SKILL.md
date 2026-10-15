---
name: prototype-from-kit
description: Use when building a screen from agentic-ds-kit. Compose kit components freely; patterns are examples to start from or ignore.
---

# Prototype from kit

Use this skill when adding or changing UI in an app that depends on `agentic-ds-kit`.

## Steps

1. **Search the index** — Read `node_modules/agentic-ds-kit/contracts/index.json` (or `packages/kit/contracts/index.json` in this repo). Note `group`: `foundation`, `component`, or `pattern`.
2. **Open contracts** — Read only the 1–2 contract files that match the UI you need.
3. **Look at patterns (optional)** — Patterns (`dashboard`, `settings-form`, `list-detail`, `invite-members`, `assistant-workspace`, `empty-first-run`, `activity`, `inbox`, `sign-in`, `app-shell`) are examples of what you can build from kit components. Start from one, borrow from it, or ignore it: compose components freely, and layout is the user's choice. None are exported from `agentic-ds-kit`. To start from one, run `npx agentic-ds-kit add <id>` (the contract's `add` field; `add --list` shows the names), import the copy from `@/components/patterns/<id>`, replace the demo data, and keep `<id>.contract.json` beside it. In that contract, follow `must` (kit look and accessibility) and treat `defaults` as suggestions the user can change; ask before breaking a `must`.
   - **Chrome from source:** `npx agentic-ds-kit add app-header` / `add side-nav` copy recipes ShellHeader / ShellNav (the presets rebuilt from AppHeader and SideNav blocks) into `components/chrome/<id>/` with the component contracts. They import only kit components and work on their own; to host them in the `app-shell` copy, pass `header={<ShellHeader menuButton={AppShellMenuButton} />}` and `nav={(placement) => <ShellNav placement={placement} />}` from a client component.
4. **Compose from the package** — `import { Button, Scoreboard } from "agentic-ds-kit"`. Match props exactly to contract enums; do not add variants.
5. **Stop if missing** — If no kit component covers a piece you need, stop and ask. Do not scaffold a one-off component. (A layout or screen of your own built from kit components is not a one-off.)

## Hard rules

- Never define local cousins of kit components.
- Importing from `agentic-ds-kit` loads tokens. Do not add a second tokens import unless your own CSS needs the variables first.
- Never use raw hex in component styles; semantic tokens only.
- Icon props (`iconStart`, `icon`, …) take any Lucide name (`"Rocket"` or `"rocket"`): curated names render instantly, others load on demand; or pass the Lucide component (`iconStart={Rocket}`; in a Server Component feeding a client kit component, use a name or `<Rocket />`). Never hand-roll an `<svg>` or wrap an icon beside a kit component.
- Kit components take `className` (merged onto the root, for layout only), `ref` (a plain prop; on form controls it reaches the native element) and other HTML attributes such as `id` or `data-testid`. Check the contract's `passthrough` block for where each lands. Do not use `className` to restyle a component or override a kit-owned `role` or `aria-*`.
- App chrome (AppHeader, SideNav, AppNav) has four layers; take the lowest one that does the job and never hand-roll a header, nav row or Menu button:
  1. **Variables** — restyle through the contract's `cssVars` (e.g. `--sidenav-width-collapsed` on `:root`; AppHeader's brand column follows it), set to semantic tokens.
  2. **Slots** — rearrange the presets: AppHeader `start`/`center`/`end`; SideNav `header`/`beforeGroups`/`afterGroups`/`footer`/`renderItem`. Preset row data is `SideNavItemData` / `SideNavGroup`.
  3. **Building blocks** — the contract's `compose` section: `AppHeader.Root`/`Brand`/`Mark`/`Title`/`Search`/`Center`/`Spacer`/`Actions` and `SideNav.Root`/`Header`/`Brand`/`Toggle`/`Slot`/`Nav`/`Section`/`Item`/`Footer` (a SideNav brand is `SideNav.Brand`, not AppHeader's Mark/Title: its mark reopens the closed rail). In Server Components use the named exports (`AppHeaderRoot`, `SideNavRoot`, `SideNavBrand`, `SideNavItem`, …); dot access only works in client components. Blocks keep the landmarks, `aria-current`, disclosures and rail tooltips.
  4. **Recipes** — `add app-header` / `add side-nav` (above) when you want the preset's source to edit.
- Layout is the user's choice: top bar only (AppHeader + main), side nav only (SideNav + main), both, or neither. Keep these accessibility rules whatever the layout:
  - Use landmarks: page content in `<main>`; AppHeader is a `header`, SideNav's rows sit in a `nav`.
  - Navigation stays reachable on small screens, e.g. a kit Button that opens the nav in kit Drawer. Never a hand-rolled overlay, scrim, or fixed sidebar.
  - One `variant="primary"` Button per view.
- If you start from the `app-shell` copy with custom chrome: a built header places `AppShellMenuButton` (usually as `AppHeader.Brand`'s `logo`); a built nav reads `useAppShell().navPlacement` or takes the placement from `nav={(placement) => …}`.
- Metric rows use `<Scoreboard items={...} />`, not flex layouts with borders.
- Labeled inputs sit in `Field`; dismissible forms open in Modal or Drawer (AlertDialog is for confirmations that need an answer).
- **Model picks the view:** if the app asks a decision model or LLM which kit view to render, generate the options from the contracts with `npx agentic-ds-kit questions` (`--help`; https://github.com/borisj74/agentic-ds-kit/blob/main/docs/questions.md). Keep thresholds and product wording in app code or the overlay.
