### Changed

- **FilterButton, Combobox and MultiSelect sit on the shared control scale.** `sm` is 32px, `md` 36px and FilterButton `lg` 40px, with 14/20 text (16/24 at `lg`). FilterButton was 32 / 40 / 48; Combobox and MultiSelect `md` were 42.
- **One ChevronDown on every filter and select trigger.** Combobox swaps its up-down chevrons for ChevronDown. The FilterBar `+N` overflow trigger shows a ChevronDown like the chips and still opens a kit DropdownMenu.
- **MultiSelect has a trailing chevron button** (Show options / Hide options) after the tags. Its tags render at Tag `sm` so the field holds 36px.
- **Off and disabled states.** An off FilterButton keeps its dashed outline on the page canvas fill instead of no fill. Disabled FilterButton, Combobox and MultiSelect use `--surface-disabled`, `--border-disabled` and `--text-disabled` instead of lowering opacity.
