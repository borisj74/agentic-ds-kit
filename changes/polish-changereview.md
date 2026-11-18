### Changed

- **ChangeReview keeps the file list in view.** Side by side, the file list sticks to the top while a long diff and its comments scroll, and a long list scrolls on its own. Stacked below 64rem it scrolls with the page as before.
- **ChangeReview's file line says position and state only.** "File 1 of 5 · Not reviewed"; the +/− counts already sit in the file row and the diff header.
- **ChangeReview hides the J / K / R hint when stacked.** Below 64rem (usually touch) the keys line is hidden; it stays in the page, so the block's description still reads it.
