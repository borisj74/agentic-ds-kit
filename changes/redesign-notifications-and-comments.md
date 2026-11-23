### Added

- **NotificationStack items take `group` and `action`.** `group` ("Today", "Yesterday") gathers items under a heading; `action` adds one outline sm Button under a row, for events that need a decision such as Retry payment.
- **CommentThread takes `members` for @mentions.** Typing @ in the composer opens a member list above the field (arrows, Enter to insert, Escape to close). `@Full Name` of a member or anyone in the thread now reads as brand text.

### Changed

- **NotificationStack rows show unread as a shape and a word.** A 12px filled or hollow rail marker plus a New badge replaces the trailing dot; times sit in a mono 40px column. The bell is now an sm (32) Button, the Popover is 24rem, Mark all read and View all are ghost and outline sm Buttons (no text links), and Mark all read is announced. Below 40rem the list opens in a full-height Drawer.
- **CommentThread actions are kit Buttons and a menu.** One ghost sm Reply per thread, Edit and Delete in a More menu (DropdownMenu), and an md composer row with Comment beside a field that grows to four lines, plus a "⌘ Enter to send" hint.
- **CommentsPanel thread view.** All threads is a ghost Button, the thread says "3 comments · Open" in words, the inline header shows the open count, and Close, Back and Resolve grow to md on phones.
