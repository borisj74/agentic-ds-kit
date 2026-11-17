### Fixed

- **MultiSelect is as tall as an Input.** With tags in it, the field was 6px taller than an Input at md (2px at sm), so it broke the line in forms. The shell now trims its vertical padding and keeps an Input's height (42px md, 34px sm); a second row of tags still grows it. No props change
