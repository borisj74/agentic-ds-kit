# Notes

Decisions for the kit and the nistha website, newest first.

## 2026-11-10: agent patterns (feat/agent-patterns-1 and -2)

Source: Paper file *Nistha Agent Patterns* (`01M6S6EXZCX07PR8P1YXPE8BQE`), page p-3-0 "Nistha Agent Patterns".

### Scope

- The request named "the 4 from p-2-0", but the file has no p-2-0 page. Its pages are p-3-0 (Agent Patterns, 22 artboards), p-4-0 (SaaS Patterns), p-5-0 (Motion) and p-6-0 (Screens: full Settings and Onboarding screens, not components). Boris (via the planner) picked:
  - **Batch 1** (`feat/agent-patterns-1`, from `main`): Approval Card, Agent Trail, Agent Plan, Agent Fleet from p-3-0.
  - **Batch 2** (`feat/agent-patterns-2`): the next four p-3-0 components that build on batch 1.
- **Not in scope yet:** the p-6-0 screens (Settings set: Billing, Profile, Team, Notifications, Security with their states; Onboarding steps 01–04) and the p-4-0 pieces they use (Usage Meter, Billing Schedule, Invoice & Credit Note, Change Summary, Experiment Card, Comment Thread, Comments Panel, Notification Stack, Integration Picker, Integration Settings, Setup Guide, Pricing Plans, Task Board).
- **Skipped because Nistha already has them:** nothing in batch 1. In batch 2, **Usage Meter** (04) is held back: kit Meter (stacked bar), UsageList (limits per row) and LineChart (the daily sparkline) already cover its parts. A UsageMeter would mostly compose them, so it waits for a decision on whether that composition earns its own contract. The closest kit pieces (Timeline, ProgressSteps, InsightCard, AlertDialog, Scorecard) do a different job, and each new contract says which to use instead.

### Batch 1: what shipped

| Component | Paper artboard | States built |
| --- | --- | --- |
| ApprovalCard | 01 Approval Card | pending (high risk + countdown, diff preview, medium), resolved approved / denied / expired |
| AgentTrail | 03 Agent Trail | step done / running / approval / pending / failed, tag, icon, counter |
| AgentPlan | 11 Agent Plan | 01 draft (edit, remove, add), 02 editing a step, 03 accepted, 04 running with a step waiting, 05 complete, 06 failed, 07 drafting, 08 empty, 09 collapsed |
| AgentFleet | 06 Agent Fleet | 01 overview, 02 focused (one open, others compact), 03 all idle + totals, 04 needs you + failed + totals, 05 loading, 06 empty |

Each component has a CSS module, Lucide icons at 16px with `ICON_STROKE` (1.5), a `contracts/<id>.json`, an index entry, the barrel export, a doc page (Preview with controls, Variants, plus Code / Contract from the contract once the K79 stage lands) and an "Agent" nav and gallery entry. The MCP lists them (the test expects 95 components after batch 1 and 99 after batch 2).

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

**Not in batch 2:** Usage Meter (see Scope), and the other p-3-0 artboards: Agent Tree, Agent Lanes, Autonomy Dial, Agent Inbox, Decision Card, Agent Steering, Cited Answer, Message Actions, Inline Diff, Model Picker, Context Window, Memory Panel, Cost Trace Waterfall.

#### Batch 2 changes to batch 1

- ApprovalCard: when the card resolves while focus is inside it, focus moves to the one-line row. The shared hook `ui/shared/useResolvedFocus.ts` does the same for PermissionRequest. That commit is on `feat/agent-patterns-1` too; batch 2 is rebased on it.

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
- Batch 2: `feat/agent-patterns-2`, branched from batch 1 because batch 1 is not merged. https://github.com/borisj74/agentic-ds-kit/pull/122, opened against `feat/agent-patterns-1` so the diff shows batch 2 only. Open, not merged.
