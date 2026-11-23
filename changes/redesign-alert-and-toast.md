### Added

- **Alert has a header, actions and an inline placement.** The header reads `Warning · Billing`: the tone word, then `eyebrow`, with `timestamp` and Dismiss on the right. New props: `eyebrow`, `timestamp`, `onDismiss` (a Dismiss Button), `action` and `secondaryAction` (`{ label, onClick }`, rendered as kit Buttons), and `placement="inline"` for a neutral card surface. `placement="page"` is the default and keeps today's tinted look unless you set `eyebrow`, `timestamp` or `onDismiss`.
- **Toast has `size`, `progress` and `timestamp`.** `size` is `sm`, `md` (default) or `lg`. `progress` (0 to 100) shows a progressbar and keeps the toast open; clear it and switch to `status="success"` when the work ends. `timestamp` shows next to Dismiss.
- **KitLabels keys `info`, `success`, `warning` and `danger`** for the Alert tone word (English: Info, Success, Warning, Error).

### Changed

- **A warning Alert uses `role=status`, not `role=alert`.** A warning shown on page load is not urgent. danger stays `role=alert`.
- **Danger toasts stay open until closed.** `status="danger"` now defaults to `duration: null` (no countdown bar). Pass `duration` to keep the old 5 second close.
- **The toast stack shows at most three toasts.** Older ones are hidden, their timers pause, and they are left out of the live region until a newer one closes. Toast cards use `--radius-surface-sm`.
