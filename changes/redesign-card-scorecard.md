### Added

- **Card has a header row, a source line and Ask.** New optional props: `icon`, `eyebrow`, `meta` and `onDismiss` put an icon tile, a grey label, a timestamp and an X above the title. `source` adds a grey line under the body. `onAsk` with `askLabel` adds a neutral Ask button with MessageCircle on the left of the footer.

### Changed

- **Card footer is a row under a divider.** Ask sits on the left and the actions on the right. Footer buttons no longer stretch and stack at full width.
- **Scorecard value sizes are three real steps.** sm 18/24, md 24/32, lg 32/40. Before, all three rendered at 24px.
- **Scorecard sm padding is space-4**, so Card and Scorecard share the space-4 / space-6 padding scale. The frame now names the same tokens as Card (`surface-card`, `border-faint`).

### Deprecated

- **Card `headerAction.href` (and `linkAs`).** It still renders a link with the sm Button look. For new cards, put View all in the footer actions.

### Fixed

- **Scorecard no longer uses `transparent`.** The latest-point band and the dashed legend swatch mix against `surface-card`, and the plain appearance drops its border (selected draws an inset brand edge).
