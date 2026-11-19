### Added

- **Chat takes a `context` chip.** Pass `context={{ label, onRemove? }}` to show what the next message is about (for example a chart card and its period) as a kit Tag above the composer. The composer is described by it ("Asking about …") for screen readers, and `onRemove` makes the Tag removable. New kit label `chatContext`.
