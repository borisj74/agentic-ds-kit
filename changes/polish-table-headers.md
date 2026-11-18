### Changed

- **Table and DataTable headers are sentence case.** Header labels (Table `th` and HeaderCell, which DataTable uses) move from the overline style (Plex Mono, uppercase, wide tracking) to label type: the body family at caption size and label weight, with no tracking or case change. The Table and HeaderCell contracts list `type.family.body`, `type.size.caption` and `type.weight.label` in place of the four overline tokens. Overlines elsewhere (AppNav, PageHeader, InlineDiff, Command) are unchanged.
