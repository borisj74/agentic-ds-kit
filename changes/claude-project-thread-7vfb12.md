### Added

- **`agent-permissions` pattern** (copy-in: `npx agentic-ds-kit add agent-permissions`). What each agent may do on its own, as a page: AppHeader, a PageHeader with Ask, the waiting kit PermissionRequest first (Grant / Deny, then one line), "What agents may do" as a Table with each level as an icon and a word and a ghost Edit (none on a level set by workspace policy), a Card with a Switch that makes every action ask first, and an AutonomyDial for the default level of new actions. Edit opens a kit Drawer with a card RadioGroup and, for "Up to an amount", a CurrencyInput under the group. Below 640 the nav opens in a Drawer from a Menu button, the Table becomes a drill ListView, Edit opens from the bottom and the dial is left out. Northwind demo data; preview views: default, edit-drawer, granted, denied, error and 390. It uses the new PermissionRequest `badge` and `summary` and the new ListView `valueIcon` and `note`.
- **PermissionRequest `badge`.** A warning Badge with a Hand icon on a row above the title, like "Needs you", with `requestedAt` beside it. The scope count is left out on that layout.
- **PermissionRequest `summary`.** A strip of two to four `{ label, value }` cells under the description (a `dl`), like Changes / For / Still asks. Columns when the card is wide, label and value rows under 40rem.
- **ListView `valueIcon`.** A quiet, aria-hidden Lucide icon before an item's `value`, like a level icon next to "Up to $250".
- **ListView `note` and `noteTone`.** Short text at the end of the secondary line after " · ", like "$500 asked", read in the row name; `noteTone` colours only that part.

### Changed

- **PermissionRequest under 40rem of card width.** Grant and Deny stack full width at size lg, Grant first, and the key hint is left out.
- **ListView tones gain `warning`.** `metaTone`, `iconTone` and the new `noteTone` take `"neutral" | "warning" | "danger"`.

### Fixed

- **PermissionRequest header wraps.** In a narrow card the count and `requestedAt` line now moves under the title instead of squeezing the title to one word per line and running over it.
