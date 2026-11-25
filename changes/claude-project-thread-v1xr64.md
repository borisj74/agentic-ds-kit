### Added

- **FieldSet `layout="side"`.** The legend and description sit in a fixed left column with the fields to their right, and stack when the FieldSet is under 40rem wide. The description is now linked to the group with `aria-describedby`.
- **Alert `children` is optional, and `action` takes `appearance: "outline"`.** A page Alert keeps its tinted box with an outline action when the page already has its solid primary, like an error summary above a form with Save. Leave out `children` when the title says it all.

### Changed

- **settings-form template is now company billing details.** Three FieldSets (Company, Billing address, Currency and invoices) in one Card, legends left when wide. A sticky SaveBar replaces the Save and Cancel buttons and the Toast. Changed fields say Edited with the old value in the hint (on a phone, Edited alone). The phone layout drops the subtitle and moves VAT number under Legal name. Save with errors shows a summary Alert that takes focus and jumps to each field. Discard, and leaving through the page header with changes, ask first in an AlertDialog; closing the tab gets the browser's own prompt. Controls go to lg 40 and the Card frame drops below `--grid-breakpoint-sm`. `onCancel` now fires after a confirmed Discard.
