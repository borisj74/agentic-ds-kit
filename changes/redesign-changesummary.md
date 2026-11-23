### Added

- **ChangeSummary can narrate a period.** New optional `summary` (a headline sentence above the rows), `groupBy: "sentiment"` (Better, Worse and Steady groups, each with a count in a kit Badge), `why` on each item (a one-line reason under the values, also read out with the row) and `onAsk` (an Ask in Chat Button). With `summary` and no items, the card shows a quiet month instead of the Empty state.

### Changed

- **ChangeSummary actions are kit Buttons.** View full report is now an outline neutral sm Button instead of a link-style button, and loading rows show a second Skeleton line.
