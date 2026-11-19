### Added

- **ComboChart.** Bars and a line on one chart over the same categories, like revenue with its growth rate.
  - Bar series are solid, in `--chart-1`, `--chart-2` and `--chart-4`. The line is 2px and smooth in `--chart-3`, with no area fill.
  - `axis="shared"` (the default) puts both on one left axis. `axis="dual"` gives the line its own axis on the right, with its ticks on the same gridlines.
  - The tooltip shows every bar and line value for the column you hover or focus. Tab and the arrow keys move column by column. The legend shows both kinds of series, and the Table toggle shows every value.
  - Value axes size their margin to their widest label. Category labels thin out on narrow screens, and very dense charts scroll sideways with the axes pinned.
  - Props: `data`, `bars`, `line`, `axis`, `valueFormatter` (`bars` and `line`), `title`, `description`, `height`.

### Changed

- **The LineChart smooth curve now lives in a shared module** (`ui/shared/curve.ts`), so ComboChart draws the same curve. LineChart output is unchanged.
