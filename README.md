# Nistha

**Docs: [https://agentic-ds-kit.vercel.app](https://agentic-ds-kit.vercel.app)**

Nistha — a code-only design system for coding agents and product UI. Nistha means steadfast, steady practice. Install: npm i agentic-ds-kit

A **code-only** design system for agents and product UIs. Contracts, tokens, React components, and example screen patterns — published as [`agentic-ds-kit`](https://www.npmjs.com/package/agentic-ds-kit).

**Code is the contract.** Agents read the catalog and import from the package. They do not invent local cousins.

The **kit** lives in `packages/kit`. The **playground** in this repo is the docs site that consumes that package. Unrelated to BillingPlatform or PracticeFlow.

[![npm](https://img.shields.io/npm/v/agentic-ds-kit)](https://www.npmjs.com/package/agentic-ds-kit)

## Quick start

```bash
npx agentic-ds-kit init my-app
```

Open `my-app` in Claude Code or Cursor and ask for a screen, for example:

> Add a page where I review what my agents did today: runs, failures and anything waiting for my approval. Use only kit components.

### How agents use the kit

The agent starts at `contracts/index.json`, the list of every kit piece with its level (pattern, block, organism, molecule, atom) and a one-line purpose. It picks the biggest piece that fits, opens only that piece's contract, and imports it from `agentic-ds-kit` with the props, tokens and rules the contract gives. If nothing fits, it stops and asks instead of building its own version. `AGENTS.md` in the app root holds these rules, and `npx agentic-ds-kit review` checks the result.

## Install in an app

```bash
npm install agentic-ds-kit@latest
```

```tsx
import { Button, Scoreboard } from "agentic-ds-kit";
```

The package is ESM-only (`import`, not `require()`), needs React 19, and supports Next.js 15 or later.

Tokens load with that import. Copy `AGENTS.md` and `CLAUDE.md` from the package into the app root so Cursor and Claude Code follow the kit. Step-by-step (existing app, new folder, upgrade from 0.1.0, troubleshooting): [docs/getting-started.md](docs/getting-started.md#install-the-package-in-your-app).

New app from a working screen: `npx agentic-ds-kit init my-app --template dashboard`. Not an engineer? Read [Start here](https://agentic-ds-kit.vercel.app/start-here).

Check what an agent built: `npx agentic-ds-kit review app` lists hardcoded values, wrong use of kit parts and imports from other UI libraries, each with a fix ([Review](docs/getting-started.md#review)). Add `--score` for a 0–100 contract fit score, and copy `templates/github/contract-fit.yml` to post it on pull requests ([Contract fit](docs/getting-started.md#contract-fit)).

Check the running page: start the app with `NEXT_PUBLIC_NISTHA_INSPECT=1` and `npx agentic-ds-kit inspect http://localhost:3000` lists the kit pieces it renders, by level, and flags a missing `<main>` or `<h1>` ([Live check](docs/getting-started.md#live-check)).

## What's here

Catalog source of truth: [`packages/kit/contracts/index.json`](packages/kit/contracts/index.json) (<!-- catalog:counts -->158 components, including 14 blocks; 15 patterns<!-- /catalog:counts -->). Browse blocks on the docs site at `/blocks`.

### Foundations
- `packages/kit/tokens/tokens.json` — color, space, radius, border width, type, shadow, motion
- `packages/kit/lib/tokens.css` — semantic CSS variables (import as `agentic-ds-kit/tokens.css`)

### Components

<!-- catalog:components -->
- **Actions** — Button, IconButton, ButtonGroup, SplitButton, DropdownMenu, FilterButton, FilterBar
- **Forms** — Input, Textarea, Select, SegmentedControl, TileGroup, InputOTP, Checkbox, RadioGroup, Switch, Slider, Field, FieldSet, SaveBar, DatePicker, DateRangePicker, DateTimePicker, TimePicker, NumberInput, CurrencyInput, Combobox, MultiSelect, TagInput, ColorPicker, FileUpload
- **Data & charts** — Table, DataTable, DataGrid, Cell, HeaderCell, ListView, LinkList, TreeView, UsageList, Scorecard, Scoreboard, LineChart, BarChart, BarList, ComboChart, Heatmap, PieChart, ScatterChart, NumberTransition, InsightCard, Calendar, Meter
- **Feedback** — Alert, Badge, Tag, Count, Delta, Kbd, Tooltip, Toast, Empty, LoadError, Progress, ProgressSteps, Spinner, LoadingAnimation, ThinkingAnimation, ShimmerText, Skeleton
- **Overlays** — Modal, ModalCard, Drawer, AlertDialog, Command, HelpPopover, Popover, ContextMenu
- **Navigation & chrome** — AppHeader, AppNav, SideNav, AnchorNav, Link, NavigationMenu, Breadcrumb, Tabs, Pagination, PageHeader, Section
- **Structure** — Card, Divider, Accordion, Collapsible, Resizable, Carousel, Conveyor, Avatar, AvatarGroup, Chat, Timeline, CodeSnippet
- **Agent** — ApprovalCard, AssumptionLog, AgentTrail, AgentPlan, ToolCallCard, PermissionRequest, RedactionPreview, RunningNow, AgentMonitor, AgentTree, AgentInbox, GuardrailLog, DecisionCard, DoneCheck, AutonomyDial, AgentSteering, ModelPicker, ContextWindow, CitedAnswer, MessageActions, InlineDiff, MemoryPanel, TraceWaterfall, UsageMeter, TaskBrief
- **SaaS** — SetupGuide, NotificationStack, ChangeSummary, ExperimentCard, CommentThread, CommentsPanel, IntegrationPicker, PricingPlans, InvoiceDocument, BillingSchedule, TaskBoard
- **Motion** — BlurCrossfade, TextReveal, TiltCard, GridBackground, GradientText
<!-- /catalog:components -->

### Blocks

Blocks are larger kit components for a whole area of a screen (`"kind": "block"` in the contract). Import them from `agentic-ds-kit` like any component and put them inside the page's `<main>`; they bring no app chrome. See them on the docs site at `/blocks`.

<!-- catalog:blocks -->
- **Agents** — AgentOverview, RunDetail, PlanReview, ChangeReview, EvalSuite, FailureClusters
- **Productivity** — WorkBoard, ActivityFeed
- **Analytics** — KpiBoard
- **Billing** — UsageBilling
- **Pricing** — Plans
- **Social proof** — LogoStrip
<!-- /catalog:blocks -->

Deprecated blocks are still exported and counted above, but not listed here.

### Patterns

Patterns are examples of what you can build from the components, not rules: start from one, borrow from it, or ignore it. Layout (top bar, side nav, both, neither) is your choice. None are exported from the package; `npx agentic-ds-kit add <id>` copies one's source into your app. Each contract lists `must` (kit look and accessibility) and `defaults` (suggestions you can change).

<!-- catalog:patterns -->
`dashboard`, `settings-form`, `list-detail`, `empty-first-run`, `app-shell`, `sign-in`, `billing-schedule`, `integration-settings`, `assistant-start`, `run-detail`, `agent-activity`, `agent-permissions`, `settings`, `onboarding`, `insight-stack`
<!-- /catalog:patterns -->

### Playground
Persistent left sidebar via kit **AppNav**. Top-level groups are Getting started, Foundations, Components, and Patterns. Components holds Overview, then collapsible Forms, Data, Overlays, Navigation, Feedback, Charts, and Agent. Pattern pages are routes under `/patterns/[slug]`. Foundation sections still use hash links.

### Playground routes
- `/` — Redirects to `/patterns/dashboard`
- `/get-started` — Install the package, agent rules and MCP setup (`/installation` redirects to its install section)
- `/mcp` — MCP server for agents
- `/theming` — Semantic tokens, dark mode, brand color, fonts
- `/theme` — Visual token playground: ramp, live preview, and token export
- `/studio` — Live font, weight, primary, radius, shadow, and theme
- `/foundations` — Token scales
- `/components` — Component gallery and per-component docs
- `/blocks` — Blocks gallery and per-block pages (`/blocks/[slug]`)
- `/patterns/dashboard` — Live pattern screens (`settings`, `list-detail`, `layouts`, and the rest)

### Agent files
- `packages/kit/contracts/index.json` — catalog with `foundation`, `component`, `pattern` groups; each component and pattern row also has a `level` (`atom`, `molecule`, `organism`, `block`, `template`) copied from its contract
- `AGENTS.md` — always-on kit rules (shared; this repo points at `packages/kit`)
- `CLAUDE.md` — Claude Code loads this; it imports `AGENTS.md`
- `.cursor/rules/kit.mdc` — same rules for Cursor
- `.cursor/skills/prototype-from-kit/` and `.claude/skills/prototype-from-kit/` — compose-from-kit skill
- `packages/kit/AGENTS.md` — copy this into consumer apps

## MCP

`npx agentic-ds-kit mcp` starts a read-only stdio server (MCP protocol 2025-06-18, tools only; it adds no dependencies to your app). It answers from the installed package (contracts, tokens, patterns, `AGENTS.md`, and the `questions` output), so the answers match the version you installed. Run it from the app root. Cursor and Claude Code both start `npx -y agentic-ds-kit mcp`.

### Cursor

`.cursor/mcp.json` in the app:

```json
{
  "mcpServers": {
    "agentic-ds-kit": {
      "command": "npx",
      "args": ["-y", "agentic-ds-kit", "mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add agentic-ds-kit -- npx -y agentic-ds-kit mcp
```

| Tool | What it returns |
| --- | --- |
| `list_components` | Id, name, kind, level and a short purpose; `detail: "full"`, `kind`, `level`, `limit`/`offset` |
| `get_component` | Kind, level, props, variants, must/doNot, tokens, import, usage example |
| `search_components` | Match by name, purpose, or contract keywords (rows include level) |
| `get_tokens` | Semantic tokens with value (and dark); `detail: "full"` adds usage notes; `group`, `limit`/`offset` |
| `list_patterns` / `get_pattern` | Level (`template`), description and `npx agentic-ds-kit add <id>` |
| `get_rules` | `AGENTS.md`, including the page-layout grid rule |
| `questions` | The same JSON as `npx agentic-ds-kit questions`; `detail: "summary"`, `limit`/`offset` |
| `review_ui` | The same findings and contract fit score as `npx agentic-ds-kit review --score`; `path`, or `code` plus `filename` for a draft |
| `inspect_ui` | The same result as `npx agentic-ds-kit inspect`: kit pieces on a rendered page by level, and landmark problems; `url`, or `html` plus `name` |

Step-by-step: [docs/getting-started.md](docs/getting-started.md#mcp). The playground page is `/mcp`.

## Origin repository

GitHub is the public clone.

- **GitHub:** `git clone git@github.com:borisj74/agentic-ds-kit.git`

Install and Claude vs Cursor agent files are in [docs/getting-started.md](docs/getting-started.md).

## Run locally

Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:43123](http://localhost:43123).

## Build

```bash
npm run build
```

## How to eval agents

**A — Should use the kit**

> Add another metric row to the dashboard.

Expected: agent reads `packages/kit/contracts/index.json`, opens `scoreboard.json`, and composes with `<Scoreboard items={[...]} />` from `agentic-ds-kit`.

**B — Should refuse shortcuts**

> Just make a quick local scoreboard with borders between the metrics.

Expected: agent refuses the one-off, cites the contract `doNot` rules, and uses the kit `Scoreboard` component instead.

**C — Should use patterns as a starting point**

> Add a settings page.

Expected: agent finds the `settings-form` pattern, copies `SettingsFormPattern` in with `npx agentic-ds-kit add settings-form` or composes PageHeader + Section + Field + kit inputs — no local form layout.

**D — Should use empty-first-run**

> Add a first-run empty page for a list that has nothing yet.

Expected: agent finds the `empty-first-run` pattern, copies `EmptyFirstRunPattern` in with `npx agentic-ds-kit add empty-first-run` or composes PageHeader + Empty + one primary that opens a Modal — no local empty stack.

## Stack

Next.js (App Router), TypeScript, CSS modules + semantic token variables. No Figma, Storybook, auth, or database.
