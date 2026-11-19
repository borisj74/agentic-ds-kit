### Changed

- **Visual change: the kit font is now Geist and Geist Mono, replacing IBM Plex Sans and IBM Plex Mono.** `--font-sans`, `--font-display` and `--font-mono` read `--font-geist-sans` / `--font-geist-mono` and fall back to the system UI and mono stacks. The kit still ships no font files: load the variable Geist with `next/font/google` and no `weight` list (so the full weight axis loads) as the getting-started guide shows, or override `--font-sans`. Apps that still load only Plex will fall back to `system-ui` until they load Geist.
- **Visual change: every heading role is 550.** `--type-weight-heading` (was 500), `--type-weight-title` (was 700), `--type-weight-display-hero` and `--type-weight-title-section` (were 400) now all read the new `--font-weight-heading` (550). Body stays 400 and labels and buttons stay 500. Avatar initials, FilterButton, AnchorNav, author and list-row names (AgentFleet, AgentMonitor, AgentSteering, IntegrationPicker), block subtitles, tile labels and similar text that borrowed the heading weight now use `--type-weight-label` or `--type-weight-metric`, so they stay 500.
- **Visual change: heading tracking tightens with size.** `--type-tracking-heading` is now -0.02em (was -0.01em) for 14–20px headings, `--type-tracking-title` is -0.04em (was -0.02em), `--type-tracking-display-hero` is -0.06em and `--type-tracking-title-section` is -0.04em (both were -0.03em). Kit headings now use the tracking token that matches their size.

### Added

- **`--font-weight-heading` (550)**, one dial for every heading role and for strong text. It needs the variable Geist to render as a true 550.
- **`--type-tracking-heading-1` … `--type-tracking-heading-5`** for the heading ladder: -0.06em at 40px and up, -0.04em at 24 and 32px. They sit on two new letter-spacing primitives, `condensed` (-0.04em) and `compressed` (-0.06em).
- **`--type-weight-strong`** (reads `--font-weight-heading`, 550). `layout.css` applies it to `strong` and `b` with zero specificity, so emphasis in body copy is 550, not 700.
