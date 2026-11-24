### Added

- **Progress `indeterminate`.** A bar for work that is underway when the percent is not known. A third of the track slides across, aria-valuenow is left off, and with reduced motion it is a faint still fill. Rings fall back to the bar.
- **Progress `tone="success"`** for a finished or healthy result.
- **Skeleton `layout`: `table`, `card` and `list`.** One piece holds a whole loading area with one Loading label. `lines` sets the rows.
- **Spinner `inverse`** for a primary fill: the mark and label use the on-primary ink.

### Changed

- **Progress bars have square ends**, like the ring caps.
- **Progress percent text is Geist Mono** with tabular figures (end, overlay and ring values).
- **Spinner `sm` is 12px** (was 14). md 16 and lg 20 stay.
- **A loading Button keeps its width.** With no leading icon, the inline padding makes room for the spinner instead of the button growing.
