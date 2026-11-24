### Added

- **Delta atom.** How a value moved: an arrow and the signed change (`+$600`, `−$90`, `No change`) in success, danger or neutral text, with no fill. `direction` up, down or flat; `tone` overrides the colour when a rise is bad news.
- **Avatar `shape` and `presence`.** `shape="square"` for organisations (customers, workspaces). `presence` online, away or offline draws a corner mark with its own shape and adds the word to the accessible name; the words come from new KitLabels keys `online`, `away`, `offline`.
- **Avatar and AvatarGroup sizes `xs` (20) and `xl` (48).**
- **Badge `icon`.** Optional leading tone icon (CircleCheck for Paid, CircleX for Overdue). Plain role labels stay without one.

### Changed

- **Avatar sizes remapped (breaking).** `sm`, `md` and `lg` are now 24, 32 and 40 (were 32, 40 and 48). Use `md`, `lg` and `xl` for the old sizes. Applies to AvatarGroup and to kit pieces that render avatars.
- **Avatar initials get a tint from the name.** The same name always gets the same tint, from existing tone tokens.
- **Badge sizes and look.** `sm` is 20 and `md` 24 tall (`lg` 28), with no border and a 4px corner (`--radius-sm`). Solid fills use the tone's fg ink token. Outline draws its hairline inside, so heights stay exact. Soft neutral uses `--bg-tray` so it shows on canvas grounds.
- **Tag corner is 4px**, matching Badge.
- **AvatarGroup** rings each face with `--surface-card` (2px) and gives the +N a proper accessible name (role img, "3 more").
- **Cell `trendPositive` / `trendNegative` render a kit Delta** (arrow and signed value) instead of a chevron. Same props; put the sign in the value.
- **Scorecard `delta` renders a kit Delta** (arrow from `trend`, colour from `trend` or `deltaTone`). Trend `neutral` with a `deltaTone` still shows the tone's status icon.
- **MultiSelect overflow is a kit Count** (neutral, subtle) instead of a Badge `+N`.
- **Contracts name which mark to use.** Badge, Tag, Count, Delta, Avatar, AvatarGroup and ListView each say their one job.
