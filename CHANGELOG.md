# Changelog

All notable changes to `agentic-ds-kit` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Inspect mode**: with `NEXT_PUBLIC_NISTHA_INSPECT=1` (or `true`), every kit component writes `data-nistha="<contract id>"` on its root element. A component built on another kit component writes both ids on the shared element (`tiltcard card`, `select dropdownmenu`). Off by default, and off in production builds (`NODE_ENV=production`) unless `NEXT_PUBLIC_NISTHA_INSPECT_FORCE=1` is also set. With the mode off the markup is unchanged. The switch is a plain function (`ui/shared/inspect.ts`), so server components such as Button, Card and Table stay server components
- **`inspect <url-or-file>`**: reads a rendered page (Node `fetch` of the server HTML, or a local `.html` file) and lists the kit pieces on it, grouped by level, with counts, plus ids not in the installed index. Landmark checks: `no-main`, `multiple-main`, `no-h1` (errors). No markers is a note that inspect mode may be off, not an error. `--json` prints the same data. `--browser` reads the live page after hydration with Playwright, an optional install the kit loads only then. Exit 0 OK, 1 landmark errors, 2 could not run
- **MCP `inspect_ui`**: the same result for an agent, from a `url` or from `html` plus `name`

## [0.24.0] - 2026-11-14

### Added

- **`review --score`**: a 0–100 contract fit score, the share of UI elements that come from the kit minus 5 per error and 2 per warning for every 100 elements (up to 100 elements counts as 100), so a big folder is not pushed to 0 by its size. UI elements are opening JSX tags: kit imports count as kit; `button`, `a`, `input`, `select`, `textarea`, `img`, `table` and `dialog` count as other; layout and text tags, icons and other components are not counted. Text output prints the score and the formula; `--json --score` adds `score: { value, kitElements, otherElements, errors, warnings, formula }`. Without `--score` or `--min`, output and exit codes are unchanged
- **`review --min <n>`**: exits 1 when the score is below `n` (and turns on `--score`); an invalid `n` exits 2
- **MCP `review_ui`** results include `score`
- **`templates/github/contract-fit.yml`**: a workflow to copy into `.github/workflows/`. On `pull_request` it runs `review --json --score` and keeps one PR comment with the score, counts and top 10 findings. Report only unless `MIN_SCORE` is set; fork PRs still pass with the score in the log
- **Contract fit docs page** (`/contract-fit`) with the formula and a worked example
- Nistha runs contract fit in its own CI (`.github/workflows/contract-fit.yml`, not a required check): patterns must score 100, the docs app is report only

## [0.23.0] - 2026-11-14

### Added

- **`npx agentic-ds-kit review <path>`**: checks a file or folder (`.tsx`, `.ts`, `.jsx`, `.js`, `.css`) against the contracts and tokens and says what to fix. Five rules: `raw-value` (error: hardcoded colour, spacing, radius or shadow, or a primitive `--color-*` ramp; the fix names the closest semantic token), `wrong-use` (error: Button with `href`/`to`/`as="a"`, more than one solid primary Button in a file, icon-only Button without an aria label), `outside-kit` (error: other UI libraries and local copies such as `components/ui/button`), `rebuild` (warning: an organism or block built by hand from its parts) and `pattern-fits` (warning: the file looks like a pattern; fix `npx agentic-ds-kit add <id>`). Text output by default, `--json` for findings plus error and warning counts. Exit 1 on any error, 0 for warnings only, 2 when the review cannot run
- **MCP `review_ui`**: the same findings for an agent, from a `path` or from `code` plus `filename` (a draft that is not saved yet). Read-only
- `AGENTS.md` and the `prototype-from-kit` skill tell agents to run review on what they changed and fix the errors before finishing

## [0.22.0] - 2026-11-14

### Added

