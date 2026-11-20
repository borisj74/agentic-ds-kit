### Added

- **Charts take `actions`.** LineChart, BarChart, ComboChart, Heatmap, PieChart and ScatterChart put kit Buttons in their header before the Table toggle, for example an icon-only Ask.
- **Card header actions can be icon-only, and there can be two.** `headerAction` takes one action or an array of up to two. `iconStart` adds an icon, and `iconOnly` makes it an icon-only Button named by `label`.
- **ListView rows take `dot` and `meta`.** `dot` is a small status dot in the leading slot, and `meta` is short muted text at the row end (like "2h ago") that is read as part of the row name.

### Changed

- **InsightCard `description` takes inline nodes**, so key numbers can sit in `<strong>`.
