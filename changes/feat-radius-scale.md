### Changed

- **Radius is a fixed scale on 2 and 4px steps.** `--radius-xs` 2px, `--radius-sm` 4px, `--radius-md` 6px, `--radius-lg` 8px, `--radius-xl` 12px, `--radius-2xl` 16px, `--radius-3xl` 24px, `--radius-full` 9999px. Before, every step was computed from `--radius-base` (3, 5, 6, 8, 10, 13, 19). Role tokens point at the same steps as before, so these change in pixels: `--radius-control-sm` 3 → 2px, `--radius-surface-md` 10 → 12px, `--radius-surface-lg` 13 → 16px, `--radius-media-lg` 10 → 12px. The numbered aliases follow: `--radius-50` 3 → 2px, `--radius-100` 5 → 4px, `--radius-300` 10 → 12px, `--radius-400` 13 → 16px, `--radius-500` and `--radius-600` 19 → 24px.
- **`--radius-base` no longer moves the scale.** It stays 8px. To retheme corners, set the steps (or the role tokens) you want.
- **New layout rule in `AGENTS.md`:** radius and spacing use only 2 or 4px steps.
