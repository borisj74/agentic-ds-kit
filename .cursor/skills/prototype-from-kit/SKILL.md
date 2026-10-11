---
name: prototype-from-kit
description: Use when building a screen from agentic-ds-kit. Compose from kit components and patterns.
---

# Prototype from kit

Use this skill when adding or changing UI in an app that depends on `agentic-ds-kit`.

## Steps

1. **Search the index** — Read `node_modules/agentic-ds-kit/contracts/index.json` (or `packages/kit/contracts/index.json` in this repo). Note `group`: `foundation`, `component`, or `pattern`.
2. **Open contracts** — Read only the 1–2 contract files that match the UI you need.
3. **Check patterns** — If the screen matches `dashboard`, `settings-form`, `list-detail`, `invite-members`, `assistant-workspace`, `empty-first-run`, `activity`, `inbox`, `sign-in`, or `app-shell`, import that pattern from `agentic-ds-kit` instead of hand-rolling the layout.
   - **Need to change the pattern itself** (its sections, copy, or sample data)? Copy it into the app with `npx agentic-ds-kit add <pattern>` (`add --list` shows the names), then import the local copy. It lands in `components/patterns/<pattern>/` with `<pattern>.contract.json` beside it: follow that contract's rules while editing. To start custom chrome from source, `npx agentic-ds-kit add app-header` / `add side-nav` copy recipes ShellHeader / ShellNav (the presets rebuilt from AppHeader and SideNav blocks) into `components/chrome/<id>/` with the component contracts; pass them to AppShellPattern as `header` / `nav`.
4. **Compose from the package** — `import { Button, Scoreboard } from "agentic-ds-kit"`. Match props exactly to contract enums; do not add variants.
5. **Stop if missing** — If no contract or pattern covers what you need, stop and ask. Do not scaffold a one-off.

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
- Custom chrome in `app-shell`: pass built nodes as `header` / `nav`. A built header places `AppShellPattern.MenuButton` (usually as `AppHeader.Brand`'s `logo`); a props header that sets `start` loses the injected Menu button, so put `AppShellPattern.MenuButton` inside your `start`. A built nav reads `useAppShell().navPlacement`: no SideNav header or Toggle in the shell, radius `none` in the rail, forced open in the Drawer.
- Metric rows use `<Scoreboard items={...} />`, not flex layouts with borders.
- Settings pages use the `settings-form` pattern with `Field` wrappers.
- Invite / add-people screens use the `invite-members` pattern (Empty + Modal + FieldSet).
- Assistant / insights screens use the `assistant-workspace` pattern (`layout-workspace` + Chat `radius="none"` rail + two-column InsightCards).
- Empty / first-run screens use the `empty-first-run` pattern (PageHeader + Empty + one primary that opens a create Modal).
- Activity screens use the `activity` pattern (Scoreboard + task cards or list + tabbed DataTable feed).
- Inbox screens use the `inbox` pattern (Scoreboard + tabbed Table + detail Section + reply Drawer).
- Sign-in / sign-up screens use the `sign-in` pattern (centred Card, Field-wrapped email + password, one primary, `Divider label="or"`, SSO buttons). It is a full page: no AppHeader or SideNav.
- Product chrome uses the `app-shell` pattern (AppHeader over SideNav; below 64rem a Menu Button in AppHeader opens the same nav in a left Drawer). No hamburger cousins, bottom tab bars, or fixed sidebars on narrow screens.
