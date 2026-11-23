### Added

- **AutonomyDial `savedAt`.** Pass a time and the panel note reads "Saved 14:01" with a check.
- **AgentSteering `pauseNote`.** A footer hint that says what Pause does, for example "Pause finishes the draft, sends nothing". It also describes the Pause button.
- **MemoryPanel `usedLabel`.** Rename the "Used here" badge, for example "Used for this reminder".

### Changed

- **AutonomyDial in a narrow column.** Stacked stops mark the selected row with a check, and the "More oversight / More autonomy" end labels hide.
- **AgentSteering quick steers are kit Buttons.** They render as outline sm Buttons (32px) instead of 24px chips, and stay visible after a steer is applied.
- **ModelPicker cost tier is a word.** `costTier` shows as Low, Standard or High; "$", "$$" and "$$$" still work and show as those words.
- **DropdownMenu disabled items dim only the label, danger items included.** The description (often the reason) and the icon stay readable, so ModelPicker's "Not on the Growth plan" is no longer faded.
- **ContextWindow segment fills use the chart ramp.** Segments use `--chart-1`, `--chart-2`, `--chart-4` and `--chart-5` instead of status colours, so a fill never reads as a state. The compact form shows "Near limit" or "Full" as a word next to its icon, and the warning says the oldest messages drop first.
- **MemoryPanel type.** The title uses the label weight like the other agent panels, and fact text is 14/20.
