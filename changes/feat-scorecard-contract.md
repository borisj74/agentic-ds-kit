### Changed

- **Scorecard label is sentence case.** The label drops the uppercase, tracked mono overline and uses caption type in the interface font ("Revenue", not "REVENUE"). Scoreboard tiles follow, since they render Scorecard
- **Scorecard padding steps up by size.** sm stays 8px (`--space-inset-sm`), md goes from 12px to 16px (`--space-inset-lg`), lg from 16px to 24px (`--space-inset-xl`)
- **Scorecard delta icon is 16px.** It uses `--icon-size-sm` instead of a raw `0.95rem`
