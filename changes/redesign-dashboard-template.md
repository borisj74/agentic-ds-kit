### Changed

- **The dashboard template is now a billing home.** `npx agentic-ds-kit add dashboard` copies a page titled Billing with Export and one solid New invoice, and two tabs. Overview has four selectable KPIs (MRR, Collected, Overdue, Failed payments) that pick the revenue chart's metric, a chart card whose title states the finding ("MRR is $7.4k below the $420k target"), a Needs attention card and the oldest overdue invoices in a stacking Table. Needs attention leads the source order, so it is the first card on a phone, and the grid puts it beside the chart when wide. Every Overview card uses Card md wide and sm narrow, with a labelled Ask in its footer.
- **The analysis charts moved to a Revenue tab.** MRR movements, revenue by plan, retention by signup month and top plans move across as they were, with the period, granularity and Compare controls and the summary. The three stub tabs (Subscribers, Churn, Cohorts) are gone.
- **Dashboard demo data.** `DashboardMetricId` is now `mrr | collected | overdue | failed`; the Might churn table and its data became Overdue invoices (`OVERDUE_INVOICES`). If you copied the pattern before, your copy keeps working; only new copies change.

### Removed

- **The dashboard's MRR change strip** (`mrrSteps.ts`) and the per-tile sparkline looks (`metricLook`). The D design draws neither.
