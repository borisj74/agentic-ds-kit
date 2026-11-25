### Fixed

- **SideNav closed rail rounds all four corners.** The closed rail clipped the panel's trailing corners, so only the leading corners were rounded. The rail now keeps `--radius-surface-md` on every corner. The open rail and `radius="none"` are unchanged.
