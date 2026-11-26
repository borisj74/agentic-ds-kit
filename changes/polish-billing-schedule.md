### Added

- **Alert `action.icon` and `secondaryAction.icon`.** An optional leading Lucide icon on an Alert's buttons, such as RotateCcw on Retry.

### Changed

- **BillingSchedulePattern matches the polished board.** Each state sits in a kit Card with a header (Calendar icon, Billing schedule, the plan name and Download all). Upcoming and billed charges share one Table (Date, Description, Status, Amount). The next charge is highlighted and says Next charge, and status Badges are pills without icons. The `nextOnly` panel shows the date, the figure, Pays with and Change card, and `NextCharge` now takes `paysWith` in place of `detail`, `lines` and `invoice`. An open failed payment puts a danger Alert above the table with Update card on the right. Every date reads 01 Dec 2026. Row actions show only when you pass `onSaveCharge` or `onDownloadInvoice`.
