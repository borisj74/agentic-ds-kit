### Added

- **RunningNow `onStop(id)`.** Running and waiting items get an icon-only Stop named "Stop <name>", beside the item.
- **AgentPlan `steps[].calls` and `trace`.** A step's tool calls show under it as one ToolCallCard group row, and `trace` takes a compact TraceWaterfall in the header for time and cost so far.
- **TraceWaterfall `spans[].stepId`.** Spans group under their plan step heading.

### Changed

- **One status set across the run components: Queued, Running, Needs you, Done, Failed.** RunningNow shows Needs you and Failed as visible words, AgentPlan steps show their status word during a run, AgentTree and AgentTrail say Needs you, and ToolCallCard says Failed (CircleX) instead of Error. The `status` values are unchanged.
- **TraceWaterfall tool spans are neutral (`line.strong`), bars and legend marks are square, and a failed span shows an icon and the word Failed.**
- **Retry and Approve are small outline neutral Buttons** in AgentTree (no ⏎ chip on Approve) and AgentPlan.
- **DoneCheck has one visible action per row.** Mark met and Mark not met move into a row "More actions" menu, and evidence notes and links show inline; long output stays in a Collapsible.
- **Icons are 16px and focus uses the shared box-shadow ring** in RunningNow, AgentTree, AgentPlan, TraceWaterfall, ToolCallCard and AgentTrail.
