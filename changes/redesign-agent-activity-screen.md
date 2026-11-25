### Added

- **ActivityFeed `variant="agent"`.** An agent's steps on the shared history rail, with an Avatar marker per step and a time column when wide. Each event is `{ id, at, actor: { id, name, initials? }, sentence, meta, reason?, undo?: { until, onUndo }, state?: "undone" | "final", note? }`:
  - `sentence` is the step as one sentence, `meta` is agent · app · task · who allowed it, and `reason` is one plain line on why.
  - `undo` shows an sm Undo Button with a mono deadline ("14:22 · 8 min left") until `until`.
  - `state: "undone"` strikes the sentence and adds an Undone Badge; `state: "final"` adds a Lock Badge Final. `note` says who undid it, or what to do instead.
  - No built-in filters and no visible heading: put it in a Card under the page's PageHeader and a FilterBar. Load more reads "Load earlier days".
  - Below 40rem the time joins the meta line, and Undo (with its deadline) or the Badge (with its note) moves under the copy.
  - `feed` and `history` are unchanged.
- **`agent-activity` pattern** (copy-in: `npx agentic-ds-kit add agent-activity`). AppHeader, a PageHeader with Ask, a FilterBar (Agent, Allowed by, App) with the step count, and ActivityFeed `variant="agent"` in a Card. Undo strikes the step and a Toast confirms it. Empty (filtered) and load-error states. Below 640 a Menu IconButton opens the app's nav in a Drawer.
