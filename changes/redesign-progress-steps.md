### Added

- **ProgressSteps `optional` steps.** Set `optional: true` on a step. While it is upcoming it gets a dashed marker and the word Optional.
- **ProgressSteps `onStepClick`.** When you pass it, completed steps become buttons named by their label, with the kit focus ring. Upcoming steps stay inert.

### Changed

- **ProgressSteps shows a status word under every label:** Done, Current, Upcoming, Error or Optional. Screen readers hear the same word plus "step n of m".
- **Horizontal ProgressSteps goes compact in a narrow container.** Below 30rem it shows "Step n of m", the current label, and a kit Progress bar with the next step in words.
