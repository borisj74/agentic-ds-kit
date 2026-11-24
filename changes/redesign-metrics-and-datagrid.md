### Added

- **DataGrid number and money columns.** `type: "number"` and `type: "money"` are end-aligned with tabular figures; money shows decimal strings in `currency` (default USD).
- **DataGrid computed columns.** `compute: (row) => string` makes a read-only, derived column such as Amount = Qty × Unit price. It is not a formula editor, and there is still no `formula` type.
- **DataGrid cell validation.** `validate: (value, row) => string | undefined` rings that cell in danger with an icon, sets `aria-invalid` and ties the message to the cell ("Qty, row 3: enter 1 or more · left out of the total"). `errorSummary` adds a "1 line needs a fix" status line.
- **DataGrid totals footer.** `totals: (validRows) => { label, value, emphasis?, narrowLabel? }[]` renders Subtotal, tax and Total in `tfoot`, from the valid rows only.
- **KpiBoard `goodWhen` and per-range `hint`.** Metrics pass `goodWhen` to the kit Delta so deltas read Better or Worse; a range value can carry its own hint, such as "vs Oct".

### Changed

- **DataGrid stacks below 30rem.** Each row becomes a line (description, other values, Amount) that opens to labelled fields; a row with an error starts open. The stacked footer shows only the total, with its `narrowLabel` ("Total incl. VAT").
- **Rows with an invalid cell are left out of DataGrid totals**, and their computed cells show an em dash.
- **Scoreboard wraps instead of scrolling.** Five or six figures sit in one row, three to a row below 64rem, and two by two on a phone; more than six wrap four to a row. Four figures stay two by two at 390 in both appearances (they no longer drop to one column), and divided strips draw rules both ways when they wrap.
- **KpiBoard uses Scoreboard `selectable`.** The KPI strip is a radiogroup (`role="radio"`, `aria-checked`, roving tabindex, arrow keys) instead of pressed toggle buttons. The picked card's badge reads "Charted" (was "In chart"). Below 40rem of block width the strip turns `divided`.
- **Conveyor docs and contract show chips and cards, not KPIs.** Conveyor is no longer a metric picker.

### Deprecated

- **Scoreboard `scroll`.** It has no effect: Scoreboard no longer composes Conveyor.
