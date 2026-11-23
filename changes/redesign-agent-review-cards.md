### Added

- **ApprovalCard `facts`.** An optional `{ label, value }[]` says what will happen and why the risk is what it is (e.g. Will do / Why medium), as a `dl` above the exact command or diff.
- **PermissionRequest scope `limit`.** Each scope can say how far the access goes, e.g. "$500 per refund".
- **DecisionCard option `disabled` and `disabledReason`.** A disabled option stays in the list and says why instead of disappearing.

### Changed

- **One yes key and one no key on the review cards and blocks.** ⌘/Ctrl+Enter is the yes on ApprovalCard, PermissionRequest, DecisionCard, InlineDiff, PlanReview and ChangeReview; Escape is the no when focus is not on another control. ApprovalCard no longer approves on plain Enter. PlanReview now approves with ⌘/Ctrl+Enter and rejects with Escape; ChangeReview accepts all with ⌘/Ctrl+Enter outside text fields.
- **Key hints move off the buttons.** Shortcut chips are gone from the review buttons; one hint line in the footer (e.g. "⌘⏎ approve · Esc deny") spells out the keys and hides on touch screens. The yes buttons carry a Check icon.
- **One resolved row for all four cards.** Approved, granted, chose and accepted show a CircleCheck; denied and rejected a CircleX; expired a Clock. Expired is a solid row, no longer dashed on a see-through background.
- **Card sizing.** The four cards use `space-5` padding, an 18/24 title and the shared focus ring. ApprovalCard drops its fixed 25rem width and fills its container.
- **Words, not only symbols.** PermissionRequest access Badges read Read, Write or Admin, and its error Retry is a kit Button. InlineDiff counts read "2 added, 2 removed".
- **DecisionCard Skip** is an outline button labelled Skip and takes Escape.
- **PlanReview Reject and ChangeReview Reject file** are outline neutral, not danger. ChangeReview's Accept all moves to a footer beside the keys line.
