### Changed

- **Timeline steps read as groups.** Phase, title and body use line heights that match their sizes (16px, 20px, 20px instead of 24px, 32px, 24px), so lines inside a step sit close and steps stay apart. The dot is centred on the phase line
- **TreeView md rows use 14px text, and the reorder grip shows on the row in use.** md labels move from `--type-size-body` (16px) to `--type-size-body-sm` (14px), in line with ListView. With `reorderable`, the grip appears on hover, keyboard focus, an open Move menu or a drag, and stays visible on touch screens

### Fixed

- **DataTable number columns right-align their values.** `type: "number"` already right-aligned the header; the kit Cell inside each value cell now ends at the same edge
