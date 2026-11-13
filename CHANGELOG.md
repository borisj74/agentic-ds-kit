# Changelog

All notable changes to `agentic-ds-kit` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `--border-field` token: the resting border of form controls. Slate 500 in light and dark (4.76:1 and 3.75:1 against the field fill), neutral 500 under `data-color="ink"`. Input, Textarea, Select and the pickers that share the control styles (Combobox, MultiSelect, TagInput, NumberInput, DatePicker, DateRangePicker, DateTimePicker, TimePicker) use it
- `describedBy` on InputOTP, SegmentedControl, RadioGroup and Slider; `labelledBy` and `error` on Slider. Field passes its label id to a Slider so the thumbs are named

### Changed

- Field borders are darker so they reach 3:1 contrast. Hover and focus colours are unchanged
- Alert titles use the `-fg` tones for contrast; the icon keeps the status colour
- Escape in an open overlay (ContextMenu, Tooltip, Popover, DateRangePicker, Combobox, MultiSelect, TagInput, AnchorNav, DateTimePicker) closes only that overlay, not a parent Modal or Drawer
- Field no longer adds `role="group"`; RadioGroup's fieldset is `role="radiogroup"` and carries `aria-invalid` instead of each radio
- `aria-invalid` is no longer set on the DatePicker, Select and FileUpload trigger buttons; the error still reaches them through `aria-describedby`
- Modal, Drawer, AlertDialog and ModalCard skip their entrance animation under `prefers-reduced-motion`

## [0.19.0] - 2026-11-12

### Added

- **Blocks**: larger kit components for a whole area of a screen, imported like any component. Their contracts have `"kind": "block"`, a `category` and a `summary`; the MCP returns `kind` and `block`. Twelve ship: AgentOverview, RunDetail, LiveSession, PlanReview, ChangeReview, KpiBoard, UsageBilling, AppDirectory, WorkBoard, ActivityFeed, Plans and LogoStrip
- Selection props on AgentTrail, AgentTree, AgentSteering and Chat; a selected state on Scorecard; `aria-expanded` on AgentInbox rows

### Changed

- LineChart draws smooth lines by default (`curve="linear"` keeps straight segments)
- AgentMonitor's step strip gives every step the same width

### Deprecated

- AgentMonitor `weight` is ignored

## [0.18.0] - 2026-11-12

Polish release. No prop or API changes.

### Changed

- Cell and HeaderCell are tighter (sm 40px, md 48px), so DataTable rows are shorter
- A single-series BarChart paints every bar in the first palette colour unless a datum sets `color`; chart gridlines are fainter
- AgentInbox and NotificationStack drop the unread dot (unread rows stay bold); AutonomyDial drops its tick dots
- LoadingAnimation, Timeline's Now step, AnchorNav's selected link, FilterButton's count and the Slider thumb follow the brand colour
- AppNav's active fill uses `--surface-brand-subtle`, as SideNav does

### Fixed

- AgentLanes handoff lines, FileUpload row alignment and touch targets, AgentMonitor touch targets, UsageMeter's chart and ExperimentCard's variant letters

## [0.17.0] - 2026-11-11

### Added

- Copy-in patterns `settings` (Billing, Profile, Team, Notifications and Security sections) and `onboarding` (four steps plus error and submitting states)
- `layout-shell--inset` layout class: the canvas frames the nav and the page floats on an inset panel
- `--sidenav-divider` variable on SideNav; the default SideNav look is unchanged

### Changed

- `npx agentic-ds-kit add <id>` also copies the patterns a pattern builds on

## [0.16.0] - 2026-11-10

### Added

- Motion components: BlurCrossfade (crossfades a value or state; the one approved use of `filter: blur`, off under reduced motion), TextReveal, TiltCard, GridBackground and GradientText (ink, brand and inverse tones). All opt-in; no existing component animates differently

## [0.15.0] - 2026-11-10

### Added

- 22 agent components, each with a contract the MCP lists: ApprovalCard, AgentTrail, AgentPlan, AgentFleet, ToolCallCard, PermissionRequest, RunningNow, AgentMonitor, AgentTree, AgentLanes, AgentInbox, DecisionCard, AutonomyDial, AgentSteering, ModelPicker, ContextWindow, CitedAnswer, MessageActions, InlineDiff, MemoryPanel, TraceWaterfall and UsageMeter
- 10 SaaS components: ChangeSummary, CommentThread, CommentsPanel, ExperimentCard, IntegrationPicker, InvoiceDocument, NotificationStack, PricingPlans, SetupGuide and TaskBoard
- Copy-in patterns `billing-schedule` and `integration-settings` (`npx agentic-ds-kit add <id>`)
- DateRangePicker can show two months

