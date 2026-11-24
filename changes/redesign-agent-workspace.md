### Added

- **`AgentStatus` and `toAgentStatus()`.** One status language for agents and runs: queued, running, needs-you, paused, done, failed, drawn as an icon plus the word. `toAgentStatus()` maps the older words (waiting and approval to needs-you, idle and pending to queued).
- **AgentOverview: `view`, `defaultView`, `onViewChange`, `onReview`, `onAsk`, `onNewTask`, and `status`, `now`, `cost`, `subAgents` on each agent.** List is the default view; Timeline renders AgentLanes on wide blocks only.
- **ListView: `actionLabel` on a row action.** The button's accessible name when the visible label is not enough, e.g. visible "Review", read as "Review Tax checker". Leave it out and the button keeps its visible text. AgentOverview rows use it.
- **RunDetail: `messages`, `onSend` and `thinking`.** An Ask panel (kit Chat) under the trail to ask or steer the agent on the run.

### Changed

- **AgentOverview is redesigned.** Needs you shows the oldest open request as one ApprovalCard and counts the rest; All agents lists each agent with an icon-and-word status, one fact, its cost and one action (Review for failed, Ask for running); a Since rail (ActivityFeed history) lists what happened after the last visit. The Scoreboard summary, the activity BarChart and the AgentInbox list are gone, the filter now counts agents, not events, and the default title is "Agents".
- **AgentTrail shows each step's status word as visible text** under its label, and the failed step is the current step (`aria-current="step"`) when nothing runs or waits.

### Deprecated

- **AgentFleet, AgentLanes and LiveSession.** Use AgentOverview (and its Timeline view) and RunDetail with `messages` and `onSend`. AgentInbox, AgentTrail, AgentMonitor and TaskBoard stay exported for one more release, then become internal parts of AgentOverview, RunDetail and WorkBoard.
