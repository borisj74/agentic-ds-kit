### Added

- **AppShellPattern has two looks: `layout="inset"` (default) and `layout="flat"`.** Inset puts the nav and top bar on the page background and the page in a raised card. Flat puts the nav on the surface with a hairline edge and runs the page edge to edge on the subtle background, led by the brand, a subtitle line and search.
- **AppShellPattern sidebar search and command menu.** `search` adds a search field under the brand, in both layouts. Clicking it or pressing ⌘K (Ctrl+K) opens the kit command menu (Command in a Modal). On the collapsed rail it becomes an icon button with a tooltip. `subtitle` adds one muted line under the product name.
- **AppShellPattern notifications as a nav row.** `notifications` makes Notifications the first nav row, with its unread count. It opens a panel at the sidebar's edge, over the page, with Tabs (such as Notifications and Requests), a list, an empty state and a settings button. On the collapsed rail the count is a dot; on small screens the panel opens as a full-height drawer. No notifications control sits in a top bar.
- **AppShellPattern workspace switcher and quick actions.** `workspace` puts a workspace switcher (mark, name, chevron, menu) in the nav's top row beside the collapse button. The search row reads "Quick actions" with a ⌘K hint, plus a small search button beside it.
- **SideNav.Item `renderControl`.** Wraps a row's control, for example to anchor a Popover on it, the compose twin of the preset's `renderItem`.
- **AppShellPattern rail collapse.** A toggle after the logo and title in the top bar (`AppShellPattern.RailToggle`), lined up with the nav's edge, shrinks the side nav to icons, with each label in a tooltip. Collapsed, the top bar shows only the logo, which turns into the expand toggle on hover or focus. The state is remembered for the browser session; `collapsed`, `defaultCollapsed` and `onCollapsedChange` control it.
- **AppShellPattern `projects` and `account` props.** `projects` adds a short "Projects" group with a "New project" row to a props nav. `account` puts the signed-in person (avatar, name, and a role or email) at the bottom of the nav with a menu for actions such as Settings, Theme and Sign out.
- **AppShellPattern work panel.** `workPanel` adds an optional right panel with Tabs, off by default, fixed width and closable. `AppShellPattern.PanelToggle` opens it. Below the breakpoint it opens in a right Drawer.
- **AppHeader `--appheader-title-size`.** A new cssVar for the product title size, defaulting to `--type-size-heading`. AppShellPattern sets it to `--type-size-ui-lg`, so the product name stays quieter than the page title.

### Changed

- **Command reads quieter.** Group headings are sentence-case captions instead of uppercase, tracked labels. Inside a Modal, Command drops its own border and corners, so the Modal card is the only frame.

### Fixed

- **DropdownMenu opens above its trigger when there is no room below,** so a menu near the bottom of the screen (such as an account menu at the foot of a side nav) no longer runs off-screen. Submenus do the same.
