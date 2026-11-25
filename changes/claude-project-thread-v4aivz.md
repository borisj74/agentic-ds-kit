### Fixed

- **SideNav closed rail rounds all four corners.** The closed rail clipped the panel's trailing corners, so only the leading corners were rounded. The closed rail now carries the whole frame: one border and `--radius-surface-md` on every corner. The open rail and `radius="none"` are unchanged.
