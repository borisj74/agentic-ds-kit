### Added

- **ScatterChart.** One dot per item, placed by two numeric measures, like accounts by monthly revenue and support tickets.
  - `group` colours dots `--chart-1` to `--chart-6` and adds a legend. `size="value"` sizes dots by area from each row's `size`.
  - Dots are solid with slight transparency and a card-coloured outline. The hovered or focused dot gets a ring.
  - Both axes are quiet, with about 4 ticks (3 on narrow screens) and the bottom and left lines at full strength. Each axis is named.
  - The tooltip shows the label, both measures, and the size and group when set. The arrow keys move between dots in x order, and the Table toggle shows every value.
  - On narrow screens the dots and ticks shrink, with no overflow.
  - Props: `data` (`id`, `label`, `x`, `y`, optional `group` and `size`), `xLabel`, `yLabel`, `size`, `sizeLabel`, `valueFormatter` (`x`, `y`, `size`), `title`, `description`, `height`.
