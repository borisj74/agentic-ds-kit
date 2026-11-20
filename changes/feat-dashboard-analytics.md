### Changed

- **DashboardPattern is now a revenue overview.** It renders inside the app-shell example (inset, with its workspace switcher, Quick actions, Notifications and Saved views) and has:
  - controls for period, granularity and compare, plus a dismissible one-sentence summary;
  - selectable KPI cards that drive the main chart, which has a labelled reference line and a dashed previous period. Each card uses the Scorecard look that fits it: MRR against its target, Net new MRR as an expressive line, subscribers and churn as meters toward a target or under a ceiling, ARPA as the plain line;
  - MRR movements, revenue by plan, retention by signup month and top plans;
  - a "Might churn this month" table and a Needs attention rail;
  - an Ask button on every card, which opens the work panel's Chat with a context chip (the panel also has What changed).
  New props: `metrics`, `selectedMetric`, `compare`, `period`, `granularity`, `insight`, `rail`, `loading`, `panel` and `shell`. `npx agentic-ds-kit add dashboard` now also copies `app-shell`. The old `breadcrumbs` prop is gone.
