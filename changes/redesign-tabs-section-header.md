### Added

- **Tabs take an icon and a count per tab, an `overflow` mode and an `activation` mode.** A count renders as a neutral kit Count and is part of the tab's name. `overflow="more"` moves tabs that don't fit into a More menu (new KitLabels key `moreTabs`); `activation="manual"` makes arrow keys move focus and Enter or Space select.
- **Section takes `eyebrow`, `count`, `headingLevel` (2, 3 or 4), `divider` and `sticky`.**
- **PageHeader takes a `tabs` slot and `overflowActions`.** Page Tabs render under the title inside the header. Overflow actions show as outline Buttons and fold into one ⋯ menu when the header is narrower than 40rem.

### Changed

- **Headers share three title sizes: page 24, Section 18, Card 16, all at heading weight.** Section titles drop from 24 to 18 and Card titles from 24 to 16; the Section chevron is 16px.
- **PageHeader's eyebrow is sentence case (12/16, weight 500) instead of an uppercase overline,** and its lines are spaced with gap, so a header without an eyebrow or subtitle leaves no empty space.
- **On narrow headers (under 40rem) the breadcrumb trail shrinks to one back step** to the page before.
- **Tabs stay on one line and scroll sideways when they don't fit (the default `overflow="scroll"`)** instead of wrapping onto a second line.
- **Segmented Tabs use the SegmentedControl track:** the thumb's radius nests inside the track's and the label uses the UI line height.
