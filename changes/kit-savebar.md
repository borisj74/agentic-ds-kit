### Added

- **SaveBar** is a new kit component for form pages. It sticks to the bottom of main, says what is unsaved ("2 unsaved changes" plus the field names), when it was last saved or why the save failed, and holds Discard and Save changes as the page's one solid primary. States `saved`, `dirty` and `error`; `saving` shows Save's spinner. Under 30rem of width it stacks and the buttons go to lg 40.
- **Field `changed`** adds the word "Edited" with a Pencil icon beside the label for a value not saved yet. Put the old value in `hint`.
- **KitLabels `edited`** ("Edited") is the word Field shows for `changed`.
