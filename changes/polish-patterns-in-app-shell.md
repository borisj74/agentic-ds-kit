### Added

- **`topBar` on AgentActivityPattern and AgentPermissionsPattern.** Default `true` keeps today's page with its own AppHeader and narrow nav Drawer. Set `topBar={false}` to put the page inside your app shell; it then renders only its `main`.

### Changed

- **Pattern previews sit in one Northwind app.** Dashboard, Empty first run, List detail, Settings form, Assistant start, Billing schedule, Integration settings, Insight stack, Agent activity and Agent permissions now preview inside the dashboard's app shell (workspace switcher, Quick actions, nav, account), with their own nav row current and the dashboard's page header and padding. The shared nav gains a Settings row. On a phone the nav moves into the shell's drawer, as before.
