# Notes

Decisions for the nistha website (the docs site in this repo), newest first.

## 2026-11-10: Screens (feat/screens-patterns-1, -2)

Source: Paper file *Nistha Agent Patterns* (`01M6S6EXZCX07PR8P1YXPE8BQE`), page p-6-0 "Nistha Screens": 70 artboards at 1440×900. They are two sets (Settings, Onboarding), each in light and dark, and each drawn twice: once with the AppHeader + SideNav chrome (first row) and once as a "Stage" (second row: no top bar, nav with brand and search, the page on an inset panel, the site's own look). **Only the Stage look is built** (Boris: "Let's just have a stage-side look. Remove the other."). Both are copy-in patterns, not components.

### Inventory

| Paper artboard group | Pattern id | Kit parts used | Gaps / notes |
| --- | --- | --- | --- |
| Settings · Billing (light, dark) | `settings` (section `billing`) | Card (headerAction), Button, UsageList, ListView (documents, Download action), **`billing-schedule` pattern in its new `summary` mode** | Kit Table gives text columns a 12rem min (`--layout-metrics-min`), so Paper's 4-column schedule (date, charge, status, amount) overflows a half-width card. `summary` uses two columns (charge with date + status Badge, amount). UsageList warns at 80%, so Seats (12/15) shows the warning that Paper doesn't. |
| Settings · Billing · overdue | `settings` (`billing="overdue"`) | Alert (danger), Button (Update card outline, Pay now primary), UsageList note | Alert has no actions slot: the buttons sit under it, as in `billing-schedule`. Upgrade is hidden so Pay now is the one primary. |
| Settings · Billing · loading | `settings` (`billing="loading"`) | Card, Skeleton | Same Cards with Skeleton lines (Paper draws empty card shells). |
| Settings · Billing · error | `settings` (`billing="error"`) | Empty (outlined, CircleX), Button (Retry) | Paper's red icon: Empty's icon tile uses its own neutral tone; no danger-tone Empty. |
| Settings · Profile | `settings` (`profile`) | Card, Avatar, Button, Field, Input, Select, sticky save bar (Button with ⌘S shortcut) | Paper caps the cards at ~720px; the copy fills the column (no max-width without a token; `layout-container-md` would centre it). |
| Settings · Team | `settings` (`team`) | PageHeader actions (Invite people primary), Input (search), Card flush, Table, Avatar, Badge, Select (role), DropdownMenu (row actions) | Paper hides the "Actions" column header; kit Table always shows headers. |
| Settings · Team · invite drawer | `settings` (`inviteOpen`) | Drawer (right), Field, Textarea, Select, Button (Send invites ⏎) | Kit Drawer motion (honours reduced motion). |
| Settings · Team · empty | `settings` (`team="empty"`) | Empty (outlined) with Invite people as the primary | PageHeader primary steps away so there is one. |
| Settings · Notifications | `settings` (`notifications`) | Card, Table, Switch (accessible name per row and channel), Field + Select (digest), NotificationStack (the header bell), save bar | |
| Settings · Security (+ 2FA off) | `settings` (`security`, `twoFactor`) | Card (headerAction), Field, Input (password), Badge (On / Off), Switch, Alert (warning), ListView (sessions, Sign out), Button (danger outline), AlertDialog | Paper puts the 2FA title, Badge and Switch in one header row; Card's header takes one action, so that row is in the body. |
| Settings · * · Stage (second row) — **the look built** | `settings`, in an app shell with **`layout-shell--inset`** | built SideNav (Brand, Search Input in a Slot, app rows, a "Settings · 5" Section with the five sections, Account) on the canvas; page on the inset panel; a top row with Breadcrumb (Settings › section) and `headerActions` (Help outline, NotificationStack bell), then the PageHeader | Per Boris (2026-11-10). Needs the new kit layout modifier below. The first-row frames (AppHeader over SideNav, own settings nav column) are **not built**. |
| Onboarding · 01 Welcome | `onboarding` (`step="welcome"`) | PageHeader in BlurCrossfade, ListView (icon rows), footer bar (Get started primary) | Paper draws each row as its own bordered card; ListView rows are one list. |
| Onboarding · 02 Workspace | `onboarding` (`workspace`) | Card, Field, Input, Select ×3 in `layout-split`, Back ghost, Continue (⏎) | |
| Onboarding · 02b validation error | `onboarding` (`workspaceState="error"`, or an empty name) | Field `error`, Input `error`; focus moves to the name | |
| Onboarding · 02c submitting | `onboarding` (`workspaceState="submitting"`, or while `onCreateWorkspace`'s promise is pending) | inputs, Back and Continue disabled; kit Spinner labelled "Creating workspace…" beside Continue | Paper puts the spinner inside the primary. The kit Button has no `loading` prop, and a Spinner in `iconStart` keeps its own colour on the disabled (48% opacity) primary, so it all but disappears. **Gap: Button `loading`.** |
| Onboarding · 03 Connect or choose | `onboarding` (`connect`) | SetupGuide (task actions mark done; skip / undo), Skip for now ghost, Continue | SetupGuide caps itself at 24rem (`--setup-width`), so it doesn't fill the 560px column as in Paper. |
| Onboarding · 04 Done | `onboarding` (`done`) | Empty (Check icon), Badge ×2, Go to dashboard centred | Paper's green check tile and "a check may draw (DrawCheck)": the kit has no DrawCheck and Empty's icon tile is neutral. **Gaps: DrawCheck motion, Empty success tone.** |
| Onboarding · * · Stage (second row) — **the look built** | `onboarding` | SideNav blocks on the canvas (Brand, a Slot with the SET UP · 4 STEPS overline and vertical ProgressSteps, Footer with Save and exit), `layout-shell--inset` panel with "Step N of 4" | Paper's step list is pill rows; vertical ProgressSteps draws markers and a rail. The first-row frames (AppHeader with horizontal steps) are not built as a look; below md, where there is no room for the steps column, the pattern uses that reduced AppHeader (Paper draws no narrow Stage). |

**Skipped (already patterns):** the Billing schedule card (it *is* `billing-schedule`, extended rather than copied); integration settings (no Integrations section in Paper's settings nav). `settings-form` stays as it is: a single-page example. `settings` is the multi-page area; neither replaces the other.

### Decisions

- **One `settings` pattern, not five.** The five pages share the page frame (breadcrumb, header actions) and the save bar, and an agent asked for "settings" wants the whole area. Each page is its own file (`BillingSettings.tsx`, `TeamSettings.tsx`, …), so dropping one is deleting a file and its SideNav row. Five separate patterns would each repeat the frame.
- **Patterns can now build on patterns.** Copy-in sources could only import `../../ui/*`. `settings` imports `../BillingSchedulePattern`; `build-patterns-src` rewrites that to `../billing-schedule`, records `requires: ["billing-schedule"]` in `patterns-src/index.json` (and checks it against the contract's `requires`), and `add settings` copies `billing-schedule` beside the target unless that folder exists (then it's kept and said so; `--force` doesn't touch it). Checked with default and `--dir` targets; the copies typecheck against the built kit. MCP `get_pattern` returns `requires`.
- **`billing-schedule` extended:** `summary`, `limit` (default 3), `description`, `onViewAll`. Existing props and default rendering are unchanged. The docs demo has a Summary tab.
- **Stage only (Boris, mid-review: "for these screens the second row … so it matches the site", then "Let's just have a stage-side look. Remove the other.").** Paper's second row is the docs site's own chrome (PlaygroundShell "Direction A: Stage"): the canvas is the frame, the nav sits on it, the page floats on a card panel. That had no kit layout class, so this adds **`layout-shell--inset`** to `lib/layout.css`: shell padding `--space-2` (no padding on the nav side), the page column (layout-app's last child) gets `--line-default` border, `--radius-surface-lg`, `--surface-card`, `--shadow-xs`; it sets SideNav's documented `--sidenav-background` to transparent so the nav shows the canvas, and the new SideNav cssVar `--sidenav-divider` to none so the flush rail has no rule on its right (Boris: "no border on the right"). `--sidenav-divider` defaults to the old rule, so other SideNavs are unchanged. No new tokens. Documented on Foundations → Grid.
- **No settings nav of its own.** The page is the pattern; the app's SideNav lists the sections under a Settings group (`SETTINGS_SECTIONS` is exported for that), and below md they're in the app shell's Drawer with the rest of the nav. The pattern's `<main>` is the inset panel, with a Settings › section breadcrumb and `headerActions` (Help, bell).
- **Chrome stays outside.** The pattern renders its own `<main>` (labelled "Settings: <section>") and sits in the app's shell; the docs demo uses the `app-shell` example with `layout-shell--inset` and a built SideNav (brand, search, app rows, "Settings · 5", account). Mobile nav is the app shell's Drawer.
- **One solid primary per view:** Billing → Upgrade (or Pay now when overdue); Profile / Notifications → Save; Team → Invite people (in the Empty when empty; Send invites inside the Drawer, a modal view); Security → none.
- **Motion:** none beyond kit overlays (Drawer, AlertDialog, DropdownMenu), which already honour reduced motion. Paper's notes ask for nothing else.
- **Tokens:** no new tokens or colours. Every value is a role token or layout class. Paper and tokens agree on colour; the differences above are component behaviour (Table min widths, UsageList threshold, Empty icon tone).
- **Docs:** new page `/patterns/settings-area` (slug `settings` was taken by settings-form). A Select picks one of Paper's 11 screens (`?view=` opens one directly); the page shows the add command and the contract.
- **Docs fix:** pattern demos render kit *source*, a second module instance with its own theme-scope context, so their portalled Drawers / dialogs ignored a dark preview. `PreviewScope` now provides both contexts. The integration-settings AlertDialog and app-shell Drawer demos had the same cause, so they pick up the fix too.

### Onboarding decisions

- **One `onboarding` pattern** with a `step` prop (controlled, or its own state) and `workspaceState` to force Paper's error / submitting frames; left out, it validates and waits on `onCreateWorkspace` itself.
- **Chrome:** the pattern renders the whole page (it's a full-screen flow, no app nav), Stage only (Boris): `layout-shell--inset` with a SideNav-blocks steps column and the step on the inset panel. Below md, where the column doesn't fit, a reduced AppHeader (header landmark, horizontal ProgressSteps) carries the steps. `<main>` is labelled "Setup, step N of 4: <step>". `viewport` (default true) adds `layout-shell--viewport`; the docs frame turns it off. The step column is `layout-container-sm`.
- **Focus:** a step change moves focus to `<main>`, so keyboard users don't land on `body` when the content under them is replaced. An empty name moves focus to it with the Field error.
- **Motion:** Paper asks for a 180 ms crossfade between steps. BlurCrossfade's contract says not to wrap long or interactive regions, so it wraps only the step heading (`fast`, and its live label announces the step). It honours reduced motion. The form and SetupGuide swap without motion.
- **One primary per step:** Get started / Continue / Go to dashboard. Back and Skip for now are ghost.
- **Docs:** `/patterns/onboarding`, with a screen Select for Paper's 6 frames (`?view=workspace-error` and so on), the add command and the contract. The demo's `onCreateWorkspace` waits 1.2 s so the submitting state shows when you click through.

### Follow-ups for Boris

- A Table option for compact columns (no 12rem min), so a 4-column table fits a half-width card.
- UsageList warn threshold as a prop (`warnAt`, as UsageMeter has).
- Empty `tone="danger"` for load errors.
- `layout-shell--inset` is new in this PR (see above): Boris to confirm the name and values.
- Button `loading` (spinner in the label colour, busy primary kept at full colour).
- Empty `tone="success"` (and the danger tone above), and a DrawCheck motion for done states.
- SetupGuide width: let it fill its column (`--setup-width` is fixed at 24rem).

## 2026-11-10: Motion (feat/motion-patterns-1, -2)

Source: Paper file *Nistha Agent Patterns* (`01M6S6EXZCX07PR8P1YXPE8BQE`), page p-5-0 "Nistha Motion". Paper is static, so each moving state is a still with a timing label; the values below come from those labels and `get_jsx`.

### Inventory and shape

| # | Paper artboard | Shape | Why | Kit id | Batch |
| --- | --- | --- | --- | --- | --- |
| 01 | Blur Crossfade | (a) component | Paper gives it its own contract (`children`, `contentKey`, `duration`, `label`) and calls it "a primitive, not a Card"; it wraps any child, so it is a wrapper component, not a hook | `blurcrossfade` | 1 |
| 02 | Text Reveal | (a) component | Own contract (`by`, `as`, `replayKey`, `label`); a heading element, not a style | `textreveal` | 1 |
| 03 | Gradient Text | (a) component | Own contract (`tone`, `as`); not really motion (motion "none by default") | `gradienttext` | 2 |
| 04 | Grid Background | (a) component | Own contract (`variant`, `children`, decorative layer) | `gridbackground` | 2 |
| 05 | Tilt Card | (a) component | Own contract: wraps Card, adds `tilt` / `maxTilt`; Card's default motion is untouched | `tiltcard` | 1 |

- **Skipped because the kit already has them:** none. p-5-0 doesn't redraw ShimmerText, ThinkingAnimation, LoadingAnimation, NumberTransition, Skeleton or Spinner.
- **(b) motion primitive / (c) docs only:** none chosen. Wiring BlurCrossfade into existing status chips (RunningNow, AgentPlan, ToolCallCard) would change how those components animate by default, so it is a question for Boris, not built.
- **Batches:** 1 = BlurCrossfade, TextReveal, TiltCard (the three that move). 2 = GridBackground, GradientText (decorative; both carry open token and colour questions).
- **Nav:** a new **Motion** group in `lib/playground-nav.ts` after SaaS; the gallery tags them "motion".

### Boris's calls (via the planner, 2026-11-10)

- **BlurCrossfade blur: approved exception.** Paper animates `filter: blur(0 → 6px)` with opacity on both layers (no scale). `filter` breaks the transform/opacity-only rule; Boris approved it as **the one exception**: max 6px (`--blur-crossfade-blur`, 1.5 × `--space-1`), only on BlurCrossfade's two layers, never under reduced motion. The contract records it under `motion.exception`. Don't copy the blur into other components.
- **Not wired into existing components.** BlurCrossfade is opt-in only; RunningNow, AgentPlan, ToolCallCard and AgentFleet keep their hard-cut status swaps. Places it could be wired in later: RunningNow's status chip, AgentPlan step status, ToolCallCard's state badge, AgentFleet row status, ExperimentCard status Badge.
- **GradientText:** ink, brand and inverse only; the primary → violet `overlay` waits for the violet decision; no hue shift.

### Timings: Paper → token

| Where | Paper | Kit token | Note |
| --- | --- | --- | --- |
| BlurCrossfade total | motion.fast ≈ 200ms, ease-out | `--motion-duration-200` (180ms), `--motion-ease-out` | nearest; `duration="normal"` = `--motion-duration-300` (240ms) |
| BlurCrossfade reduced motion | "instant or 100ms fade" | `--motion-duration-100` (120ms), linear, opacity only | old value removed at once |
| BlurCrossfade frames | t ≈ 60ms out, t ≈ 140ms in | — | the kit's ease-out (`0.23, 1, 0.32, 1`) is front-loaded, so Paper's mid-frames are reached at ≈ 15ms / 45ms of 240ms; the docs freeze there and say so |
| TextReveal unit | ease-out 240ms | `--motion-duration-300` (240ms), `--motion-ease-out` | exact |
| TextReveal stagger | 40ms per word, 80ms per line ("motion.stagger") | none; derived `calc(--motion-duration-100 / 3)` and `× 2/3` | **propose** `--motion-stagger-sm: 40ms`, `--motion-stagger-md: 80ms` |
| TextReveal rise | 10px (word), 12px (line) | `--space-2` (8px), `--space-3` (12px) | word rise 2px short of Paper |
| TiltCard return | 300ms on leave | `--motion-duration-400` (320ms) | nearest |
| TiltCard follow | — | `--motion-duration-100` while the pointer moves | not in Paper; keeps the tilt responsive |
| TiltCard lift | shadow.sm → shadow.md | `--shadow-md` layer, opacity via `--motion-interaction-*` | box-shadow is not animated; a shadow.md layer fades in |
| TiltCard highlight | white 35% → transparent 55% | `--text-fg` with `mix-blend-mode: screen`, layer opacity `--opacity-300` (0.32) | see below |

### Decisions

- **Transform/opacity only**, except BlurCrossfade's approved blur. No `box-shadow`, `background-position` or size is animated. TiltCard's lift fades in a `::after` carrying `--shadow-md`; the highlight is a layer moved with `transform`.
- **TiltCard highlight without a theme check.** No semantic token is white in both themes (`--line-inverse` flips). The spot uses `--text-fg` with `mix-blend-mode: screen`: on a light card (dark text-fg) screen changes nothing, matching Paper's light stills; on a dark card (light text-fg) it shows the highlight Paper draws. If Boris wants a visible light-mode sheen, that needs a new token (e.g. `--sheen`).
- **TiltCard focus.** Card is not focusable; "keyboard focus" means focus inside it (`:has(:focus-visible)`): focus ring on the card (`--border-focus-width`, `--focus-ring`), the shadow.md lift, rotation forced to none. Pointer tilt is mouse/pen only. `disabled` is new vs Paper's contract (Paper draws a disabled still): mutes content with `--opacity-disabled`, sets `aria-disabled`, no tilt or lift.
- **TiltCard perspective** is a local `--tilt-perspective: 800px` (geometry, not a design token).
- **TextReveal** keeps the full string in a visually hidden span; the animated units are `aria-hidden`. Lines come from `\n` in `children`. Size is `--type-size-heading-4` (32px / 40 / 700 / `--type-tracking-title`), as Paper draws it; `as` only changes the element.
- **BlurCrossfade** stores the children as they were when a key arrived; that copy is the outgoing layer on the next swap. The outgoing layer is `aria-hidden` and `inert` and is removed on `animationend`.
- **Docs.** Each page has a live preview with a Swap / Replay control and Variants with Paper's frames as paused stills (`MotionDoc.module.css` `.freeze` seeks every animation to `--freeze-at`). Doc-only.

### Batch 2: GridBackground, GradientText

| Where | Paper | Kit | Note |
| --- | --- | --- | --- |
| Grid line cell | 24px "grid.cell token" | `--space-6` | no cell token exists; proposed below |
| Grid dot pitch | 16px | `--space-4` | |
| Grid line / dot colour | line.default / line.strong | `--border-faint` / `--border-strong`, `--border-width-thin` | |
| Grid edge fade | overlay: transparent 30% → surface colour 80% | `mask-image` radial, opaque 30% → clear 80% | a mask fades to whatever is behind, so no surface prop is needed |
| Grid on a dark surface | slate-950, lines at 8% white, no fade | `inverse`: `--surface-inverse`, `--line-inverse` at `--opacity-100` (0.08), no mask | follows the theme: in dark mode the inverse surface is light with dark lines; Paper keeps it dark in both |
| Grid drift | optional, ≥ 40s per cell, off by default | **not built** | needs a duration far outside the motion scale; propose `--motion-duration-ambient` if Boris wants it |
| GradientText size | 34px / 42 / 700 / -0.02em | `--type-size-heading-4` (32px) / `--type-line-heading-4` (40) / `--type-weight-title` / `--type-tracking-title` | nearest heading step |
| GradientText ink | text.fg → primary.base | `--text-fg` → `--text-brand` | |
| GradientText brand | primary.base → primary.fg | `--text-brand` → `--primary-fg` | |
| GradientText on inverse | bg.canvas → blue-200 on bg.inverse | `inverse`: `--bg-canvas` → `--info-line` | a prop, since Paper draws it as "ink (on inverse)" |
| GradientText overlay | primary.base → accent.violet | **held** | waits for the violet role decision (Boris) |
| GradientText hue shift | optional, ≥ 12s | **not built** (Boris) | would animate filter or background-position |

- GridBackground's grid layer is `aria-hidden`, has no pointer events, sits at `z-index: -1` inside an isolated root, and is hidden under forced colours. Nothing moves, so reduced motion changes nothing.
- GradientText uses the gradient only inside `@supports (background-clip: text)`; without it, and under `forced-colors`, it is solid `--text-fg` / `CanvasText`. It is real text, so selection, copy and screen readers are unaffected.
- The grid demos sit on `--surface-page`, matching Paper's wells (bg.subtle in light equals the page; the page colour in dark). On `--surface-muted` in dark mode, `--line-default` is almost the same colour as the surface, so the grid disappears.

### Proposed tokens (not added)

- `--motion-stagger-sm` (40ms) and `--motion-stagger-md` (80ms) for TextReveal and future list entrances.
- A theme-constant highlight colour (`--sheen`) if TiltCard should show a highlight in light mode.
- `--grid-cell` (24px) and `--grid-dot-pitch` (16px) for GridBackground; today they are `--space-6` / `--space-4`.
- `--motion-duration-ambient` (≥ 40s) only if the GridBackground drift is wanted.

## 2026-11-10: SaaS patterns (feat/saas-patterns-1, -2, -3)

Source: Paper file *Nistha Agent Patterns* (`01M6S6EXZCX07PR8P1YXPE8BQE`), page p-4-0 "Nistha SaaS Patterns". These parts feed the p-6-0 Settings and Onboarding screens, which are not built here.

### Inventory and batch plan

| # | Paper artboard | In the kit already? | Kit id | Batch |
| --- | --- | --- | --- | --- |
| 01 | Billing Schedule | No. Mostly Table + Badge + Alert, plus a next-charge box. **Boris: pattern, not a component** | pattern `billing-schedule` | 3 |
| 02 | Invoice & Credit Note | No | `invoicedocument` | 3 |
| 03 | Change Summary | No (Scorecard / Scoreboard show one KPI each, not before → after per metric) | `changesummary` | 1 |
| 04 | Experiment Card | No | `experimentcard` | 1 |
| 05 | Comment Thread | No (Chat is the assistant conversation) | `commentthread` | 2 |
| 06 | Comments Panel | No; hosts Comment Thread on a kit Drawer | `commentspanel` | 2 |
| 07 | Notification Stack | No (Toast is instant feedback, AgentInbox is agent work) | `notificationstack` | 1 |
| 08 | Integration Picker | No | `integrationpicker` | 2 |
| 09 | Integration Settings | No. A settings form of Field + Select + Switch + chips + Alert + AlertDialog. **Boris: pattern, not a component** | pattern `integration-settings` | 3 |
| 10 | Setup Guide | No (ProgressSteps is a linear wizard) | `setupguide` | 1 |
| 11 | Pricing Plans | No | `pricingplans` | 2 |
| 12 | Task Board | No | `taskboard` | 3 |

- **Skipped because Nistha already has them:** none on p-4-0. Usage Meter, the other Settings piece, shipped from p-3-0 in #126; Meter, UsageList, Alert and Toast are reused inside these components, not rebuilt.
- **Batches:** 1 = Setup Guide, Notification Stack, Change Summary, Experiment Card (self-contained, first for Onboarding and Notifications). 2 = Comment Thread, Comments Panel (hosts the thread, so same batch), Integration Picker, Pricing Plans. 3 = Billing Schedule, Invoice & Credit Note, Integration Settings, Task Board. Billing Schedule and Integration Settings ship there as copy-in patterns (Boris's call).
- **Nav:** a new **SaaS** group in `lib/playground-nav.ts`, after AI. The gallery filter for them is "base" (not "agent").

### Shared pieces

- `ui/shared/LoadError.tsx` (internal, not exported): the "Couldn't load … · Retry" row every SaaS card uses (role=alert, danger-subtle, outline Retry). UsageMeter and TraceWaterfall each have their own copy; they could move to it later.
- Same card shell as the agent components: `--bg-surface`, `--line-default`, `--radius-surface-lg`, `--shadow-sm`, padding `--space-4`, and a rem custom width (`--setup-width` etc.) like InsightCard's `--insight-width`.

### Batch 1: what shipped

Branch `feat/saas-patterns-1`, from `main` (0.14.0 + the agent components).

| Component | Paper artboard | Built on | States built |
| --- | --- | --- | --- |
| SetupGuide | 10 Setup Guide | Progress, Badge, Button, Empty, Skeleton | mid-setup, mixed done and skipped (Undo), all done (Complete + Go to dashboard), empty, loading, error |
| NotificationStack | 07 Notification Stack | Popover, Button, Badge, Empty, Skeleton | open with unread, all read, empty, loading, error, closed trigger with and without a count; `inline` renders the panel on a page |
| ChangeSummary | 03 Change Summary | Empty, Skeleton | mixed, all up, all down with per-row sentiment, no change, loading, empty, error |
| ExperimentCard | 04 Experiment Card | Badge, Button, AlertDialog, Skeleton | running (Leading), concluded with winner (Ship winner → AlertDialog), inconclusive (Extend), stopped, draft A/B/n, loading, error; Stop confirms with a danger AlertDialog |

Paper vs tokens, batch 1:

| Paper | Kit | Why |
| --- | --- | --- |
| Card radius 19px, shadow `0 1px 2px` | `--radius-surface-lg`, `--shadow-sm` | Same as the agent components. |
| Status pills, mono caps (RUNNING, WINNER, 2 UNREAD, COMPLETE) | kit Badge `size="sm"`, sentence case | Badge is the kit pill. |
| Setup Guide "built on DrawCheck" (check draws itself, 300ms) | the check scales and fades in (`--motion-duration-300`, spring-soft) | There is no DrawCheck in the kit, and a drawn stroke animates `stroke-dashoffset`, not transform or opacity. |
| Setup Guide progress bar 6px | kit Progress `size="sm"` with label and value | Kit component. |
| Setup Guide row title 13px | `--type-size-body-sm` (14px) | No 13px step. |
| Notification bell count chip | a small primary chip beside a kit Button (`Bell`), keyed so it pops on change | Count is the kit count, but it has no overlay placement; the chip is aria-hidden and the Button carries "Notifications, 2 unread". |
| Notification "Count rolls when it changes" (NumberTransition) | the chip pops on transform + opacity | NumberTransition is too big for a 16px chip. |
| Notification panel 340px | `--notifications-width: 21.25rem`; the Popover's padding and max-width are overridden for this panel only | Popover's default panel is 320px max with padding. |
| Change Summary "Deltas may roll with NumberTransition" | static text | Deltas are pre-formatted strings (+9.8%, −5, 0 pts). |
| Experiment confidence icon | Lucide `CircleHelp` | Closest. |
| Empty-state titles 14px | kit Empty (its own heading size) | Same as AgentInbox, InlineDiff, MemoryPanel. A compact Empty size is a possible follow-up. |
| Widths 370px | 24rem custom widths | Custom-width pattern, as in the agent batches. |

Keyboard and focus, batch 1 (checked with a Playwright script at 1440):
- SetupGuide: Continue and Start are Buttons described by their task label. When a task finishes and its button goes away, focus moves to the next task's action (or the guide). Undo is a text button.
- NotificationStack: Enter on the bell opens the Popover with focus on Mark all read; Tab reaches the rows (buttons, "Unread: …"); opening one marks it read and the bell's name updates; Escape closes and focus returns to the bell.
- ChangeSummary: no controls besides View full report; each row reads as one sentence.
- ExperimentCard: Stop and Ship winner open a kit AlertDialog with focus on the safe action; Escape or Cancel closes and focus returns to the button.

Screenshots at 1440, light and dark, next to the Paper exports: `saas-patterns/batch1/` in the planner's notes folder.

### Batch 2: what shipped

Branch `feat/saas-patterns-2`, stacked on `feat/saas-patterns-1`.

| Component | Paper artboard | Built on | States built |
| --- | --- | --- | --- |
| CommentThread | 05 Comment Thread | Avatar, Textarea, Button, AlertDialog, Empty, Skeleton | populated with replies, composer with a draft, editing your own comment, delete confirm, sending, empty, loading, error |
| CommentsPanel | 06 Comments Panel | Drawer, SegmentedControl, Badge, Button, Empty, Skeleton; hosts CommentThread | several threads (Open filter), one selected with Resolve, empty with a page composer, filtered to none (Resolved), loading, error, closed trigger with the open count; `inline` renders it in place |
| IntegrationPicker | 08 Integration Picker | Input, SegmentedControl, Button, Badge, Empty, Skeleton | mixed catalogue (connected, available, coming soon), filtered with a connect in progress, search empty with Request, loading, error |
| PricingPlans | 11 Pricing Plans | SegmentedControl, Badge, Button, NumberTransition, Skeleton | monthly with Pro recommended, yearly (prices roll), current plan, loading, error |

Paper vs tokens, batch 2:

| Paper | Kit | Why |
| --- | --- | --- |
| Comments Panel "built on FilterBar for Open / Resolved / All" | kit SegmentedControl with counts in the labels | FilterBar is a row of filter buttons with values; a single choice of three is a radio group, as in AgentInbox. |
| Integration Picker category pills | kit SegmentedControl | Same reason: one category at a time. |
| Comment composer: borderless textarea inside a bordered box with the toolbar | kit Textarea (its own border) with the toolbar under it | Kit control; no cousin textarea. The @ icon and ⌘⏎ are hints (aria-hidden). |
| Comment composer focused ring (2px primary) | the kit Textarea focus ring | Kit control. |
| Comment Save "⏎" chip | Button `shortcut="⏎"` | Batch-1 agent pattern. |
| Comments Panel header "Comments [3] ×" | the kit Drawer title "Comments" with "2 open · 1 resolved" as its description; the inline form keeps the count badge and a close Button | Drawer titles are strings. |
| Comments Panel trigger "Comments [2 OPEN]" | kit Button plus a Badge "2 open" that describes it | Button labels are strings. |
| Integration logo tiles (provider marks) | Lucide icons in a bordered tile; providers are labelled examples | No brand marks in the kit. |
| Integration "Connecting…" solid button with spinner | Button `iconStart="LoaderCircle"` rotating, plus a status message | Same as PermissionRequest's Granting…. |
| Pricing card border 2px primary for recommended or current | 1px `--primary` border plus a 1px ring (box-shadow) | No 2px border token; same visual weight. |
| Pricing price 28px | NumberTransition `size="lg"` (`--type-size-heading`) | Kit size step. |
| Pricing title 18px | `--type-size-ui-lg` | Kit role. |
| Grid columns (3 tiles / 3 cards) | `repeat(auto-fill, minmax(min(100%, calc(var(--space-16) × 3.5)), 1fr))` and `auto-fit` with 3.75 for plans; gaps `--grid-gutter-sm` / `-md` | No raw column count; widths from space tokens. |
| Comment Thread width 370px | `--thread-width: 24rem` (card form only; untitled threads fill their parent) | Custom-width pattern. |

Keyboard and focus, batch 2 (Playwright at 1440):
- CommentThread: ⌘/Ctrl+Enter posts; Reply moves focus to the composer; Edit puts focus in the edit field, Enter saves, Escape cancels and returns focus to Edit; Delete opens an AlertDialog on Keep and Escape returns focus to Delete.
- CommentsPanel: the trigger is described by "2 open"; Enter opens the Drawer (focus on Close); opening a thread puts focus on All threads, and going back focuses that thread again; Escape closes the Drawer and returns focus to the trigger.
- IntegrationPicker: the search is a labelled searchbox; the category filter is a radio group (arrow keys); each Connect is described by its provider name.
- PricingPlans: arrow keys switch Monthly and Yearly; each CTA is described by its plan name; the current plan's CTA is disabled.

### Batch 3: what shipped

Branch `feat/saas-patterns-3`, stacked on `feat/saas-patterns-2`. This completes p-4-0: ten artboards are kit components and two are copy-in patterns.

**Decision (Boris, via the planner): pattern instead.** Billing Schedule and Integration Settings are mostly kit parts, so they ship as copy-in patterns, not components. Each is in `patterns/<Name>Pattern/` (TSX, prefixed plain CSS, a demo data file), with a pattern contract (`must` / `defaults`) in `contracts/patterns/`, and `npx agentic-ds-kit add billing-schedule` / `add integration-settings` installs it. They use only kit components; neither needed a new p-4-0 component. The site shows them under Patterns with a state switcher (`app/_components/SaasPatternDemo.tsx`). A first cut had both as components; this branch replaced them before merge.

| Pattern | Paper artboard | Composed from | States shown |
| --- | --- | --- | --- |
| `billing-schedule` (BillingSchedulePattern) | 01 Billing Schedule | Section, Table, Badge, Alert, Button, Empty, Skeleton | history with every status and the next charge, failed payment (danger Alert + Update card), next charge only, empty, loading, error |
| `integration-settings` (IntegrationSettingsPattern) | 09 Integration Settings | Section, Badge, Alert, FieldSet, Field, Select, Switch, Tag, Button, Card, AlertDialog, Empty, Skeleton | connected, syncing, error (View errors), needs reauth (Reconnect; FieldSet locked), saving, disconnect confirm, not connected (Connect), loading, error |

| Component | Paper artboard | Built on | States built |
| --- | --- | --- | --- |
| InvoiceDocument | 02 Invoice & Credit Note | Table, Badge, Button, Empty, Skeleton | draft (Issue invoice), issued and overdue (Record payment), paid, void, credit note naming the invoice it reduces, empty lines, loading, error |
| TaskBoard | 12 Task Board | Badge, Avatar, Button, Empty, Skeleton | populated, card mid-move (keyboard and drag), empty column + overflow (+ N more), empty board, loading, error |

Paper vs tokens, batch 3:

| Paper | Kit | Why |
| --- | --- | --- |
| Billing Schedule next-charge row tinted blue | a "Next charge" Badge in the description cell; no row tint | Kit Table has no row highlight. A `highlightRow` prop on Table is a possible follow-up. |
| Billing Schedule failed-payment banner with an inline Update card | kit Alert (danger) with Update card under it | Alert has no action slot. |
| Billing / Invoice table header mono caps | the kit Table header | Kit component. |
| Invoice money as numbers + `currency` | pre-formatted strings (`"$782.40"`) | Locale and currency formatting stay with the app; the component never does money maths. |
| Invoice void: the whole card faded | lines and totals at `--opacity-muted`, the total struck through, Download and Send disabled; the header, badge and footnote stay full contrast | So "Void" and the reason stay readable. |
| Invoice title 18px | `--type-size-ui-lg` | Kit role. |
| Integration Settings "built on Section + Fieldset + Field" | kit Section, FieldSet ("Settings", disabled while saving or until reconnect) and Field `labelPosition="start"` | As designed. Field puts the hint under the control, not under the label as in Paper. |
| Integration Settings scope chips, mono caps | kit Tag, lowercase as the scopes are written | Kit chip; they are identifiers. |
| Integration Settings Disconnect box | kit Card `size="sm"` with a danger outline action | Kit surface; Card actions are full-width Buttons. |
| Integration needs-reauth: Save disabled but solid | Reconnect is the solid primary; Save steps down to a disabled outline | One solid primary per view. |
| Task Board tags, mono caps | kit Badge outline, sentence case | Same as other batches. |
| Task Board "no due date" mono | "No due date"; dates read "Due 14 Nov" | Says what the date is. |
| Task Board column "…" menu | not built | The contract has no column actions to put in it. |
| Task Board moving card: source "moving out…" ghost + dashed "Drop here" slot | the card previews at its target spot, lifted (`--shadow-md`, slight rotate and scale), and a drag highlights the target column with a dashed `--primary` border | One element per card; no duplicate in the list. |
| Task Board "card glides to its new place (200ms)" | the card fades and rises in where it lands (transform + opacity) | A real FLIP glide would need layout measurement; this stays on transform and opacity. |
| Integration Settings width 770px | `width: min(100%, var(--layout-container-sm))` | Layout token. |

Keyboard and focus, batch 3 (Playwright at 1440):
- TaskBoard: Space picks up a card (aria-pressed); arrow keys move it across columns and positions; Space or Enter drops it and Escape cancels. Each step is announced in a live region, and focus stays on the card as it moves. Enter on a resting card opens it. Mouse drag works too (checked with a Playwright drag).
- `integration-settings` pattern: ⌘/Ctrl+S saves and the FieldSet disables while saving. Disconnect opens a danger AlertDialog with focus on Keep connected, and Escape returns focus to Disconnect. Each Field label names its control.
- `billing-schedule` pattern and InvoiceDocument: the only controls are Buttons. The failed payment is a kit Alert.

### Proposals and follow-ups (need Boris's OK)

- No new tokens or colours in these three batches.
- **Compact Empty** (a smaller title for cards). Used in most of the SaaS cards, and in AgentInbox, InlineDiff and MemoryPanel.
- **Table `highlightRow`** for the next charge.
- **Move UsageMeter and TraceWaterfall onto `ui/shared/LoadError`** so every card shares one error row.

### PR status

- Batch 1: `feat/saas-patterns-1`, https://github.com/borisj74/agentic-ds-kit/pull/129, base `main`. Open, not merged.
- Batch 2: `feat/saas-patterns-2`, https://github.com/borisj74/agentic-ds-kit/pull/130, base `feat/saas-patterns-1`. Open, not merged.
- Batch 3: `feat/saas-patterns-3`, https://github.com/borisj74/agentic-ds-kit/pull/131, base `feat/saas-patterns-2`. Open, not merged.

## 2026-11-10: component pages, previews and variants

Site (branches `claude/k79-nistha-site-859cfe`, PR #119, and `feat/variants-tab-cleanup`):

- **One tab bar across the site:** kit Tabs, `segmented`, `sm`. Used on the component stage, the components overview, Foundations and inside the docs.
- **Component stage tabs:** Preview · Variants · Code · Contract. Copy prompt for Claude Code · Cursor · MCP sits beside them.
- **Preview and Variants show components the same way.** Both render the component's own doc through a shared view mode (`app/components/DocView.tsx`), never a gallery thumbnail:
  - Preview shows the doc's master render, with its controls panel when the doc has one.
  - Variants shows only the doc's variant sections.
  - No nested tab bars: in the stage, `DocTabList` switches the doc's view and renders nothing.
- **Variants is a plain stacked list,** not cards: one full-width section per variant, separated by a divider. Each section reads name, one-line description, prop chips, then the live render; code stays below.
- **Prop chips come from the contract.** An enum value or boolean prop named in the variant title becomes a chip (`variantChips` in `lib/component-contract.ts`, with tests). No match, no chip.
- **Render ground is `--bg-canvas`** (slate-50). The 5% brand tint read as lilac; the plain white had no contrast with the page.
- **Cell and HeaderCell previews** sit on a white bordered row, because the components are transparent.
- **ContextMenu** uses the standard framed layout. The **AnchorNav** demo scroller pads for the focus ring. **Chat** variant frames are 32rem so nothing scrolls.
- **Side nav:** component groups sit under Components as its subtree. The Theme toggle in the top bar is icon-only.
- **Foundations swatches:** labels are pinned to slate-900 or white, whichever contrasts more. They no longer flip with dark mode. One exception: violet-500 reaches 4.23:1.
- **Overlays in previews:** the no-flash rule targets only the preview wrapper (`data-preview-scope`), so Select, DropdownMenu, DatePicker and Tooltip panels open again when a theme is saved.

Kit (branch `claude/avatar-fallback-edge`, not yet in a PR; site-visible only after merge):

- **Avatar:** the fallback fill and the AvatarGroup +N fill use `--bg-tray`, so the circle keeps an edge on `--bg-canvas`.
- **CodeSnippet:** with tabs, the header uses an even inset on top, bottom and start.
- **ProgressSteps:** done markers and the done line use `--action-primary`. Upcoming steps are unchanged.
- **DateRangePicker:** matches the BP dual date picker.
  - Layout: presets in a column, two months side by side (one month below 40rem).
  - Footer: the pending range, Cancel and Apply. Picks stay pending until Apply.
  - Contract a11y and intent are updated for this flow.

Open:

- Upcoming ProgressSteps style: the request was cut off after "Uncompleted", so it was left as is.
- The DateRangePicker week starts on Sunday (BP uses Monday). The panel opens aligned to the trigger's right edge.
- A light preview theme under dark chrome keeps some dark status colours: `tokens.css` has no `[data-theme="light"]` reset.

---

# Notes

Decisions for the kit and the nistha website, newest first.

## 2026-11-10: agent patterns (feat/agent-patterns-1 and -2)

Source: Paper file *Nistha Agent Patterns* (`01M6S6EXZCX07PR8P1YXPE8BQE`), page p-3-0 "Nistha Agent Patterns".

### Scope

- The request named "the 4 from p-2-0", but the file has no p-2-0 page. Its pages are p-3-0 (Agent Patterns, 22 artboards), p-4-0 (SaaS Patterns), p-5-0 (Motion) and p-6-0 (Screens: full Settings and Onboarding screens, not components). Boris (via the planner) picked:
  - **Batch 1** (`feat/agent-patterns-1`, from `main`): Approval Card, Agent Trail, Agent Plan, Agent Fleet from p-3-0.
  - **Batch 2** (`feat/agent-patterns-2`): the next four p-3-0 components that build on batch 1.
- **Not in scope yet:** the p-6-0 screens (Settings set: Billing, Profile, Team, Notifications, Security with their states; Onboarding steps 01–04) and the p-4-0 pieces they use (Usage Meter, Billing Schedule, Invoice & Credit Note, Change Summary, Experiment Card, Comment Thread, Comments Panel, Notification Stack, Integration Picker, Integration Settings, Setup Guide, Pricing Plans, Task Board).
- **Skipped because Nistha already has them:** nothing in batch 1. In batch 2, **Usage Meter** (04) was held back (it shipped in batch 6, composed from the kit pieces): kit Meter (stacked bar), UsageList (limits per row) and LineChart (the daily sparkline) already cover its parts. A UsageMeter would mostly compose them, so it waits for a decision on whether that composition earns its own contract. The closest kit pieces (Timeline, ProgressSteps, InsightCard, AlertDialog, Scorecard) do a different job, and each new contract says which to use instead.

### Batch 1: what shipped

| Component | Paper artboard | States built |
| --- | --- | --- |
| ApprovalCard | 01 Approval Card | pending (high risk + countdown, diff preview, medium), resolved approved / denied / expired |
| AgentTrail | 03 Agent Trail | step done / running / approval / pending / failed, tag, icon, counter |
| AgentPlan | 11 Agent Plan | 01 draft (edit, remove, add), 02 editing a step, 03 accepted, 04 running with a step waiting, 05 complete, 06 failed, 07 drafting, 08 empty, 09 collapsed |
| AgentFleet | 06 Agent Fleet | 01 overview, 02 focused (one open, others compact), 03 all idle + totals, 04 needs you + failed + totals, 05 loading, 06 empty |

Each component has a CSS module, Lucide icons at 16px with `ICON_STROKE` (1.5), a `contracts/<id>.json`, an index entry, the barrel export, a doc page (Preview with controls, Variants, plus Code / Contract from the contract once the K79 stage lands) and an "Agent" nav and gallery entry. The MCP lists them (the test expects 95 components after batch 1, 99 after batch 2, 103 after batch 3, 107 after batch 4, 111 after batch 5 and 113 after batch 6).

#### Kit change outside the four

- **Button `shortcut` prop.** Paper puts key chips inside the buttons ("Deny Esc", "Approve ⏎", "Accept plan ⌘⏎"). Button only takes a string label, so I added an optional, decorative `shortcut` string. It is aria-hidden; callers wire the key and set `aria-keyshortcuts`. It is in `contracts/button.json`. This extends Button instead of making a local cousin.

### Batch 2: what shipped

Picks (from p-3-0, building on batch 1):

| Component | Paper artboard | Why this one | States built |
| --- | --- | --- | --- |
| ToolCallCard | 02 Tool Call Card | The unit under AgentTrail's sublabel and AgentPlan's tool column; nothing in the kit shows one call with arguments and result | running (live timer), done, expanded with arguments and result, error with retry and attempt, group of calls |
| PermissionRequest | 09 Permission Request | ApprovalCard's sibling for standing access; reuses Badge, Alert and the Button `shortcut` | pending with scopes and a warning, granting, error with retry, resolved granted / denied / expired |
| RunningNow | 12 Running Now | The compact counterpart of AgentFleet for app chrome; fills the gap between a Badge count and a full fleet | row with +N, waiting, stack with failed and View all, empty, idle note, loading |
| AgentMonitor | 05 Agent Monitor | One agent in detail; composes ApprovalCard for the pending action, so batch 1 is reused, not copied | running with live clock and cost, step selected with detail, awaiting approval, collapsed with tools used, paused, complete, failed, loading, not started |

**Not in batch 2:** Usage Meter (see Scope) and the rest of p-3-0. Boris later asked for all of them in batches 3–6: batch 3 Agent Tree, Agent Lanes, Agent Inbox, Decision Card; batch 4 Autonomy Dial, Agent Steering, Model Picker, Context Window; batch 5 Cited Answer, Message Actions, Inline Diff, Memory Panel; batch 6 Cost Trace Waterfall and Usage Meter (Usage Meter composes Meter, UsageList and LineChart).

#### Batch 2 changes to batch 1

- ApprovalCard: when the card resolves while focus is inside it, focus moves to the one-line row. The shared hook `ui/shared/useResolvedFocus.ts` does the same for PermissionRequest. That commit is on `feat/agent-patterns-1` too; batch 2 is rebased on it.

### Batch 3: what shipped

Branch `feat/agent-patterns-3`, stacked on `feat/agent-patterns-2`. Grouping kept as the planner set it: AgentInbox reuses ApprovalCard (batch 1) and the new DecisionCard, so DecisionCard ships in the same batch.

| Component | Paper artboard | States built |
| --- | --- | --- |
| AgentTree | 07 Agent Tree | expanded with a failed and a waiting node, branch folded to one line ("N agents"), all complete, loading, empty |
| AgentLanes | 08 Agent Lanes | live (blocks grow into now, handoffs), block opened with detail, Needs you with a decision on the block, zoomed to the last 3 minutes |
| AgentInbox | 13 Agent Inbox | unread and read across every type with an approval selected, recap selected, filtered to none, empty, loading, error |
| DecisionCard | 14 Decision Card | multiple choice, free text, selected but not confirmed, sending, error, resolved and skipped as one line |

Paper vs tokens, batch 3:

| Paper | Kit | Why |
| --- | --- | --- |
| Violet "waiting for you", "Needs you", approval chips | caution tokens | Same as batches 1 and 2, until Boris decides on `--attention-*`. |
| DecisionCard radio on the left, 13px labels | kit RadioGroup `layout="card"` `size="sm"`; the radio sits at the end | RadioGroup is the kit control. Recommended is the RadioGroup badge (neutral). |
| Agent Tree dotted guide lines per depth | indentation only | Keeps rows on one grid; status stays in its own column. |
| Agent Tree "approve" mono chip | kit Button `soft`, `sm`, with `shortcut="⏎"` | Kit control. |
| Agent Lanes "Last 10m" pill | a SegmentedControl when `onSpanChange` is set, plain text otherwise | Zoom needs a real control. |
| Agent Lanes curved handoff lines | elbow lines (border plus radius) from the source lane to the target block | No SVG paths; easier to keep aligned with token spacing. |
| Agent Lanes "window slides with the clock" | blocks reposition each second; no slide | Moving every block would animate `left` and `width`. |
| Agent Lanes dark detail tooltip | `--bg-inverse` and `--text-fg-inverse` panel | Inverse surface role. |
| Agent Inbox filter chips with counts | SegmentedControl items "All 5" … | Kit control (radio group). |
| Agent Inbox approval detail and question | embedded kit ApprovalCard and DecisionCard | Reuse, no cousins. |
| DecisionCard width 370px | `--decision-width: 24rem` | Custom-width pattern; Jev marked it "review". |
| Inbox container width | `@container (max-width: 40rem)` with a comment naming `--grid-breakpoint-sm` | Container queries can't read `var()`; Jev flags it, the rule allows it. |

Keyboard and focus, batch 3:
- AgentTree: branch chevrons are disclosure buttons; folding shows "N agents".
- AgentLanes: blocks are buttons. A Needs you block opens a decision with focus on Approve; Escape (or Reject or Close) closes it and returns focus to the block.
- AgentInbox: rows are buttons with aria-current; the filter is a radio group; an approval reuses ApprovalCard's keys.
- DecisionCard: options are radios; ⌘/Ctrl+Enter confirms; the card goes aria-busy while sending; once resolved, focus moves to the one-line row.
- New shared doc frame `app/components/AgentDocFrame.tsx` (hero, Master, Variants) for batch 3 onward, so every agent doc has the same shape.

### Batch 4: what shipped

Branch `feat/agent-patterns-4`, stacked on `feat/agent-patterns-3`. Grouping as planned; no dependencies across batches other than shared kit pieces.

| Component | Paper artboard | Built on | States built |
| --- | --- | --- | --- |
| AutonomyDial | 10 Autonomy Dial | SegmentedControl, Badge | the four stops, default marked, disabled (locked by policy), saving |
| AgentSteering | 15 Agent Steering | Input, Button, AlertDialog | running, submitting, applied, paused, stop confirm (AlertDialog), stopped, disabled (done), error, loading |
| ModelPicker | 19 Model Picker | DropdownMenu (field trigger, groups) | closed md and sm, open grouped by vendor, selected, recommended and a disabled model with its reason, loading, error, empty |
| ContextWindow | 20 Context Window | Meter (compact bar), NumberTransition, Badge | normal, near limit (≥ 80%), full, loading, error, limit unknown; compact and full forms |

Paper vs tokens, batch 4:

| Paper | Kit | Why |
| --- | --- | --- |
| Model Picker "built on Select with groups and descriptions" | kit DropdownMenu with `triggerStyle="field"` | Select has no groups, descriptions or disabled reasons; DropdownMenu has all three. |
| Model Picker "Recommended" pill in the row | "Recommended · …" at the start of the item description | DropdownMenu items take strings only. Adding a badge slot to DropdownMenu is a possible follow-up. |
| Model Picker context and cost columns | the item's right-hand `shortcut` text, "200K · $$$" | Same column, kit slot. |
| Model Picker focus note "Northwind 405B: needs the Pro plan" | the reason stays in the disabled item's description | Always visible, no hover needed. |
| Context Window "built on Meter" | Meter for the compact bar; the full card uses its own stacked bar (role=meter) | Kit Meter has one value, no segments. |
| Context Window segment colours (grey, teal, violet, blue, light) | `--line-strong`, `--status-success`, `--highlight-base`, `--primary`, `--bg-tray` | No teal or violet roles; categorical fills reuse existing roles. A chart or categorical palette would be the proper home. |
| Context Window "fill eases when used changes" | NumberTransition rolls the number; segment widths update instantly | Width is not transform or opacity. |
| Agent Steering applied line "stays 4s" | stays until the parent clears `applied` | Timing belongs to the app. |
| Autonomy Dial tick fill | dots fill and scale on transform | Motion rule. |
| Steering and Context widths 370px | `--steering-width` and `--context-width` at 24rem | Custom-width pattern; Jev marked it "review". |

Keyboard and focus, batch 4:
- AutonomyDial: arrow keys move through the stops (SegmentedControl radio group); a change saves and announces in the panel.
- AgentSteering: Enter sends; Stop opens the AlertDialog with focus on Keep running; Escape closes it and focus returns to Stop.
- ModelPicker: Enter opens the menu, arrow keys move, Enter picks; the trigger updates.
- ContextWindow: the stacked bar is a meter with a text value; Trim oldest is a Button.

### Batch 5: what shipped

Branch `feat/agent-patterns-5`, stacked on `feat/agent-patterns-4`. Grouping as planned.

| Component | Paper artboard | Built on | States built |
| --- | --- | --- | --- |
| CitedAnswer | 16 Cited Answer | Button, ShimmerText, Skeleton | sources collapsed, sources expanded (a clicked mark highlights its source), one source, missing source (broken cite), loading, error |
| MessageActions | 17 Message Actions | Button (icon), Tooltip, DropdownMenu | assistant default, user (copy, edit, more), copied, retrying, liked, disliked with reasons, More menu, disabled while streaming, visible on hover or focus |
| InlineDiff | 18 Inline Diff | Badge, Button, Empty, Skeleton | unified, split, inline phrase, accepted, rejected, stale (file changed), loading, error, no changes |
| MemoryPanel | 21 Memory Panel | Input, Textarea, Field, Button, Badge, AlertDialog, Empty | pinned and others, editing in place, forget confirm (AlertDialog), filtered to none, empty, loading, error |

Paper vs tokens, batch 5:

| Paper | Kit | Why |
| --- | --- | --- |
| CitedAnswer "sources expand calmly (200ms height)" | the list fades and rises in | Height is not transform or opacity. |
| CitedAnswer "highlight with a short fade (600ms)" | an overlay fading on opacity over `--motion-duration-600` (500ms) | Nearest motion token. |
| InlineDiff badges, mono caps (PENDING, STALE…) | kit Badge, sentence case | Same as the other batches. |
| InlineDiff vs ApprovalCard's diff preview | separate renderers; InlineDiff adds line numbers and split mode | ApprovalCard's preview is read-only. Sharing one diff renderer is a possible follow-up. |
| MessageActions "Copied … back after 2s" | the parent controls `copied` (the doc demo resets it after 2s) | Timing belongs to the app. |
| MessageActions shown on hover | `visible="hover"`, shown on hover or keyboard focus of the row or an ancestor with `data-message-actions-host`; always shown under reduced motion | CSS can't reach an arbitrary parent otherwise. |
| MemoryPanel pinned icon | a highlighted Pin toggle (aria-pressed) | Same icon, state in colour plus aria. |
| MemoryPanel brain icon | Lucide `Brain` | Closest Lucide icon. |
| CitedAnswer and MemoryPanel widths 370px | 24rem custom widths | Custom-width pattern; Jev marked it "review" or "abstain". |

Keyboard and focus, batch 5:
- CitedAnswer: a mark is a link; Enter opens the sources and moves focus to that source.
- MessageActions: role=toolbar; Copy swaps to Copied; thumbs are toggles; a thumbs down shows reasons; More is a DropdownMenu.
- InlineDiff: ⌘/Ctrl+Enter accepts and Escape rejects inside the card; once resolved, focus moves to the one-line row.
- MemoryPanel: Forget opens the AlertDialog with focus on Keep; Escape returns focus to the Forget button. Edit puts focus in the textarea with the caret at the end; Enter saves.

### Batch 6: what shipped

Branch `feat/agent-patterns-6`, stacked on `feat/agent-patterns-5`. This completes p-3-0: all 22 agent artboards are now kit components.

| Component | Paper artboard | Built on | States built |
| --- | --- | --- | --- |
| TraceWaterfall | 22 Cost Trace Waterfall | Badge, Button, Empty, NumberTransition, Skeleton | complete with a span selected, in progress (dashed to now), one failed span, compact bar (done and running), loading, error, empty |
| UsageMeter | 04 Usage Meter | **Meter, UsageList, LineChart, Alert**, Badge, Button | normal, near limit with warning and Upgrade, limit reached, loading, error |

UsageMeter composes the kit's Meter (total), UsageList (by category), LineChart (daily area with the cap as a second series) and Alert (near limit), as Boris asked, so none of them is re-implemented. That replaces the batch 2 decision to hold it back.

Paper vs tokens, batch 6:

| Paper | Kit | Why |
| --- | --- | --- |
| Trace kinds: model blue, tool teal, approval violet | `--primary`, `--status-success`, `--status-warning` (`--status-danger` for failed) | No teal or violet roles; same mapping as AgentFleet. |
| Trace "in-progress span grows toward now" | solid bar plus a dashed extension to the end of the window | Static, so nothing animates width. |
| Trace "totals tick with NumberTransition" | kit NumberTransition for total time and cost | As designed. |
| Usage Meter stacked category bar | kit Meter for the total; categories as a kit UsageList | Composition rule; Meter has no segments. The UsageList is taller than Paper's two-column legend. |
| Usage Meter sparkline with dashed daily cap | kit LineChart `variant="area"`, with the cap as a second series; the chart keeps its own title, table toggle and legend | Composition rule; LineChart has no dashed reference line. |
| Usage Meter warning callout | kit Alert (warning or danger) with a title | Kit component. |
| Usage Meter footer | View usage (outline) always; Upgrade plan (solid primary) only near or over the limit | Matches Paper: the normal state has no upgrade push. |
| Usage Meter "accent: blue · violet · teal · neutral" per category | UsageList's own bar colour | UsageList has no per-item colour. |
| Usage Meter width 400px | `--usage-width: 25rem` | Custom-width pattern; Jev marked it "review". |

Keyboard and focus, batch 6:
- TraceWaterfall: span rows are buttons with aria-expanded controlling the detail region; Close shuts it.
- UsageMeter: the kit pieces bring their own semantics (Meter progressbar, UsageList, LineChart table toggle); Upgrade and View usage are Buttons.

### Paper vs tokens (tokens win)

| Paper | Kit | Why |
| --- | --- | --- |
| Page tokens `--eb-*` | `--bg-*`, `--line-*`, `--text-fg*`, `--primary-*`, `--status-*`, `--icon-*` | Same values in 0.14.0; the role names are the API. |
| Violet `--accent-violet` / `#7C3AED` for "approval", "waiting", "needs you" | caution: `--status-warning*` and Badge `tone="warning"` | Nistha has no violet role. **Proposal (needs Boris's OK):** an `--attention-*` role (base / fg / subtle / line, light and dark) if approval should read apart from warnings. Then swap the caution tokens in AgentTrail, AgentPlan and AgentFleet. |
| Teal `--accent-teal` for "done" in Fleet | `--status-success` | No teal role; done is success elsewhere in the kit. |
| Card radius 19px | `--radius-surface-lg` (13px) | 19px is `--radius-3xl`, a scale step, not a surface role. Kit Card uses `--radius-surface-md`; these larger tiles take the next surface step. |
| Trail card shadow `0 4px 8px` | `--shadow-sm` | Same elevation as every other kit card. |
| Status pills: mono, uppercase, 11px, with a dot | kit Badge `size="sm"` | Badge is the kit pill; it has no dot or mono caps. Risk is still text plus tone. |
| Fleet count 32px weight 300 | `--type-size-title` with `--type-weight-body` (400) | No light weight token. |
| 11px key chips and badge text | `--type-size-caption` (12px) | No 11px step. |
| Gaps 10px / 14px / 18px | nearest `--space-*` (8 / 12 / 16px) | No such space steps. |
| Approval card 400px, plan 370px | `--approval-width: 25rem`, `--plan-width: 24rem` | Same custom-width pattern as InsightCard's `--insight-width`. Jev marked these "review"; no width token fits. |
| Fleet "expanding card widens with a layout spring (320ms)" | opacity + scale fade on open; the width snaps | Motion stays on transform and opacity. |
| Batch 2 raw `#FFFBEB` / `#FDE68A` / `#92400E` / `#D97706` (Permission warning and WRITE pill) | kit Alert `variant="warning"`, Badge `tone="warning"` | These Paper values were left unconverted; they are the caution role. |
| Permission error row with an inline Retry | own row on `--status-danger-*` with a text button | Kit Alert has no action slot. |
| Monitor "collapse morphs height" (280ms) and "new step grows from zero width" | collapse swaps instantly; new steps scale in on `transform: scaleX` | Height and width are not transform or opacity. |
| ToolCallCard 440px, AgentMonitor 420px | `--toolcall-width: 27.5rem`, `--monitor-width: 26.25rem` | Same custom-width pattern as above; Jev "review". |
| Monitor clock "rolls digit by digit" | plain tabular digits | Could reuse NumberTransition later; kept simple. |
| Running Now overline 11px | `--type-size-overline` with `--type-tracking-overline` | Kit overline role. |

### Motion

- ApprovalCard and resolved row: opacity + translateY in (180ms).
- AgentTrail and AgentFleet running marker: transform rotate.
- AgentPlan: rows and the step form fade and rise in; the state marker fades on change; the collapse chevron rotates.
- AgentFleet: the open card fades and scales in; tree rows stagger 30ms (opacity + translateX); bar segments fill on `transform: scaleX`.
- Every animation and transition stops under `prefers-reduced-motion: reduce`.

### Keyboard and focus (checked with a script at 1440)

- ApprovalCard: Escape denies and Enter approves while focus is in the card; Enter on another control inside it is left alone. Once resolved, focus moves to the one-line row.
- AgentPlan: Edit opens the form with focus in Step. Enter saves, Escape cancels, and focus goes back to that step's Edit button. Add step focuses the new form; ⌘/Ctrl+Enter accepts a draft or runs an accepted plan.
- AgentFleet: the agent name is the open button and covers the whole card. Opening moves focus to Collapse; Collapse returns focus to that agent's card.
- ToolCallCard: the header is a disclosure button (aria-expanded and aria-controls); Enter toggles it.
- PermissionRequest: Escape denies and ⌘/Ctrl+Enter grants; while granting the card is aria-busy; once resolved, focus moves to the one-line row.
- RunningNow: each item is a button, and +N says how many more.
- AgentMonitor: strip steps are toggle buttons; Close in the detail returns focus to the step. The pending action is a kit ApprovalCard with Enter and Escape.

### Checks

- `npm ci`, kit build, `tsc` (app and kit), `eslint` (no errors; the warnings were already there), `npm test` (kit 53/53, app 4/4).
- Token scan: no hex, rgb or primitive `--color-*` in the new UI; every Lucide icon uses `ICON_STROKE`. Jev triage gave no `act` failures; its "review" notes are the custom widths above. I fixed a hard-coded `repeat(4, …)` and the fleet container width (now 40rem = `--grid-breakpoint-sm`).
- Screenshots at 1440, light and dark, next to the Paper exports, are in the planner's notes folder under `agent-patterns/batch1/`.

### Docs dependency

`main` doesn't have the K79 stage yet (PR #119, and #120 on top). The new doc pages use the same shape as every other doc (hero, Master with Preview / Variants, `.example` sections), so with #119 and #120 they get the Code and Contract tabs and the stacked Variants list. Checked by a trial merge of `feat/variants-tab-cleanup`: tsc passes, and the four pages render in the stage at 1440 in light and dark, with screenshots in `agent-patterns/batch1/with-k79-stage/`. Two expected conflicts: `NOTES.md` (both add it; keep both sections) and `lib/playground-nav.ts` (#120 renames the "Agent" group to "AI"; put the four new ids into "AI"). The Code tab reads from the contracts' `snippet` field and the Contract tab from the contract JSON.

### PR status

- Batch 1: `feat/agent-patterns-1`, https://github.com/borisj74/agentic-ds-kit/pull/121. Open, not merged.
- Batch 6: `feat/agent-patterns-6`, stacked on batch 5, PR base `feat/agent-patterns-5`. Open, not merged.
- Batch 5: `feat/agent-patterns-5`, stacked on batch 4, https://github.com/borisj74/agentic-ds-kit/pull/125, PR base `feat/agent-patterns-4`. Open, not merged.
- Batch 4: `feat/agent-patterns-4`, stacked on batch 3, https://github.com/borisj74/agentic-ds-kit/pull/124, PR base `feat/agent-patterns-3`. Open, not merged.
- Batch 3: `feat/agent-patterns-3`, stacked on batch 2, https://github.com/borisj74/agentic-ds-kit/pull/123, PR base `feat/agent-patterns-2`. Open, not merged.
- Batch 2: `feat/agent-patterns-2`, branched from batch 1 because batch 1 is not merged. https://github.com/borisj74/agentic-ds-kit/pull/122, opened against `feat/agent-patterns-1` so the diff shows batch 2 only. Open, not merged.
