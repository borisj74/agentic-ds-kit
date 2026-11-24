### Added

- **SideNav.Item takes a controlled `expanded` and `onExpandedChange`.** Use them to open or close a parent row from your own state. `defaultExpanded` still works when you leave them out.
- **A parent row on the closed rail opens a flyout of its children.** Click it, or press Enter, Space or Right. Escape, Left, a press outside or a pick closes it, and focus goes back to the parent. The parent shows the soft current-page chip when one of its children is the current page.
- **Arrow keys move through SideNav rows.** Down and Up move through the visible rows, Home and End jump to the first and last, Right opens a parent and Left closes it or goes from a child back to its parent.
- **The app-shell pattern has a skip link.** It is the first focusable control, hidden until it has keyboard focus, and moves focus to the page's `<main>`. The label is the new `skipToMain` KitLabels key ("Skip to main content").

### Changed

- **SideNav badges that are numbers render as a kit Count.** A badge such as `"3"` shows a neutral Count, brand-tinted on the active row, and the closed-rail tooltip reads the label plus the count ("Notifications, 3"). Word badges keep the old pill. The prop is still `badge`.
- **SideNav row text is bigger.** Rows use type-size-body and type-line-body (16/24 instead of 14), so rows are 40px tall.
- **SideNav parent rows no longer look selected.** Only the current leaf takes the page-active fill, even if you set `active` on the parent. Disabled rows lose their fill and keep faint text. Rows in a closed submenu are now inert, so Tab skips them.
- **app-shell: Quick actions uses a Search icon at md height (36px), and fills the row.** The icon-only search Button beside it now shows only when you pass `search.onSearch`, since without it the Button did the same as the field.
- **app-shell: the notifications panel uses the Popover header and footer.** The title is the Popover's 18px heading, Notification settings moves to the footer, tab counts use the Tabs `count`, and unread rows say "Unread" instead of showing a New badge.

### Removed

- **app-shell: the unread dot on the closed-rail Notifications icon.** The tooltip carries the count instead.
