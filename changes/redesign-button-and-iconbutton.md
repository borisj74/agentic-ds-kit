### Added

- **`--control-height-sm`, `--control-height-md` and `--control-height-lg` tokens** at 32, 36 and 40px. Button, IconButton, Input, Select and FilterButton take their height from them, so controls of one size line up in a row.
- **Button `loading`.** It sets `aria-busy`, shows a spinner in the leading icon slot, keeps the label and ignores clicks. The button stays focusable.
- **`IconButton`.** A typed export of Button for icon-only actions: `icon` and `ariaLabel` are required. It renders Button, so it looks the same.
- **`SplitButton`.** A main action joined to a chevron that opens a kit DropdownMenu of related actions, like Save invoice with Save and send. FilterButton stays the split control for filters.

### Changed

- **Button heights are 32, 36 and 40px.** sm was 26px, md was 38px and lg was 50px. Padding at the sides and type sizes are the same as before.
- **An icon-only Button is a square of its height.** md was 34px and is now 36px; lg was 44px and is now 40px; sm stays 32px.
- **Input and Select use the same heights.** Input was 34, 42 and 50px and is now 32, 36 and 40px. Select was 34 and 42px and is now 32 and 36px.
- **Disabled Button has its own look.** It uses `--text-fg-disabled`, `--border-disabled` and `--surface-muted` in place of `--opacity-disabled`. A disabled ghost Button keeps no fill.
- **Danger Buttons get an icon.** A labelled solid, outline or soft danger Button with no `iconStart` shows a `TriangleAlert` icon, so danger is never colour alone. Pass `iconStart="Trash2"` for a delete.
- **Button's default fill and border no longer use `transparent`.** Solid and soft buttons draw a border in their own fill colour, and ghost has no border. Nothing changes in size.
- **Contracts:** Button documents Ask as a neutral sm Button with a `MessageCircle` icon. FilterButton no longer forbids SplitButton and says which split control is for what.
