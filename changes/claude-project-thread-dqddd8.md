### Changed

- **Icons use stroke width 2, Lucide's default.** `ICON_STROKE` and `--icon-stroke` go from 1.5 to 2, so every kit icon and any `svg.lucide` you pass in gets a slightly heavier line. `ICON_STROKE_STRONG` and `--icon-stroke-strong` stay at 2 and are now the same value; they are kept so existing imports keep working. The `agent-permissions` and `settings` patterns drop their local `strokeWidth={1.5}`, so re-copy them (or delete that prop) if you added them before.
