### Added

- **Table `rowTone`.** `(row, index) => "default" | "highlight"`. A highlighted row is a rounded shape (`radius.surfaceSm`) tinted with `status.infoSubtle` and edged all round with `status.infoBorder`, in table and stacked layouts, with or without row dividers. Use it for the one row a person should look at first, and say why in the row's own text. It adds no ARIA state and is not selection.
- **Table `rowDividers`.** `"default" | "none"`. `none` drops the lines between body rows (the header and footer lines stay), rounds the hover tint and makes the header compact: labels 8px over the header line, then 12px before the first row. For short lists inside a Card.

### Changed

- **BillingSchedule matches the Paper table.** In `view="full"`, the Next charge row is a rounded tinted row (`rowTone="highlight"`), and the table has no row dividers (`rowDividers="none"`).
