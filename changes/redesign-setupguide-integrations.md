### Added

- **SetupGuide blocked tasks.** A task can be `status: "blocked"` with `dependsOn` and `blockedReason`. It shows a lock, the word Blocked and what unlocks it, with no button, and it turns To do once its `dependsOn` tasks are done.
- **SetupGuide provider tiles.** A task's `integrations` show as compact tiles under the row while it is current. `onIntegrationConnect(integrationId, taskId)` and `connectingId` drive them.
- **IntegrationPicker `connectFlow="detail"`.** Connect and Manage open a Drawer with the app's detail, what it can access, and Connect or Disconnect. Items take the optional `publisher`, `about`, `permissions` and `connectedNote`, and the picker takes `onDisconnect`, `selectedId`, `defaultSelectedId` and `onSelectedChange`.
- **IntegrationPicker `showConnected` and `tileSize`.** `showConnected` adds a "Connected n" segment (value `"connected"`). `tileSize="compact"` puts each tile on one row.

### Changed

- **SetupGuide shows a status word on every row** (Done, Current, To do, Blocked, Skipped). The current task's action is now the one solid primary, or the first available provider's Connect when tiles show. To do keeps an outline Start, Undo skip is a ghost Button, and the progress label counts skipped tasks ("1 of 4 done · 1 skipped"). The 24rem width cap and the Rocket icon are gone, so the guide fills its column. Below 30rem, a row with a button puts its status word under the task name.
- **IntegrationPicker tiles end in a status word** (Not connected, Connected, Connecting…, Coming soon) and at most one outline action. Connecting and Coming soon have no button, so there is no disabled Connect. The header drops the Plug icon and shows the connected count.
- **Onboarding pattern:** the Connect step's tasks start as To do, so the footer's Continue stays the step's one solid primary.

### Deprecated

- **AppDirectory.** Use `<IntegrationPicker connectFlow="detail" showConnected />`. AppDirectory now renders exactly that, with Connected as a category segment instead of a FilterButton chip, and it will be removed in a later release.
