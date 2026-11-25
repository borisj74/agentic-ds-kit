### Added

- **`agent-permissions` pattern** (copy-in: `npx agentic-ds-kit add agent-permissions`). What each agent may do on its own, as a page: AppHeader, a PageHeader with Ask, the waiting kit PermissionRequest first (Grant / Deny, then one line), "What agents may do" as a Table with each level as an icon and a word and a ghost Edit (none on a level set by workspace policy), a Card with a Switch that makes every action ask first, and an AutonomyDial for the default level of new actions. Edit opens a kit Drawer with a card RadioGroup and, for "Up to an amount", a CurrencyInput under the group. Below 640 the nav opens in a Drawer from a Menu button, the Table becomes a drill ListView and Edit opens from the bottom. Northwind demo data; preview views: default, edit-drawer, granted, denied, error and 390. No kit props change.

### Fixed

- **PermissionRequest header wraps.** In a narrow card the count and `requestedAt` line now moves under the title instead of squeezing the title to one word per line and running over it.
