### Changed

- **RunningNow matches the polished Paper board.** The label and count read in mono (label subtle, count muted). Status icons are 14px: running in the info colour, waiting and failed in caution and danger. The "Needs you" and "Failed" words are read to screen readers only; a waiting or failed item's activity takes the caution or danger text colour instead. Row chips use the small surface radius. Stack rows put 12px between icon and text with the activity in muted text, and the stack's label sits 6px above the list. Loading chips vary in width and stack skeletons use 16px circles.

### Added

- **RunningNow `idleText`.** When nothing runs and you know when the last run was, `idleText="Idle · last run 2h ago"` shows that line with no count on the label and no clock icon. It takes the place of `emptyText` and is ignored while items run or load.
