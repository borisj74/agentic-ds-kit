### Added

- **Select takes `size="lg"`** (40px), matching Input and Button lg.
- **Field takes `optional`, `required` and `success`.** `optional` adds a muted "Optional" after the label (KitLabels `optional`). `required` sets `aria-required` on Input, Textarea, Checkbox, Switch and ColorPicker, with no asterisk. `success` shows a CircleCheck message, e.g. "Email verified."
- **Field accepts NumberInput, CurrencyInput, MultiSelect and TagInput** as its control.

### Changed

- **Field keeps the hint when an error shows.** The error goes under the hint with a CircleX icon, and no longer has `role="alert"`; use an Alert error summary on submit (see the Field docs). Hint and message text are now 12/16.
- **Field spacing is 8px from label to control and 4px below the control**, instead of 8px everywhere.
- **Disabled controls use the disabled tokens instead of fading.** Input, NumberInput, TagInput, TimePicker, the shared field controls, Checkbox and Switch no longer use opacity.
- **Read-only Input and Textarea get the tray fill** and keep full contrast.
- **Checkbox md is 16px** (was 18.4px). **Switch is 32 by 20 (sm), 36 by 20 (md) and 40 by 24 (lg)**, on the 4px grid.

### Fixed

- The Field contract `passthrough` no longer says `div[role=group]`.
