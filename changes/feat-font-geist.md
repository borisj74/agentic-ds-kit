### Changed

- **Visual change: the kit font is now Geist and Geist Mono, replacing IBM Plex Sans and IBM Plex Mono.** `--font-sans`, `--font-display` and `--font-mono` read `--font-geist-sans` / `--font-geist-mono` and fall back to the system UI and mono stacks. The kit still ships no font files: load Geist with `next/font/google` (weights 400, 500, 600; Geist Mono 400, 500) as the getting-started guide shows, or override `--font-sans`. Apps that still load only Plex will fall back to `system-ui` until they load Geist.
- **Visual change: every heading role is semibold (600).** `--type-weight-heading` goes from 500 to 600, and `--type-weight-title` (was 700), `--type-weight-display-hero` and `--type-weight-title-section` (were 400) are now 600 too. Body stays 400 and labels and buttons stay 500. Avatar initials, FilterButton, AnchorNav, author names, tile labels and similar text that borrowed the heading weight now use `--type-weight-label` or `--type-weight-metric`, so they stay 500.
- **Visual change: heading tracking tightens with size.** `--type-tracking-heading` is now -0.02em (was -0.01em) for 14–20px headings, `--type-tracking-title` is -0.04em (was -0.02em), `--type-tracking-display-hero` is -0.06em and `--type-tracking-title-section` is -0.04em (both were -0.03em). Kit headings now use the tracking token that matches their size.

### Added

- **`--type-tracking-heading-1` … `--type-tracking-heading-5`** for the heading ladder: -0.06em at 40px and up, -0.04em at 24 and 32px. They sit on two new letter-spacing primitives, `condensed` (-0.04em) and `compressed` (-0.06em).
- **`--type-weight-strong` (600).** `layout.css` applies it to `strong` and `b` with zero specificity, so emphasis in body copy is semibold, not 700.
