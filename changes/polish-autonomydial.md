### Fixed

- **AutonomyDial no longer wraps its scale 3 + 1.** The one-stop-per-row layout now follows the dial's own width (a container query at 36rem) instead of the viewport, so a dial in a narrow column, like PlanReview's side column, lists its four stops down the column instead of breaking the oversight-to-autonomy row onto two lines. A dial wide enough for one row keeps it.
