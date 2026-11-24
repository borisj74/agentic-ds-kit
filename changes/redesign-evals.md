### Added

- **Scorecard `goodWhen` ("up" | "down").** With trend up or down the delta reads "Better · +6.3 pts" or "Worse · +17%", with CircleCheck in success or TriangleAlert in danger, so a rising cost never reads as good news by colour alone. `deltaTone` still overrides the colour.

### Changed

- **EvalSuite: deltas in words, counts in the view tabs, a Review column.** Pass rate, cost and latency pass `goodWhen`, so each delta says Better or Worse. The Regressions tile is gone; the tabs read "Regressions 3 / Improvements 6 / All 48". The table columns are Case, baseline, candidate, Score change ("−0.42 of 1", or "No score"), Cost change ("+$0.004") and Review (To review / Accepted / Flagged); Tags leave the default columns and stay a filter. The Promote reason says what to do. Latency reads "1.8 s". The title is 16/24.
- **FailureClusters: agents as text, trend as counts, actions last.** AvatarGroup is gone; the selected cluster names its agents in its meta line. The trend reads "4 more than the previous period" in muted text instead of status colours. `sample.summary` shows as the cause sentence under the heading (and no longer inside the ToolCallCard). Mute, Mark known and Open issue move to the end of the detail. The title is 16/24.
- **ExperimentCard: the metric sits under each value.** Each variant shows "paid within 7 days · 50%" under its value instead of "50% of traffic" under its label. The title is 16/24 and the confidence note is body-sm in muted text.
