### Added

- **Table can sort.** Set `sortable` on a column to make its header a button (ascending, descending, then off). Give currency and date columns a `sortValue`.
- **Table `rowActions`** adds one row menu in a last 56px column, named "Actions for <first cell>".
- **Table `state`**: `loading` keeps the header and shows skeleton rows, `empty` shows a small Empty with `emptyLabel`, and `error` shows LoadError with `errorMessage` and Try again from `onRetry`.
- **Table `stickyHeader`** keeps the header in view when the Table has a height.
- **Table `stack` and `rowHref`** (opt-in): below 480px each row stacks into two lines, and `rowHref` links the row from its first cell.

### Changed

- **Table md rows are 40px**, the same as the header (were 36px).
- **An empty Table shows a small Empty** (no-data icon and `emptyLabel`) instead of plain muted text.
- **In a flush Card, Table's first and last cells take the card padding**, so they line up with the card title.
- **Table rows may hold kit Cell values.** HeaderCell stays on DataTable. The DataTable doNot on pagination, loading and row actions now points to Table.
