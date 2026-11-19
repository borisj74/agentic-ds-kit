### Added

- **AppShellPattern has two looks: `layout="flat"` (default) and `layout="inset"`.** Flat puts the rail on a soft neutral fill with hairline dividers and runs the page edge to edge. Inset puts the nav and top bar on the page background and the page in a raised card.
- **AppShellPattern rail collapse.** A toggle after the logo and title in the top bar (`AppShellPattern.RailToggle`), lined up with the nav's edge, shrinks the side nav to icons, with each label in a tooltip. The state is remembered for the browser session; `collapsed`, `defaultCollapsed` and `onCollapsedChange` control it.
- **AppShellPattern `projects` and `account` props.** `projects` adds a short "Projects" group with a "New project" row to a props nav. `account` puts the signed-in person (avatar, name, email) at the bottom of the nav with a menu for actions such as Settings, Theme and Sign out.
- **AppShellPattern work panel.** `workPanel` adds an optional right panel with Tabs, off by default, fixed width and closable. `AppShellPattern.PanelToggle` opens it. Below the breakpoint it opens in a right Drawer.
- **AppHeader `--appheader-title-size`.** A new cssVar for the product title size, defaulting to `--type-size-heading`. AppShellPattern sets it to `--type-size-ui-lg`, so the product name stays quieter than the page title.

### Fixed

- **DropdownMenu opens above its trigger when there is no room below,** so a menu near the bottom of the screen (such as an account menu at the foot of a side nav) no longer runs off-screen. Submenus do the same.
