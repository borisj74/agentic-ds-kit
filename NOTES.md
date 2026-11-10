# Notes

Decisions for the nistha website (the docs site in this repo), newest first.

## 2026-11-10: SaaS patterns (feat/saas-patterns-1, -2, -3)

Source: Paper file *Nistha Agent Patterns* (`01M6S6EXZCX07PR8P1YXPE8BQE`), page p-4-0 "Nistha SaaS Patterns". These parts feed the p-6-0 Settings and Onboarding screens, which are not built here.

### Inventory and batch plan

| # | Paper artboard | In the kit already? | Kit id | Batch |
| --- | --- | --- | --- | --- |
| 01 | Billing Schedule | No. Mostly Table + Badge + Alert, plus a next-charge box: asked Boris whether it earns a component | `billingschedule` | 3 |
| 02 | Invoice & Credit Note | No | `invoicedocument` | 3 |
| 03 | Change Summary | No (Scorecard / Scoreboard show one KPI each, not before → after per metric) | `changesummary` | 1 |
| 04 | Experiment Card | No | `experimentcard` | 1 |
| 05 | Comment Thread | No (Chat is the assistant conversation) | `commentthread` | 2 |
| 06 | Comments Panel | No; hosts Comment Thread on a kit Drawer | `commentspanel` | 2 |
| 07 | Notification Stack | No (Toast is instant feedback, AgentInbox is agent work) | `notificationstack` | 1 |
| 08 | Integration Picker | No | `integrationpicker` | 2 |
| 09 | Integration Settings | No. A settings form of Field + Select + Switch + chips + Alert + AlertDialog: asked Boris whether it earns a component | `integrationsettings` | 3 |
| 10 | Setup Guide | No (ProgressSteps is a linear wizard) | `setupguide` | 1 |
| 11 | Pricing Plans | No | `pricingplans` | 2 |
| 12 | Task Board | No | `taskboard` | 3 |

- **Skipped because Nistha already has them:** none on p-4-0. Usage Meter, the other Settings piece, shipped from p-3-0 in #126; Meter, UsageList, Alert and Toast are reused inside these components, not rebuilt.
- **Batches:** 1 = Setup Guide, Notification Stack, Change Summary, Experiment Card (self-contained, first for Onboarding and Notifications). 2 = Comment Thread, Comments Panel (hosts the thread, so same batch), Integration Picker, Pricing Plans. 3 = Billing Schedule, Invoice & Credit Note, Integration Settings, Task Board; the two composition questions above are answered before it.
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
