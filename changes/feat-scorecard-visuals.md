### Added

- **Scorecard has three new looks: reference, expressive and meter.** `sparklineVariant="reference"` adds an area fill, a faint grid, a dashed `reference` line with its label, darker dots on the last `highlightLast` points and start and end dates (`sparklineDates`). `sparklineVariant="expressive"` draws a smooth curve with a soft area, a dashed previous period (`compare`, in `--chart-5`) with a This period / Previous legend, and the latest point's value in a small tag on its end dot. `meter={{ value, max, label, direction }}` swaps the line for a calm kit Meter bar toward a target, or under a limit with `direction: "lower"` (past the limit it turns amber and says Over limit). The plain line stays the default, so existing cards don't change. Scoreboard passes each look through per item.

### Changed

- **Scorecard sparklines have square line ends.** The plain line and the new looks use butt caps and miter joins.
- **Scoreboard strips of more than four cards share the strip's width.** Cards grow to fill the row and scroll only once each would drop below 12rem, so labels no longer wrap on wide screens.
