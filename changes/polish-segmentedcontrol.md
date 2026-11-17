### Fixed

- **SegmentedControl is as tall as a Button.** Its items used the 24px body line height, so the track was 44px at md and 36px at sm next to 40px / 32px Buttons. Items now use the UI line height, and the selected thumb's radius is the track's radius minus its padding (4px), so it follows the track's curve. Components built on it (PricingPlans, CommentsPanel, IntegrationPicker) get 4px shorter. No props change; the contract drops `radius.controlSm`
