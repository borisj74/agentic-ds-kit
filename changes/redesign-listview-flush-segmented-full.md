### Added

- **ListView `flush`.** Rows meet the list's edges: square, with a 1px rule between rows, text inset 16 (xs, sm, lg) or 24 (md), and a plain icon at its own size. A selected row fills edge to edge and gets a 2px brand edge on its start side. Off by default, so existing lists look the same.
- **ListView item `metaTone` and `iconTone`** (`"neutral" | "danger"`). Danger colours the meta text (like "17 days late") or the leading icon (like a declined payment). The words must still say the problem.
- **ListView size `lg`.** Touch-size rows: 16/24 primary and value, 14/20 secondary and meta, 4 between the lines, inset 16. For a phone record list.
- **SegmentedControl `fullWidth`.** The track fills its container and the segments share it equally; a segment never gets narrower than its label.

### Changed

- **List detail template** uses flush ListViews for the invoice rows, Payment history and the phone Line items, red "N days late" and declined-payment icons, and a full-width filter. Phone rows are lg and run to the screen edges.
