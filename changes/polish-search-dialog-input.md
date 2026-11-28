### Added

- **`--bg-tray-floating` token.** Fill for a highlighted row on a floating surface such as the Modal card. Same as `--bg-tray` in light; one step above `--bg-floating` in dark, where tray and the card are the same colour.

### Changed

- **Command's active row is a quiet fill, no outline.** The highlighted result no longer draws the 2px focus ring; it uses the tray fill like DropdownMenu's highlighted item (`--bg-tray-floating` inside a Modal, so it stays visible in dark). Keyboard focus still shows on the search row.