### Fixed

- Avatar fill on canvas, the CodeSnippet tab inset and ProgressSteps colour

Nothing is removed or renamed.

## [0.14.0] - 2026-11-10

### Changed

- The Nistha look is the default: Electric Blue primary on cool Slate neutrals, and info follows the brand blue. To keep the previous black look, set `data-color="ink"` on `<html>`
- Page titles are 700 with tighter tracking; overlines, table heads and nav group labels are Plex Mono caps
- A selected DataTable row uses `--action-selected`

### Added

- `--primary-fg` token for brand text on light blue fills

Token names and component props are unchanged.

## [0.13.0] - 2026-11-07

### Added

- `npx agentic-ds-kit mcp` starts a read-only stdio MCP server so agents can query the installed contracts, tokens, patterns, rules, and questions output

## [0.12.0] - 2026-11-06

### Added

- SegmentedControl: one choice in a joined track, controlled or uncontrolled, sm or md, optional icons, `role="radiogroup"` with roving tabindex and arrow keys
- TileGroup: selectable cards for a plan or option picker, single or multi select, with title, description, a price or meta slot, and checked or disabled tiles
- Kbd: a shortcut chip for one key, placed in a row for a chord
- Customize panel slots for interface, heading, and mono fonts, a neutrals scale, a spacing scale, and shadow intensity, each writing the existing CSS variables

### Fixed

- `agentic-ds-kit questions` writes its JSON with a blocking stdout write so the catalog is not cut off when it grows past the pipe buffer

## [0.11.0] - 2026-11-06

### Added

- Combobox, DateRangePicker, NumberInput, CurrencyInput, MultiSelect, TagInput, AnchorNav, FilterBar, Popover, ContextMenu, Resizable, TimePicker, and DateTimePicker

### Breaking: removed patterns

- Inbox (`inbox`), Activity (`activity`), Invite (`invite-members`), Delivery (`delivery`), and Assistant (`assistant-workspace`). They were too app-specific.

## [0.10.0] - 2026-11-06

Cards-inspired restyle of tokens, type, radius, and shadow, plus playground theming and a follow-up of live studio controls.

### Added

- Font roles (`--font-heading` / `--font-body`, aliases of `--font-display` / `--font-sans`) and a `data-font` switcher (Inter, IBM Plex, Geist, system)
- Copy prompt for AI from the active tokens and contracts catalog
- Token `useWhen` / `doNot` / notes via `packages/kit/tokens/usage.json`
- Primary hex → ramp, with Ink / Blue / Violet / Teal shortcuts and a coherent dark pair
- Live `--radius-base` and `--shadow-sm` controls in `/studio`
- `delivery` pattern (Scoreboard + Timeline + members DataTable)
- Playground `/studio` for live token controls
- Badge `appearance`: `soft` | `tint` | `solid` | `outline` (default `soft`)

### Changed

- Semantic tokens follow Cards: canvas / subtle / tray / surface / raised / floating ladders, type ladders, radius derived from `--radius-base`, soft shadow scale
- Playground light/dark and color presets
- Old token names (`--surface-page`, `--text-primary`, `--action-primary`, numbered radius/shadow) remain aliases

### Breaking

**Button** no longer takes `variant: primary | secondary | tertiary | danger`. It is now `appearance` × `mode`, with an optional `flat` set:

| 0.9.0 | 0.10.0 |
| --- | --- |
| `variant="primary"` | `appearance="solid" mode="primary"` |
| `variant="secondary"` | `appearance="outline" mode="neutral"` |
| `variant="tertiary"` | `appearance="ghost" mode="neutral"` |
| `variant="danger"` | `appearance="solid" mode="danger"` |

`appearance`: `solid` | `outline` | `soft` | `ghost`. `mode`: `primary` | `neutral` | `danger`. `flat` removes elevation (combine with solid, outline, or soft; ghost is coerced to soft). Sizes stay `lg` | `md` | `sm`. One `appearance="solid" mode="primary"` Button per view.

**Badge** now has `appearance: soft | tint | solid | outline` (default `soft`). Tones: `neutral | primary | brand | success | warning | danger | info | highlight` (`brand` aliases `primary`).
