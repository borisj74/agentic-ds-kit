### Added

- **LineChart can stack areas.** A new `stack` prop (`none`, `stacked` or `percent`; the default is `none`) works with `variant="area"`.
  - `stacked` piles the series as bands from the bottom up, so the top edge is the total and the value axis shows it.
  - `percent` scales every label to 100%, with a 0–100% axis, so each band shows that series' share.
  - Bands use `--chart-1` to `--chart-6` in order, with a flatter gradient than a single area and a 2px smooth top edge. They sit on each other with no gaps.
  - The tooltip lists each series, top layer first, plus the total. In percent mode each row also shows its share. The legend uses the same top-first order, and the table adds a Total column.
  - Missing or negative values count as 0, with a development warning for negative values.
  - `stack` is ignored with `variant="line"`, with a development warning.

### Changed

- **The shared smooth curve can now be traced backwards** (`reversedCurveCommands` in `ui/shared/curve.ts`), so stacked bands share their edges. The forward curve itself is unchanged.

### Fixed

- **LineChart lines stop at the plot edges.** The 2px lines' round ends used to reach about 1px past the left and right edges, where the fills and gridlines stop. Every LineChart now clips its lines and areas to the plot width. Hover dots stay whole.
