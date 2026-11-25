### Changed

- **The integration-settings pattern follows the redesign.** A Section head (provider, account, Ask) sits over two Cards: Connection (status Badge with an icon, last sync with numbers, and the sync error Alert holding Retry and View invoices) and Sync settings (Selects and Checkboxes, Save). Disconnect moves out of the form into its own Section, `--space-10` below. Scopes are one sentence instead of Tags, and Fields put labels on top. Disconnect stays usable while access is expired.
- **New `lastSync` prop** `{ at, invoices, payments, next }` on IntegrationSettingsPattern, and `error` now takes `{ title, detail }` as well as a string. New `onAsk` shows the Ask button in the head.
- **integration-settings contract:** `contains` drops switch and tag and adds checkbox. New musts: options saved by Save are Checkboxes (Switch only for settings that apply at once), and Disconnect sits outside the settings form.

### Added

- **Section `icon`.** A 40px tile with a 20px Lucide icon left of the heading, such as a provider mark. Decorative (aria-hidden).
- **Card `badge`.** One kit Badge right under the title, 4 below it, such as a connection status.
