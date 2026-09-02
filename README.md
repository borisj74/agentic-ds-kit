# Agentic DS Kit

Personal experiment (code-only) for Boris Jovanovic — not BillingPlatform, not PracticeFlow.

The **kit** is the npm package `agentic-ds-kit` (`packages/kit`): contracts, tokens, React components, patterns. The **playground** in this repo is the docs site that consumes that package.

## Install in an app

```bash
npm install agentic-ds-kit
```

```tsx
import { Button, Scoreboard } from "agentic-ds-kit";
```

Tokens load with that import. Copy `AGENTS.md` and `CLAUDE.md` from the package into the app root so Cursor and Claude Code follow the kit. Step-by-step (existing app, new folder, upgrade from 0.1.0, troubleshooting): [docs/getting-started.md](docs/getting-started.md#install-the-package-in-your-app).

## What's here

### Foundations
- `packages/kit/tokens/tokens.json` — color, space, radius, border width, type, shadow, motion
- `packages/kit/lib/tokens.css` — semantic CSS variables (import as `agentic-ds-kit/tokens.css`)

### Components (17)
| Component | Purpose |
|-----------|---------|
| Button | Actions — `primary`, `secondary`, `tertiary`, `danger` |
| Scorecard | Single KPI tile |
| Scoreboard | Horizontal row of Scorecards |
| Input, Textarea, Select | Form controls |
| InputOTP | One-time code / PIN as separate slots. Paste and autocomplete work |
| Checkbox, RadioGroup | Boolean and single-choice inputs |
| Switch | Immediate on/off setting — pill track, not Checkbox |
| Field | Label + control + hint/error wrapper |
| Badge | Status/category pill |
| Tooltip | Hover/focus supplementary text |
| Tabs | In-page panel switching |
| Modal | Dismissible overlay for short tasks. Composes ModalCard |
| ModalCard | Panel chrome for a modal (title, body, footer) |
| Drawer | Edge panel for secondary tasks |
| PageHeader | Page title block |
| Section | Grouped content block |
| AppNav | Sidebar navigation — flat `items` or grouped `groups` catalog |
| Table | Simple semantic table |

### Patterns (8)
- `dashboard` — PageHeader + Scoreboard + Section + Table + Buttons
- `settings-form` — PageHeader + Section + Fields + save/cancel Buttons
- `list-detail` — AppNav + Table + detail Section
- `invite-members` — Empty + AvatarGroup + Modal + FieldSet + invite actions
- `assistant-workspace` — PageHeader + InsightCards + Chat rail in `layout-workspace`
- `empty-first-run` — PageHeader + Empty + one primary that opens a create Modal
- `activity` — PageHeader + Scoreboard + task cards or list + tabbed DataTable feed
- `inbox` — PageHeader + Scoreboard + tabbed Table + detail Section + reply Drawer

### Playground
Persistent left sidebar via kit **AppNav** (grouped: Getting started, Foundations, Components, Patterns). Hash links scroll to sections on each page. Dashboard lives under Patterns.

### Playground routes
- `/` — Getting started (introduction)
- `/installation` — Install the package
- `/theming` — Semantic tokens, dark mode, brand color
- `/foundations` — Token scales
- `/components` — Component gallery (`#gallery`) and per-component docs
- `/patterns` — Pattern blueprints (`#dashboard`)

### Agent files
- `packages/kit/contracts/index.json` — catalog with `foundation`, `component`, `pattern` groups
- `AGENTS.md` — always-on kit rules (shared; this repo points at `packages/kit`)
- `CLAUDE.md` — Claude Code loads this; it imports `AGENTS.md`
- `.cursor/rules/kit.mdc` — same rules for Cursor
- `.cursor/skills/prototype-from-kit/` and `.claude/skills/prototype-from-kit/` — compose-from-kit skill
- `packages/kit/AGENTS.md` — copy this into consumer apps

## Origin repository

Clone from **GitHub**. Cursor Origin stays as a private mirror; people without Origin should not need it.

- **GitHub (public):** `git clone git@github.com:borisj74/agentic-ds-kit.git`
- **Cursor origin (private mirror):** `git clone https://origin.cursor.com/bojo74/agentic-ds-kit.git`

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

**C — Should use patterns**

> Add a settings page.

Expected: agent finds the `settings-form` pattern, uses `SettingsFormPattern` or composes PageHeader + Section + Field + kit inputs — no local form layout.

**D — Should use invite-members**

> Add an invite members screen.

Expected: agent finds the `invite-members` pattern, uses `InviteMembersPattern` or composes Empty + AvatarGroup + Modal + FieldSet — no local dialog.

**E — Should use assistant-workspace**

> Add an insights screen with an assistant on the side.

Expected: agent finds the `assistant-workspace` pattern, uses `AssistantWorkspacePattern` or composes `layout-workspace` + InsightCard + Chat — no local rail or Modal chat.

**F — Should use empty-first-run**

> Add a first-run empty page for a list that has nothing yet.

Expected: agent finds the `empty-first-run` pattern, uses `EmptyFirstRunPattern` or composes PageHeader + Empty + one primary that opens a Modal — no local empty stack.

**G — Should use activity**

> Add an activity page with a feed of what the team shipped and commented on.

Expected: agent finds the `activity` pattern, uses `ActivityPattern` or composes PageHeader + Scoreboard + InsightCard/Table tasks + tabbed DataTable — no local feed or calendar.

**H — Should use inbox**

> Add an inbox for replies, mentions, and requests.

Expected: agent finds the `inbox` pattern, uses `InboxPattern` or composes PageHeader + Scoreboard + Table + detail Section + reply Drawer — no local from stack or reply dialog.

## Stack

Next.js (App Router), TypeScript, CSS modules + semantic token variables. No Figma, Storybook, auth, or database.
