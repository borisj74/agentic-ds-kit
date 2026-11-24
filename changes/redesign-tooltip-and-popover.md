### Added

- **Popover takes `eyebrow`, `tone`, `title`, `footer` and `footerStart`.** The same header and footer as Modal, so a small anchored panel can carry a heading, a status word and its actions.

### Changed

- **Tooltip is portaled to `document.body` and flips and clamps like HelpPopover.** It no longer gets clipped by a parent's overflow or pushed off screen. Its `ref` is now null while it is closed.
- **Tooltip has a 100ms hide grace and tap-to-pin on touch.** The pointer can move onto the bubble without it closing; on a phone a tap shows it and a tap elsewhere hides it.
- **Tooltip, HelpPopover and Popover share one placement helper.** Popover now flips to the other side when there is no room.
- **HelpPopover uses the shared Escape stack.** Escape closes only the newest overlay, so a HelpPopover inside a Popover closes first and the Popover stays open.
- **HelpPopover corners are 8px (`--radius-surface-sm`) and HelpPopover and Popover titles are 18px at heading weight.**
- **Popover keeps Tab inside the panel** until Escape or a click outside closes it.
- **The Tooltip, HelpPopover and Popover contracts say when to use which**, and the Tooltip contract lists the tokens it really uses.
