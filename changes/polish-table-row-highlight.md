### Added

- **Table `rowTone`.** `(row, index) => "default" | "highlight"`. A highlighted row gets the `status.infoSubtle` background and a `status.infoBorder` edge, in table and stacked layouts, and keeps the tint on hover. Use it for the one row a person should look at first, and say why in the row's own text. It adds no ARIA state and is not selection.

### Changed

- **BillingSchedule highlights the next-charge row.** In `view="full"`, the row marked Next charge now has the Table's `rowTone="highlight"` tint, as on the Paper board.
