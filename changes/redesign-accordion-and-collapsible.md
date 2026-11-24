### Added

- Accordion `type` (`single` or `multiple`, default `single`); `defaultOpen` also takes an array of ids.
- Accordion items take optional `meta`, `count` and `disabled`, and `content` can hold kit pieces such as a Field or Table.
- Accordion headers move with the arrow keys: Down and Up between headers, Home and End to the ends, Right opens, Left closes. Disabled items are skipped.

### Changed

- Accordion header is the md control height (36) with a 14/20 title. The chevron now sits before the title and turns from right to down.
- Collapsible's whole header row is the toggle button, with the same leading chevron. The boxed ChevronsUpDown toggle is gone, and the button's name is the title instead of "Toggle {title}".