- **`level` on every contract**: `atom`, `molecule`, `organism`, `block` (the `kind: "block"` contracts) or `template` (patterns), right after `status`. `contracts/index.json` copies it from each contract (`npm run sync:index -w agentic-ds-kit` now syncs `level` as well as `intent`, and `--check` reports both). The tokens row has no level. A new test checks every contract and index row
- **MCP level filter**: `list_components` takes an optional `level` (`atom`, `molecule`, `organism`, `block`) next to `kind`, and its rows include `level`. `get_component` and `search_components` include `level`; `list_patterns` and `get_pattern` include `level: "template"`. An unknown level is a tool error
- **Build order** in `AGENTS.md` and the `prototype-from-kit` skill: start from the biggest piece that fits (pattern, block, organism, molecule, atom), check `level` in the index, and never rebuild a block or organism from atoms when the kit has it
- **`npx agentic-ds-kit init <folder> [--template <pattern-id>] [--force]`**: a new Next app (App Router, TypeScript) that starts from a pattern, or from a blank page with a kit PageHeader. It writes `package.json` (this kit's version, Next 16, React 19), `tsconfig.json` with the `@/*` alias, `next.config.ts`, `.gitignore`, `app/layout.tsx` (kit tokens and layout CSS, icons on demand), `app/page.tsx` rendering the pattern in `<main>`, `AGENTS.md`, `CLAUDE.md`, `.mcp.json` (the kit MCP server) and a short README, then copies the pattern in exactly as `add` does (contract and `requires` included). `--template settings` follows its contract: the page hosts it in the app-shell example (`layout-shell--inset`, copied in too) with a SideNav Settings group built from `SETTINGS_SECTIONS` and the section read from `?section=`. `app/icons-on-demand.tsx` loads `agentic-ds-kit/icons-on-demand` so any Lucide name renders. No install and no network. A folder with files is refused unless `--force`, which only adds missing files. Templates ship in `templates/next-app/`. `add` behaves and prints as before; its logic now lives in `bin/add.mjs`
- Docs site: **Start here** (`/start-here`), for product managers and designers: what Nistha is, pick a starting screen, run `init`, ask Claude or Cursor for changes, example requests, the words we use (template, block, organism, molecule, atom) and when to ask an engineer. First link on the home page and in the Docs nav
- Docs site: a level Badge on component and block pages, and a level filter (`?level=`) in the components gallery that works with the group tabs and search

### Changed

- **AppHeader and SideNav contracts: `compose.blocks` is now `compose.parts`.** If you read the raw contract JSON, read `compose.parts`. The wording "building blocks" is now "compose parts" in the contracts, CLI help, skill, docs and comments, so it no longer clashes with blocks (`kind: "block"`). Component names and exports (`AppHeaderRoot`, `SideNavRoot`, …) do not change

## [0.21.0] - 2026-11-13

### Added

- **Link**: text that navigates. `variant="inline"` (underlined, inherits the sentence's type) or `"standalone"` (on its own line, underlined on hover), `external` (new tab, `rel="noopener noreferrer"`, ExternalLink icon and a screen-reader "opens in a new tab"), and `linkAs` for router links. Contract, docs page and tests included; Button's contract now points navigation to Link
- Cell `tone` and Scorecard `badgeTone` contracts list `primary` and `highlight` (the components already supported them through Badge)
- Contracts document props the components already had: Button `draggable` / `onDragStart` / `onDragEnd`; DropdownMenu `triggerDraggable` / `onTriggerDragStart` / `onTriggerDragEnd`; Input, Select and Textarea `describedBy`; HeaderCell `defaultChecked`; Scoreboard `aria-label`; ShimmerText `style`; ModalCard `role`, `tabIndex` and `aria-modal`
- `agentic-ds-kit/icons-on-demand`: opt-in entry that lets any Lucide icon name render in kit icon props, each loaded as its own chunk
- MCP: `detail` (`summary` or `full`), `limit` and `offset` on `list_components`, `get_tokens` and `questions`; `kind` filter on `list_components`. Paged answers carry `page: { offset, limit, total, next }`
- CLI: `npx agentic-ds-kit --version` (also `-v`)
- Pagination `compact`: icon-only Previous and Next around a "2 of 10" status for narrow screens (screen readers hear "Page 2 of 10")
- `KitLabelsProvider` (with `useKitLabels`, `DEFAULT_KIT_LABELS` and the `KitLabels` type): translate or reword the screen-reader labels the kit writes itself (close buttons, pager and month arrows, picker panels, remove buttons, Chat and MessageActions controls) across 23 components. Pass only the keys you change; the rest stay English. Components' own `ariaLabel` props still win
- Breadcrumb `ariaLabel` (default "Breadcrumb") and Field `helpLabel` (default "Help"), so these server-rendered components can be translated without the provider

### Changed

- The BillingSchedule pattern's next-charge panel is a kit Card (`size="sm"`) with a vertical Divider. Its surface is now the card fill instead of the subtle grey. Re-copy with `npx agentic-ds-kit add billing-schedule --force`
- `contracts/index.json` intents are generated from each contract (84 had drifted); the contract wins
- DatePicker's panel uses `var(--z-overlay)` instead of a fixed `z-index: 20`
- `npx agentic-ds-kit mcp` runs on a small built-in server with no runtime dependencies (MCP protocol **2025-06-18**, tools only; it also answers 2025-03-26 and 2024-11-05 clients). `@modelcontextprotocol/sdk` and `zod` are no longer dependencies, so installing the kit no longer pulls express, hono and the rest of the SDK. Tool names, arguments and answers are unchanged; invalid arguments still return an `isError` result
- **Breaking edge, icons:** a Lucide name outside the bundled set (about 120 common icons, including every name the kit's own components use) no longer loads by default; it renders nothing and warns in development. Pass the Lucide component, or `import "agentic-ds-kit/icons-on-demand"` once to keep the old behaviour. Importing Button now bundles about 110 modules instead of about 1,800
- **Breaking edge, MCP:** `list_components` and `get_tokens` return summary rows by default (no category or usage notes). Pass `detail: "full"` for the previous fields. Answers are compact JSON and no longer repeat the data as `structuredContent`, so they are 3 to 6 times smaller. `questions` still returns the full CLI JSON by default
- `npx agentic-ds-kit add` reads `paths` (and `baseUrl`) from tsconfig.json or jsconfig.json, comments allowed, to print the `@/...` import for both root and `src/` aliases
- Peer dependency is `next >=15` (Next 14 does not support React 19)
- The published package no longer ships source maps: 644 kB instead of 1.1 MB (2.7 MB unpacked instead of 4.4 MB)
- The README states that the package is ESM-only
- Pagination wraps instead of overflowing on narrow screens
- CommentsPanel no longer overflows a 375px screen: a thread's one-line preview truncates instead of setting the panel's minimum width

### Removed

- DropdownMenu `triggerRef` and `triggerProps` are no longer in the published types. They were marked `@internal` (Select's pass-through) and still work at runtime

## [0.20.0] - 2026-11-13

### Added

- `describedBy` on InputOTP, SegmentedControl, RadioGroup and Slider; `labelledBy` and `error` on Slider. Field passes its label id to a Slider so the thumbs are named

### Changed

- Alert titles use the `-fg` tones for contrast; the icon keeps the status colour
- Escape in an open Select or DatePicker inside a Modal, Drawer or AlertDialog closes only the Select or DatePicker. Modal, Drawer and AlertDialog ignore an Escape that a child already handled (`event.defaultPrevented`)
- Escape in an open overlay (ContextMenu, Tooltip, Popover, DateRangePicker, Combobox, MultiSelect, TagInput, AnchorNav, DateTimePicker) closes only that overlay, not a parent Modal or Drawer
- Field no longer adds `role="group"`; RadioGroup's fieldset is `role="radiogroup"` and carries `aria-invalid` instead of each radio
- `aria-invalid` is no longer set on the DatePicker, Select and FileUpload trigger buttons; the error still reaches them through `aria-describedby`
- Modal, Drawer, AlertDialog and ModalCard skip their entrance animation under `prefers-reduced-motion`
- Muted text on tinted AgentInbox and SetupGuide rows uses `--text-fg-muted` for contrast
- NumberTransition, ShimmerText and the TraceWaterfall totals give screen readers visually hidden text and hide the animated part. TraceWaterfall totals now read their value, not "Total time" / "Total cost"
- LineChart, BarChart and UsageMeter use `role="group"` with a label when their points are focusable
- The Modal and Drawer focus trap skips disabled controls and only matches `a[href]`
- The Select trigger has `aria-haspopup` in server-rendered HTML

### Known issues

- Field borders (`--line` / `--border-strong`) are about 1.2:1 against the field fill, below WCAG 1.4.11 (3:1). A darker border was tried and rejected as too jarring; to revisit with a new primitive

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
