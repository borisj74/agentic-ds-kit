### Changed

- **DashboardPattern is now a revenue overview.** It renders inside the app-shell example (inset, with its workspace switcher, Quick actions, Notifications and Saved views) and has:
  - controls for period, granularity and compare, plus a dismissible one-sentence summary;
  - selectable KPI cards with sparklines that drive the main chart, which has a labelled reference line and a dashed previous period;
  - MRR movements, revenue by plan, retention by signup month and top plans;
  - a "Might churn this month" table and a Needs attention rail;
  - an Ask button on every card, which opens the work panel's Chat with a context chip (the panel also has What changed).
  New props: `metrics`, `selectedMetric`, `compare`, `period`, `granularity`, `insight`, `rail`, `loading`, `panel` and `shell`. `npx agentic-ds-kit add dashboard` now also copies `app-shell`. The old `breadcrumbs` prop is gone.
