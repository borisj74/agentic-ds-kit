### Added

- **Scoreboard can be a metric picker.** `selectable` turns the strip into a radiogroup (arrow keys, Home/End, one tab stop) with `value`, `defaultValue` and `onValueChange`. Each item's `id`, or its label, is its value.
- **Scoreboard `appearance="divided"`.** Plain values in one row with thin rules between them. They stack below about 38rem.
- **Scorecard `sparkline`.** A small decorative trend line under the value, in `--chart-1`. Scorecard also takes `appearance="plain"` (no frame) and `selectionRole="radio"` (role radio instead of aria-pressed).
