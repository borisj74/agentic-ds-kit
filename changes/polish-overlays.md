### Changed

- **ModalCard has more room and clearer groups.** Padding is 16 / 24 / 32 for sm / md / lg (was 12 / 16 / 24). The body sits 16 below the title, and the footer sits 24 below the body (16 on sm). The close X lines up with the title and the padding edge. Modal gets the same spacing, since it composes ModalCard.
- **DropdownMenu rows are 36px tall (were 40px).** Group headings start on the same line as item labels, and shortcuts no longer have extra letter spacing. Select options get the same rows, since Select composes DropdownMenu.

### Fixed

- **Modal's scrim covers the whole screen.** The overlay padding no longer shrinks the scrim, so there's no undimmed 16px strip at the viewport edges.
