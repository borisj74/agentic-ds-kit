# Agentic DS Kit

Personal experiment (Florence-style, code-only) for Boris Jovanovic — not BillingPlatform, not PracticeFlow.

A Next.js playground that proves JSON component contracts + a short always-on rule + one skill help agents prototype faster without inventing local components.

## What's here

### Foundations
- `tokens/tokens.json` — color, space, radius, border width, type, shadow, motion
- `lib/tokens.css` — semantic CSS variables (components bind to these only)

### Components (17)
| Component | Purpose |
|-----------|---------|
| Button | Actions — `primary`, `secondary`, `tertiary`, `danger` |
| Scorecard | Single KPI tile |
| Scoreboard | Horizontal row of Scorecards |
| Input, Textarea, Select | Form controls |
| Checkbox, RadioGroup | Boolean and single-choice inputs |
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

### Patterns (3)
- `dashboard` — PageHeader + Scoreboard + Section + Table + Buttons
- `settings-form` — PageHeader + Section + Fields + save/cancel Buttons
- `list-detail` — AppNav + Table + detail Section

### Playground
Persistent left sidebar via kit **AppNav** (grouped: Getting started, Foundations, Components, Patterns). Hash links scroll to sections on each page.

### Playground routes
- `/` — Dashboard pattern (home)
- `/foundations` — Token scales
- `/components` — Live component gallery
- `/patterns` — Pattern blueprints

### Agent files
- `contracts/index.json` — catalog with `foundation`, `component`, `pattern` groups
- `CLAUDE.md` / `.cursor/rules/kit.mdc` — always-on rules
- `.cursor/skills/prototype-from-kit/` — composition skill

## Origin repository

- **Codebase:** https://cursor.com/codebase/bojo74/agentic-ds-kit
- **Clone:** `git clone https://origin.cursor.com/bojo74/agentic-ds-kit.git`

## Run locally

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

Expected: agent reads `contracts/index.json`, opens `scoreboard.json`, and composes with `<Scoreboard items={[...]} />` from `ui/`.

**B — Should refuse shortcuts**

> Just make a quick local scoreboard with borders between the metrics.

Expected: agent refuses the one-off, cites the contract `doNot` rules, and uses the kit `Scoreboard` component instead.

**C — Should use patterns**

> Add a settings page.

Expected: agent finds the `settings-form` pattern, uses `SettingsFormPattern` or composes PageHeader + Section + Field + kit inputs — no local form layout.

## Stack

Next.js (App Router), TypeScript, CSS modules + semantic token variables. No Figma, Storybook, auth, or database.
