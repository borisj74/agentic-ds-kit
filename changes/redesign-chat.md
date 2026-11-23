### Added

- **Chat answers can show the figures they quote.** Assistant messages take `parts` (metrics as Scorecard sm, a Table sm, a small LineChart area, a sources line and follow-up pills that send), and `steps` that collapse into one "3 steps · 2.4s" row.
- **Chat shows its work.** `thinkingSteps` draws a live step list while thinking, `onStop` swaps Send for Stop, and messages take `status: "streaming"` (caret and a placeholder for parts still coming) or `status: "error"` with an `error` card that offers Retry and Copy details.
- **Chat has a guided empty state.** `greeting`, `intro`, rich `suggestions` (`{ label, hint, icon }`, shown as LinkList rows), `recent` (ListView; a row sends its question again unless it has `onSelect`) and `recentEmptyLabel`. Plain string suggestions work as before.

### Changed

- **Chat looks closer to the redesign board.** User messages sit in a soft bubble, assistant answers use the full width, and a context Tag moves under the intro in the guided empty state.
