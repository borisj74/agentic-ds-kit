### Added

- **Chart palette tokens.** `--chart-1` to `--chart-6` are a soft categorical palette for chart series, mapped to existing colour primitives, with separate light and dark values. Each one has at least 3:1 contrast on the card in both themes. They are in `tokens.json`, `tokens.css` and `usage.json`.

### Changed

- **Charts use the chart palette by default.** BarChart, LineChart and PieChart now colour series from `--chart-1` to `--chart-6` instead of the brand, success, warning, danger, info and accent fills. A single-series chart now draws in `--chart-1`, a blue, instead of the brand colour, so it no longer follows the colour theme. To give a series a status meaning, pass `color` (for example `var(--fill-danger)`).
