### Added

- **Table `rowActionsAs="icons"`.** Row actions can show as icon-only ghost Buttons (each named by its `ariaLabel`) instead of the row menu. The column stays 56px with no header text, so a `footer` total stays under its column. Default is still `menu`.

### Changed

- **Billing schedule template is now a customer's schedule with editing.** The next charge is one figure with its lines and draft invoice, beside a danger Alert that names the invoice, amount, next and last retry and what happens after (Update card is the one solid primary; Change card hides meanwhile). Upcoming (with a total row) and Billed are two kit Tables with status as icon and word. A pencil on scheduled rows opens a kit Drawer with DatePicker, CurrencyInput and a RadioGroup for split fees; Skip this month asks once in an AlertDialog. Charge statuses are now `scheduled`, `retrying`, `invoiced`, `paid`, `failed`, `waived` (`upcoming` is now `scheduled`), `date` is `YYYY-MM-DD`, and charges carry `invoice`, `value` and `splitLabel`. New props `next`, `failureDetail`, `currency`, `onAsk`, `onDownloadInvoice`, `onSaveCharge` and `onSkipCharge`; `nextId` and `paymentMethod` are gone (the next charge comes from `next`). `summary` mode is unchanged.

### Fixed

- **CurrencyInput and NumberInput keep the symbol beside the number** on pages that load the shared control styles after theirs.
- **SideNav account avatar lines up with the nav icons.** SideNav.Account insets its 24px avatar by 4px, so its center sits on the same line as the 16px item icons, open or closed.
