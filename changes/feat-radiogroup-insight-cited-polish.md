### Changed

- **RadioGroup cards show the choice and follow size.** In the `card` variant the checked card gets a hairline in `--action-selected-border`, the colour its dot already uses, instead of looking like the others. `size="sm"` cards use 14px titles, 12px padding and 8px gaps, so a small option list (as in DecisionCard) sits under its question instead of out-shouting it
- **InsightCard is quieter.** The opportunity and neutral tones use a Lightbulb instead of Sparkles, and the title follows the card size (16px at sm, 18px at md, 24px at lg) instead of 24px at every size
- **CitedAnswer is quieter.** The sparkle avatar goes, so "Assistant · time" leads. Inline citation marks are small raised links at body weight instead of bold mono at body height; they stay real links named "Source N: title"
- **Collapsible titles are 14px.** The panel title drops from body size to `--type-size-body-sm`, so a panel's title no longer out-sizes the content around it
- **ContextWindow's fifth segment reads as filled.** It was the tray colour with an outline, so it looked like a hole in the bar; it is now a solid mid grey, darker than the first segment and the empty track, in the bar and the legend dot
