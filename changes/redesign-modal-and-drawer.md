### Added

- **Modal, AlertDialog, Drawer and ModalCard take `eyebrow`, `tone` and `footerStart`.** The header shows a tone icon and status word with the eyebrow (Warning · Integrations) next to Close; `footerStart` puts Ask or a count on the left of the footer actions.
- **AlertDialog `consequences` and `confirmText`.** List what happens under the description, and make the person type a name before the action turns on. Focus starts in that field.

### Changed

- **One header and footer for every overlay.** Modal, AlertDialog, Drawer and the AppShell work panel share the ModalCard header (18px h2 title, 14px description, 32px Close) and footer. AlertDialog now composes ModalCard, uses the Modal sizes (sm 352, md 448) and the 16px radius, and has sm buttons.
- **Side Drawer footers are a row.** Left and right Drawers put footerStart on the left and the actions on the right; only bottom stacks.
- **Below 480px** a left or right Drawer opens as the bottom sheet, and a large Modal fills the screen. The AppShell work panel's narrow Drawer follows, so it is a bottom sheet on phones.
- **Focus and page lock.** Modal and Drawer focus the first field in the body (not Close), or the dialog when there is none. The page behind is inert, scroll lock keeps the scrollbar gutter, and focus goes to the page heading when the opener is gone.
- **ModalCard lg padding is 24 (was 32).** A footer divider shows only while the body scrolls.
- **AppShell work panel** uses the ModalCard header with a real h2; Close is named Close. Escape closes it while focus is inside.
