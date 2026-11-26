### Changed

- TraceWaterfall matches the polished design: a kind-coloured dot before each row label (failed rows keep their icon and "Failed"), Paper's lane widths, 14px bars, rows with no gap between them, and tighter card spacing.
- TraceWaterfall tool spans are teal (`--chart-2`) instead of grey. Costs are medium weight, and a missing cost shows a subtle "—". Whole seconds drop the ".0" (58s). The detail badge is primary. "dashed = still running" shows only while a span is still open (no `endMs`).
- TraceWaterfall failure note is sans and medium weight, and the load-error banner has the polished padding.
