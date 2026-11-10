# Notes

Decisions for the nistha website (the docs site in this repo), newest first.

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
- **Skipped because Nistha already has them:** nothing in batch 1. The closest kit pieces (Timeline, ProgressSteps, InsightCard, AlertDialog, Scorecard) do a different job, and each new contract says which to use instead.

### Batch 1: what shipped

| Component | Paper artboard | States built |
| --- | --- | --- |
| ApprovalCard | 01 Approval Card | pending (high risk + countdown, diff preview, medium), resolved approved / denied / expired |
| AgentTrail | 03 Agent Trail | step done / running / approval / pending / failed, tag, icon, counter |
| AgentPlan | 11 Agent Plan | 01 draft (edit, remove, add), 02 editing a step, 03 accepted, 04 running with a step waiting, 05 complete, 06 failed, 07 drafting, 08 empty, 09 collapsed |
| AgentFleet | 06 Agent Fleet | 01 overview, 02 focused (one open, others compact), 03 all idle + totals, 04 needs you + failed + totals, 05 loading, 06 empty |

Each component has a CSS module, Lucide icons at 16px with `ICON_STROKE` (1.5), a `contracts/<id>.json`, an index entry, the barrel export, a doc page (Preview with controls, Variants, plus Code / Contract from the contract once the K79 stage lands) and an "Agent" nav and gallery entry. The MCP lists them (the test now expects 95 components).

#### Kit change outside the four

- **Button `shortcut` prop.** Paper puts key chips inside the buttons ("Deny Esc", "Approve ⏎", "Accept plan ⌘⏎"). Button only takes a string label, so I added an optional, decorative `shortcut` string. It is aria-hidden; callers wire the key and set `aria-keyshortcuts`. It is in `contracts/button.json`. This extends Button instead of making a local cousin.

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

### Checks

- `npm ci`, kit build, `tsc` (app and kit), `eslint` (no errors; the warnings were already there), `npm test` (kit 53/53, app 4/4).
- Token scan: no hex, rgb or primitive `--color-*` in the new UI; every Lucide icon uses `ICON_STROKE`. Jev triage gave no `act` failures; its "review" notes are the custom widths above. I fixed a hard-coded `repeat(4, …)` and the fleet container width (now 40rem = `--grid-breakpoint-sm`).
- Screenshots at 1440, light and dark, next to the Paper exports, are in the planner's notes folder under `agent-patterns/batch1/`.

### Docs dependency

`main` doesn't have the K79 stage yet (PR #119, and #120 on top). The new doc pages use the same shape as every other doc (hero, Master with Preview / Variants, `.example` sections), so with #119 and #120 they get the Code and Contract tabs and the stacked Variants list. Checked by a trial merge of `feat/variants-tab-cleanup`: tsc passes, and the four pages render in the stage at 1440 in light and dark, with screenshots in `agent-patterns/batch1/with-k79-stage/`. Two expected conflicts: `NOTES.md` (both add it; keep both sections) and `lib/playground-nav.ts` (#120 renames the "Agent" group to "AI"; put the four new ids into "AI"). The Code tab reads from the contracts' `snippet` field and the Contract tab from the contract JSON.

### PR status

- Batch 1: `feat/agent-patterns-1`. PR opened, not merged.
- Batch 2: `feat/agent-patterns-2`, not started.
