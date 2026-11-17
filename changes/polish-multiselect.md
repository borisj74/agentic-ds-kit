### Fixed

- **MultiSelect is as tall as an Input.** With tags in it, the field was 6px taller than an Input at md (2px at sm), so it broke the line in forms. The shell now trims its vertical padding and keeps an Input's height (42px md, 34px sm); a second row of tags still grows it. The search input's minimum width drops to `--space-10`, so on a phone-width field it stays on the tags' row instead of adding an empty second line. No props change
