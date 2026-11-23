### Added

- **ActivityFeed `variant="history"` for one record's events.** It shows an invoice or similar record on the same rail as Timeline and AgentTrail, with a time column when wide and the status word at the end of each row. On a phone, the time and status move into a line under the event.
- **ActivityFeed status chips.** `statusChips` adds All plus one chip per status word, using the kit SegmentedControl. Control it with `statusChip` and `onStatusChipChange`.
- **ActivityFeed error state.** `error` shows "Couldn't load activity" with your reason, and `onRetry` adds an outline Retry button.

### Changed

- **Timeline says Now, Next or Later in every step's phase line**, so the status no longer relies on the dot colour. A phase that already says the word is not repeated.
- **Timeline hollow dots fill with `bg-surface`** instead of `transparent`, so the line no longer shows through.
