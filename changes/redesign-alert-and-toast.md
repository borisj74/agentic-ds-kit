### Added

- **Alert has a header, actions and an inline placement.** New props: `eyebrow` and `timestamp` (header row), `onDismiss` (a Dismiss Button), `action` and `secondaryAction` (`{ label, onClick }`, rendered as kit Buttons), and `placement="inline"` for a neutral card surface. `placement="page"` is the default and keeps today's tinted look.
- **Toast has `size`, `progress` and `timestamp`.** `size` is `sm`, `md` (default) or `lg`. `progress` (0 to 100) shows a progressbar and keeps the toast open; clear it and switch to `status="success"` when the work ends. `timestamp` shows next to Dismiss.

### Changed

- **Danger toasts stay open until closed.** `status="danger"` now defaults to `duration: null` (no countdown bar). Pass `duration` to keep the old 5 second close.
- **The toast stack shows at most three toasts**, and toast cards use `--radius-surface-sm`.
