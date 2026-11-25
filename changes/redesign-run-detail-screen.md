### Added

- **RunDetail `calls="all"`.** Every started step's ToolCallCard stacks beside the trail in step order, the failed one open with its error, "Attempt 1 of 3" and Retry. Retry shows only on that ToolCallCard. The calls fold once the run is done. Picking a trail step scrolls to its call. In this mode the monitor is the one-row AgentMonitor bar and the block heading is for screen readers only, since the page's PageHeader names the run.
- **RunDetail `trace`.** Pass TraceWaterfall spans to get a compact "Run trace" in place of the monitor's step strip. It hides below 40rem of block width; time and cost stay in the monitor.
- **RunDetail `onStop` and AgentMonitor `onStop`.** While a run is running, "Stop run" (sm, outline, danger) sits beside Pause. A kit AlertDialog asks once ("Stop this run?") and confirming calls `onStop`.
- **RunDetail step `attempt`** (`{ n, max }`) shows "Attempt 1 of 3" beside Retry on a failed step's ToolCallCard.
- **`run-detail` pattern** (copy-in: `npx agentic-ds-kit add run-detail`). AppHeader, a PageHeader with a Runs breadcrumb, the meta line and Ask, then RunDetail with `calls="all"` and the trace. Northwind demo data with Failed, Running and Done states. Below 640 a back bar (Runs, Ask) replaces AppHeader.
- **AgentTrail `variant="list"`** (default `"rail"`): plain rows without the rail line or the status line, the done time or the status word on the right, a "2 of 4" counter, and a filled selected row. RunDetail `calls="all"` uses it.
- **ToolCallCard `variant="panel"`** (default `"default"`): a grey body with white code boxes, Arguments and Result side by side, arrays of plain values on one line, no status Badge in the head, and Attempt on the left with Retry on the right. RunDetail `calls="all"` uses it. Other ToolCallCards are unchanged.

### Changed

- **RunDetail `agents` is optional.** Leave it out for a single agent and no AgentTree renders.
- **AgentMonitor `collapsed` is now a one-row bar.** It shows the status as a Badge (icon and word) first, then the name and headline, then elapsed and cost (each value over its label). It shows Pause and Stop run while running, and Cancel run and Resume while paused. Before, the collapsed row showed the name with "elapsed · cost" under it and a dot status chip, and it had no actions. The step strip and the expand toggle stay where they were. Below 40rem the name and labels hide, time and cost read "0:04 · $0.02", and the actions take a full row. If you use `collapsed`, it now looks different, but it keeps the same props and doesn't break.
- **AgentTrail counter and current step.** A failed step with a later done step (its retry passed) now counts as finished: the counter moves past it and it no longer gets `aria-current`. A Done run with a retried step reads "5 of 5".
- **AgentTrail selected step** is a soft brand fill with a light brand edge (radius-control-md) instead of a heavy brand outline, so it no longer reads as a focus ring.
