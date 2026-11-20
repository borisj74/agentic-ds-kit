### Added

- **Charts take `actions`.** LineChart, BarChart, ComboChart, Heatmap, PieChart and ScatterChart put kit Buttons in their header before the Table toggle, for example an icon-only Ask.
- **Card header actions can be icon-only, and there can be two.** `headerAction` takes one action or an array of up to two; more are ignored, with a warning in development. `iconStart` adds an icon, and `iconOnly` makes it an icon-only Button named by `label`.
- **ListView rows take `dot` and `meta`.** `dot` is a small status dot in the leading slot, and its tone (Note, Good, Warning, Problem, Info) is read as part of the row name. `meta` is short muted text at the row end (like "2h ago"), also read in the row name.

### Changed

- **Card `headerAction` with `href` looks like the other header Buttons.** It is still a real link (`<a>`, or `linkAs`), now with the neutral sm Button look instead of underlined link text.
- **InsightCard `description` takes inline nodes**, so key numbers can sit in `<strong>`.

### Fixed

- **New types from the last releases are importable from `agentic-ds-kit`:** `ChatContext`, `ScoreboardItem`, `ScoreboardAppearance`, `ScorecardAppearance`, `ScorecardSelectionRole`, `LineChartSeries`, `LineChartReference`, `LineChartReferenceHighlight`, `ComboChartStack` and `ListViewDotTone`.
