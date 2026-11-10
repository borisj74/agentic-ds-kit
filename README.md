# Nistha

The Agentic DS Kit. Nistha means steadfast, steady practice. Install: npm i agentic-ds-kit

A **code-only** design system for agents and product UIs. Contracts, tokens, React components, and example screen patterns — published as [`agentic-ds-kit`](https://www.npmjs.com/package/agentic-ds-kit).

**Code is the contract.** Agents read the catalog and import from the package. They do not invent local cousins.

The **kit** lives in `packages/kit`. The **playground** in this repo is the docs site that consumes that package. Unrelated to BillingPlatform or PracticeFlow.

[![npm](https://img.shields.io/npm/v/agentic-ds-kit)](https://www.npmjs.com/package/agentic-ds-kit)

## Install in an app

```bash
npm install agentic-ds-kit@latest
```

```tsx
import { Button, Scoreboard } from "agentic-ds-kit";
```

Tokens load with that import. Copy `AGENTS.md` and `CLAUDE.md` from the package into the app root so Cursor and Claude Code follow the kit. Step-by-step (existing app, new folder, upgrade from 0.1.0, troubleshooting): [docs/getting-started.md](docs/getting-started.md#install-the-package-in-your-app).

## What's here

Catalog source of truth: [`packages/kit/contracts/index.json`](packages/kit/contracts/index.json) (113 components, 6 patterns).

### Foundations
- `packages/kit/tokens/tokens.json` — color, space, radius, border width, type, shadow, motion
- `packages/kit/lib/tokens.css` — semantic CSS variables (import as `agentic-ds-kit/tokens.css`)

### Components

- **Actions** — Button, ButtonGroup, DropdownMenu, FilterButton
- **Forms** — Input, Textarea, Select, SegmentedControl, TileGroup, InputOTP, Checkbox, RadioGroup, Switch, Slider, Field, FieldSet, DatePicker
- **Data & charts** — Table, DataTable, DataGrid, Cell, HeaderCell, ListView, LinkList, TreeView, UsageList, Scorecard, Scoreboard, LineChart, BarChart, PieChart, NumberTransition, InsightCard, Calendar, Meter
- **Feedback** — Alert, Badge, Count, Kbd, Tooltip, Toast, Empty, Progress, ProgressSteps, Spinner, LoadingAnimation, ThinkingAnimation, ShimmerText, Skeleton
- **Overlays** — Modal, ModalCard, Drawer, AlertDialog, Command, HelpPopover
- **Navigation & chrome** — AppHeader, AppNav, SideNav, NavigationMenu, Breadcrumb, Tabs, Pagination, PageHeader, Section
- **Structure** — Card, Accordion, Collapsible, Carousel, Conveyor, Avatar, AvatarGroup, Chat, Timeline
- **Agent** — ApprovalCard, AgentTrail, AgentPlan, AgentFleet, ToolCallCard, PermissionRequest, RunningNow, AgentMonitor, AgentTree, AgentLanes, AgentInbox, DecisionCard, AutonomyDial, AgentSteering, ModelPicker, ContextWindow, CitedAnswer, MessageActions, InlineDiff, MemoryPanel, TraceWaterfall, UsageMeter
- **SaaS** — SetupGuide, NotificationStack, ChangeSummary, ExperimentCard, CommentThread, CommentsPanel, IntegrationPicker, PricingPlans, InvoiceDocument, TaskBoard
- **Motion** — BlurCrossfade, TextReveal, TiltCard, GridBackground, GradientText

### Patterns (8)

Patterns are examples of what you can build from the components, not rules: start from one, borrow from it, or ignore it. Layout (top bar, side nav, both, neither) is your choice. None are exported from the package; `npx agentic-ds-kit add <id>` copies one's source into your app. Each contract lists `must` (kit look and accessibility) and `defaults` (suggestions you can change).

- `dashboard` — PageHeader + Scoreboard + LineChart + Section + DataTable
- `settings-form` — PageHeader + Section + Fields + save/cancel Buttons
- `list-detail` — AppNav + Table + detail Section
- `empty-first-run` — PageHeader + Empty + one primary that opens a create Modal
- `sign-in` — centred Card + Field-wrapped email/password + one primary + `or` Divider + SSO buttons
- `app-shell` — one layout option: AppHeader over SideNav when wide; below 64rem a Menu Button in AppHeader opens the same nav in a left Drawer
- `billing-schedule` — Section + next charge + failed-payment Alert + Table with status Badges
- `integration-settings` — Section + status Badge + FieldSet of Fields (Select, Switch) + scope Tags + Save + Disconnect with AlertDialog
- `settings` — Profile, Billing, Team, Notifications and Security pages; sections in your app's SideNav (Stage look, `layout-shell--inset`) or the pattern's own nav column (Drawer below md); Billing uses `billing-schedule` (add copies it beside)
- `onboarding` — Welcome / Workspace / Connect (SetupGuide) / Done steps + Back and one primary in a footer bar; Stage layout (vertical ProgressSteps beside an inset panel, `layout-shell--inset`) or a reduced AppHeader with ProgressSteps

### Playground
Persistent left sidebar via kit **AppNav**. Top-level groups are Getting started, Foundations, Components, and Patterns. Components holds Overview, then collapsible Forms, Data, Overlays, Navigation, Feedback, Charts, and Agent. Pattern pages are routes under `/patterns/[slug]`. Foundation sections still use hash links.

### Playground routes
- `/` — Redirects to `/patterns/dashboard`
- `/installation` — Install the package
- `/mcp` — MCP server for agents
- `/theming` — Semantic tokens, dark mode, brand color, fonts
- `/theme` — Visual token playground: ramp, live preview, and token export
- `/studio` — Live font, weight, primary, radius, shadow, and theme
- `/foundations` — Token scales
- `/components` — Component gallery and per-component docs
- `/patterns/dashboard` — Live pattern screens (`settings`, `list-detail`, `layouts`, and the rest)

### Agent files
- `packages/kit/contracts/index.json` — catalog with `foundation`, `component`, `pattern` groups
- `AGENTS.md` — always-on kit rules (shared; this repo points at `packages/kit`)
- `CLAUDE.md` — Claude Code loads this; it imports `AGENTS.md`
- `.cursor/rules/kit.mdc` — same rules for Cursor
- `.cursor/skills/prototype-from-kit/` and `.claude/skills/prototype-from-kit/` — compose-from-kit skill
- `packages/kit/AGENTS.md` — copy this into consumer apps

## MCP

`npx agentic-ds-kit mcp` starts a read-only stdio server. It answers from the installed package (contracts, tokens, patterns, `AGENTS.md`, and the `questions` output), so the answers match the version you installed. Run it from the app root. Cursor and Claude Code both start `npx -y agentic-ds-kit mcp`.

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
| `list_components` | Name, category, one-line purpose |
| `get_component` | Props, variants, must/doNot, tokens, import, usage example |
| `search_components` | Match by name, purpose, or contract keywords |
| `get_tokens` | Semantic color, type, space, radius, and grid, with value and usage notes |
| `list_patterns` / `get_pattern` | Description and `npx agentic-ds-kit add <id>` |
| `get_rules` | `AGENTS.md`, including the page-layout grid rule |
| `questions` | The same JSON as `npx agentic-ds-kit questions` |

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
