### Fixed

- Escape now closes only the newest open overlay. A Combobox or MultiSelect list open inside a FilterBar chip's Popover closes on its own and leaves the Popover open; the next Escape closes the Popover. This holds when the parent re-renders with a new `onOpenChange`, as FilterBar does.
