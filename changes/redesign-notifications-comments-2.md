### Added

- **CommentsPanel `inline="auto"` docks the panel beside the page from `--grid-breakpoint-lg`.** Below that, the same trigger opens the Drawer. Closing the docked panel brings the trigger back and moves focus to it. Until the client has read the breakpoint (server markup, hydration) it renders only the trigger, so a wide first paint never flashes the Drawer.
- **CommentsPanel threads take an optional `context`.** The open thread's meta line then names the record: "INV-1842 · 3 comments · Open".

### Changed

- **CommentsPanel inline is a complementary region named by `label`**, not a generic region. Below 40rem the back button reads "Threads".
- **NotificationStack and CommentsPanel headers are the same height (56).** The "2 open" count uses the same sans caption as "3 unread".
- **The NotificationStack bell is a kit IconButton.** It looks the same.
