### Added

- **DropdownMenu radio groups.** A group with `selection: "radio"` renders `menuitemradio` rows with `aria-checked`; `selected` marks the one chosen.
- **DropdownMenu typeahead.** Typing letters in an open menu moves to the next item whose label starts with them.
- **Command `description`, `keywords`, `loading` and `onAsk`.** Items can show a one-line description after the label, search also matches descriptions and hidden keywords, `loading` shows a Spinner row and sets `aria-busy`, and `onAsk(query)` adds an Ask Chat row that stays when nothing matches.
- **Command key footer and live result count.** A footer shows ↑↓ Navigate, ↵ Open and (inside a Modal) Esc Close; a polite live region reads "3 results" after each search. New KitLabels keys: `navigate`, `openItem`, `resultCount`, `loadingResults`, `ask`, `askHint`, `askAbout`.

### Changed

- **DropdownMenu and Command share one item anatomy.** Rows follow size (DropdownMenu sm 28px, md 32px default, lg 40px; Command 40px), with a bg tray highlight, 4px item radius, 8px padding, secondary icons and full-width group separators. DropdownMenu rows were 36px; descriptions now sit on the label line with an ellipsis.
- **Shortcuts render as Geist Mono key chips.** One chip per key (`⇧⌘P`, `Ctrl K`, a `G I` sequence), aria-hidden, with `aria-keyshortcuts` on the item for chords.
- **Selected and radio checks move to the end slot.** A `selected` item keeps its start icon; the check (or a 16px spacer) sits at the end, where the submenu chevron goes. Select's option checks move to the end too.
- **Command's highlighted row shows the focus ring** while Command has focus.
- **DropdownMenu caps its height** at the screen minus 16px for every menu, not only searchable ones; the list scrolls inside the panel.
- **Placement and which-one rules in the contracts.** command.json and dropdownmenu.json now list the flip and placement rules and when to use Command, DropdownMenu or Select. Cell `actionMenu` docs name the menu after the row ("Actions for INV-1842").
