### Added

- **Empty `kind`**: `no-data`, `no-results`, `first-use` or `permission`. It sets the default icon and the role (role=status for all but first-use, which gets the brand tile). Failures are not a kind; use LoadError.
- **Empty `size`**: `sm` (in a chart, list or table cell; bare 16px icon, the title is a sentence, no heading), `md` (default, a card body, 32px tile) and `lg` (a page, 40px tile, heading-5 title).
- **LoadError is a public component** with `message`, `reference`, `onRetry` and `size` (sm, md, lg). role=alert. After a retry that fails again, focus returns to Try again.
- **KitLabels `tryAgain`** ("Try again") for the LoadError button.

### Changed

- **Empty md looks smaller.** The 48px round well becomes a 32px square tile with a 16px icon, and the title goes from heading-5 to the 18/24 ui-lg size. Use `size="lg"` for the old page-sized heading.
- **Every kit error row now renders LoadError.** ChartFrame charts, ChangeSummary, TaskBoard, PricingPlans, CommentThread, CommentsPanel, NotificationStack, ExperimentCard, SetupGuide, InvoiceDocument and IntegrationPicker show a centered icon, the message and a "Try again" Button instead of the red strip with "Retry".
