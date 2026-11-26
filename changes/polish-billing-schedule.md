### Added

- **Alert `action.icon` and `secondaryAction.icon`.** An optional leading Lucide icon on an Alert's buttons, such as RotateCcw on Retry. It is aria-hidden; the label still names the action.

### Changed

- **Breaking: BillingSchedulePattern's `NextCharge` and data exports.** `NextCharge` is now `{ date, amount, paysWith }`. `detail`, `lines` and `invoice` are replaced by `paysWith`, the payment method shown under Pays with. The `UPCOMING_WINDOW` and `BILLED_WINDOW` exports from `billing-schedule-data` are removed. If you copied the pattern in and pass `next`, rename your fields.
- **BillingSchedulePattern matches the polished board.** Each state sits in a kit Card with the Card's own header (Billing schedule, the plan name and Download all). Upcoming and billed charges share one Table (Date, Description, Status, Amount). The next charge says Next charge, and status Badges have no icons. The `nextOnly` panel shows the date, the figure, Pays with and Change card. An open failed payment puts a danger Alert above the table, and the load error's Retry has a RotateCcw icon. Every date reads 01 Dec 2026. Row actions show only when you pass `onSaveCharge` or `onDownloadInvoice`.
