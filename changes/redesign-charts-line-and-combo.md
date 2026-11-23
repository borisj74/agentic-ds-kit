### Added

- **LineChart `highlightLast`.** A dot and a value chip on the latest point of the first solid series.
- **LineChart `changeStrip`.** A short bar strip under the plot on the same labels, like net change per day. Square bars go up for gains and down for losses in one colour, on their own scale. It shares the crosshair and tooltip and adds a legend item, a table column and a part of each point's accessible name. The default format is signed with a real minus sign (+1,200, −1,600).
- **`error` and `onRetry` on LineChart and ComboChart.** The plot is replaced by the kit's "Couldn't load" row with Retry.
- **`tooltipNote` on LineChart and ComboChart.** One sentence under the tooltip rows for a sample, like "The largest one-day drop in 30 days."
- **ComboChart `isLoading` and `emptyLabel`**, the same as on LineChart.

### Changed

- **Square line ends and square bars.** LineChart and ComboChart lines use square caps and mitred joins; ComboChart bars lose their 2px corner radius.
- **ComboChart `axis="dual"` fits the line's own range.** The right axis no longer forces zero, so a running total like MRR keeps its shape instead of lying flat at the top.
- **Chart loading sets `aria-busy`** on the chart body.
