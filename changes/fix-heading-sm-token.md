### Fixed

- **Chart titles, NumberTransition and ShimmerText use a real size token.** They pointed at `--type-size-heading-sm`, which does not exist, so they inherited whatever size was around them. Chart titles and NumberTransition (md) now use `--type-size-ui-md` (16px, what they rendered at on a 16px page), and ShimmerText `lg` uses `--type-size-ui-lg` (18px), so it is larger than `md` as intended.
