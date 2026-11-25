### Added

- **UsageMeter `compact` and `upgradeLabel`.** `compact` is one block for a settings page: title, badge and Upgrade on one line, then "used of limit · reset · pace", the meter and the categories in a row, spanning its container. Under 40rem the categories drop and Upgrade goes full width below the meter. `upgradeLabel` renames the Upgrade button (default "Upgrade plan").
- **Settings has a personal Sign-in page.** A new `"sign-in"` `SettingsSection` value under the You group, with its own `SETTINGS_SECTIONS` entry, index row and screen view. It holds your password and your two-factor Switch, which moved out of Security. `twoFactor` now drives this page.

### Changed

- **PageHeader actions centre on the title line.** With a subtitle, the actions used to centre on the whole title block and sat low; now they line up with the title. Stacked below 40rem nothing changes.
- **Settings:** wide pages put the title 24px below the panel's top edge.
- **Settings › Security is a workspace setting.** It moved from the You group to the Workspace group, with the scope line "applies to all 12 members · owners can change it". It holds the sign-in rules (Okta SSO, Require SSO, two-step for members) with one solid primary, Save sign-in rules, then your sessions, then a Danger zone (a kit Section heading).
- **Delete workspace moved from General to Security's Danger zone.** The kit AlertDialog now asks you to type the workspace name. General ends at its form and SaveBar.
- **Settings › Billing:** a Plan card (Compare plans opens kit PricingPlans in a Drawer), a Payment method card, a compact kit UsageMeter for AI credits (Upgrade to Business moves into it), and invoices in a kit DataTable with the retry note. The billing schedule stays, below Invoices. Below `--grid-breakpoint-md`, AI credits comes first and invoices are a ListView.
- **Settings › Team:** a seats Card with a kit Meter (seats count pending invites) and Add seats, a role filter next to search, a Last active column, members in a kit DataTable, and "Showing 5 of 12". The Security save row has a muted footer background. Below `--grid-breakpoint-md`, members are a ListView with a row menu.
- **Settings contract:** the default "Security has no solid primary" is now "Security has one solid primary, Save sign-in rules". New must: "Danger actions sit in their own group after every card that saves". Intent, `contains` and states are updated to match.
