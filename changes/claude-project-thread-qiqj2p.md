### Changed

- **The settings example is now a settings shell, and this is breaking for anyone using it.** It renders its own settings SideNav (Back to app, then Workspace: General, Billing, Team, Integrations; You: Profile, Notifications, Security) and the inset panel itself, so drop the `AppShellPattern` wrapper and your Settings group in the app nav. Each page has a scope line under its title and no breadcrumb. Below 64rem, Settings is an index page of two LinkLists, and each section has Back to Settings. `npx agentic-ds-kit init --template settings` now renders `<SettingsPattern />` alone.
- **Settings sections:** `SettingsSection` gains `general` and `integrations`. General is new (workspace name, URL, currency, invoice prefix, time zone), and Delete workspace moves there from Security. Integrations renders the integration-settings example, which `add settings` now copies too. The default section is General (it was Billing). `SETTINGS_SECTIONS` rows now carry `group`, `scope` and `description`, and `SETTINGS_GROUPS` lists the two groups.
- **Settings routing props:** `section` also takes `null` (the narrow index page), plus `onSectionChange`, `sectionHref` (real links per section) and `appHref` (Back to app). `headerActions` now sit on the title row.
- **General, Profile and Notifications save from the kit SaveBar** (Cancel and Save), which names the unsaved changes. This replaces the hand-built footer bar.

### Added

- **settings-form `header={false}`** drops its PageHeader, so the form can be the body of a page that has its own header.
