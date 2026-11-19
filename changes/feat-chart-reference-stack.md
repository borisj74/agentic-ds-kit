### Added

- **LineChart `referenceLine`.** A labelled dashed guide at a value (like a goal or last period's average). The value axis widens to include it. `highlight: "above" | "below"` marks points of solid series past it with an accent dot; the table and point names say so.
- **LineChart dashed series.** A series with `dashed: true` draws as a dashed line with no fill and a dashed legend swatch, for comparing against the previous period.
- **ComboChart `stack="stacked"` and four bar series.** One bar per column: positive values pile up from zero and negative values pile down, so gains and losses sit either side of the baseline with the net as the line.
