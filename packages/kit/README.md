# Nistha

**Docs: [https://agentic-ds-kit.vercel.app](https://agentic-ds-kit.vercel.app)**

Nistha — a code-only design system for coding agents and product UI. Nistha means steadfast, steady practice. Install: npm i agentic-ds-kit

React components, JSON contracts, and tokens for agent-built UI. This is the **installable kit**, not the docs playground.

## Install

```bash
npm install agentic-ds-kit@latest
```

Peer: React 19. `AppNav` uses `next/link`; Next.js 15 or later is an optional peer if you use that component (Next 14 does not support React 19).

New app from a working screen (a Next app with a pattern, the agent rules and the MCP config; nothing is installed until you run `npm install`): `npx agentic-ds-kit init my-app --template dashboard`. For product managers and designers: [Start here](https://agentic-ds-kit.vercel.app/start-here).

Check a screen against the contracts: `npx agentic-ds-kit review app` says what to fix (hardcoded values, wrong use of kit parts, other UI libraries) and exits 1 on errors. Add `--score` for a 0–100 contract fit score (the share of UI elements from the kit, minus penalties for errors and warnings); `templates/github/contract-fit.yml` posts it on pull requests.

Check the running page: start the app with `NEXT_PUBLIC_NISTHA_INSPECT=1` (kit components then write `data-nistha="<id>"`, never in production builds) and `npx agentic-ds-kit inspect http://localhost:3000` lists the kit pieces on the page by level and flags a missing `<main>` or `<h1>`.

The package is **ESM-only**: use `import`, not `require()`. Next.js, Vite and other modern bundlers handle this out of the box; a CommonJS-only setup (for example an old Jest config) needs ESM support turned on.

## Use

```tsx
import { Button, Scoreboard } from "agentic-ds-kit";
```

Importing from the package loads semantic tokens. If your own CSS uses those variables before any kit component is imported, also add:

```tsx
import "agentic-ds-kit/tokens.css";
```

The package exports 141 components, including 12 **blocks**: larger compositions for a whole area of a screen (AgentOverview, RunDetail, LiveSession, PlanReview, ChangeReview, KpiBoard, UsageBilling, AppDirectory, WorkBoard, ActivityFeed, Plans, LogoStrip). Import a block like any component and put it inside your page's `<main>`. Browse them on the docs site at `/blocks`.

The package exports components only. Patterns (app-shell, sign-in, dashboard, empty-first-run, list-detail, settings-form, billing-schedule, integration-settings, settings, onboarding) are examples of what you can build: start from one, borrow from it, or ignore it. Layout is your choice. Copy one into your app and own it:

```bash
npx agentic-ds-kit add --list
npx agentic-ds-kit add dashboard
```

```tsx
import { DashboardPattern } from "@/components/patterns/dashboard";
```

The copy imports kit components from `agentic-ds-kit`, keeps its demo data in a `*-data.ts` file for you to replace, and ships its contract JSON beside it: follow its `must` lines (kit look and accessibility); its `defaults` are suggestions.

Contracts live in the package: `agentic-ds-kit/contracts/index.json`. Each contract has a `level` (`atom`, `molecule`, `organism`, `block`, or `template` for patterns) that says where it sits; reuse the biggest piece that fits. Copy `AGENTS.md` (and `CLAUDE.md`) from this package into your app so Cursor and Claude Code follow the kit.

If your app lets a decision model or LLM pick which kit view to render, `npx agentic-ds-kit questions` builds the option list (labels, descriptions, enum props) from the contracts. No network, no model calls: [docs/questions.md](https://github.com/borisj74/agentic-ds-kit/blob/main/docs/questions.md).

## Icons

Icon props (`iconStart`, `icon`, …) take a Lucide name, a Lucide component or an element. About 120 common names (Plus, Search, ChevronDown, Settings, …) are bundled and render instantly. For any other Lucide name, either pass the component:

```tsx
import { Telescope } from "lucide-react";
<Button iconStart={Telescope}>Explore</Button>
```

or opt in once to load any name on demand (each icon becomes its own small chunk):

```tsx
// in a client module every page loads, e.g. app/providers.tsx
import "agentic-ds-kit/icons-on-demand";
```

Without the opt-in, a name outside the bundled set renders nothing and logs a warning in development.

## MCP

`npx agentic-ds-kit mcp` starts a read-only stdio server (MCP protocol 2025-06-18, tools only, no extra dependencies). Agents can list components (filter by `kind` or `level`), read a contract, search, look up semantic tokens, list patterns, read the kit rules, review UI code (`review_ui`), and list the kit pieces on a rendered page (`inspect_ui`) from this install. Component, block and pattern answers include `level`. Cursor and Claude Code both run `npx -y agentic-ds-kit mcp`.

Cursor, `.cursor/mcp.json`:

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

Claude Code, from the app root:

```bash
claude mcp add agentic-ds-kit -- npx -y agentic-ds-kit mcp
```

Setup and the tool list: [docs/getting-started.md](https://github.com/borisj74/agentic-ds-kit/blob/main/docs/getting-started.md#mcp).

## Tokens

`lib/tokens.css` is generated from `tokens/tokens.json`:

```bash
npm run generate:tokens -w agentic-ds-kit
```

Components consume **semantic** variables (`--bg-canvas`, `--primary-base`, `--radius-control-md`). Primitive `--color-*` ramps are the source scale only. Older names such as `--surface-page` and `--action-primary` still work as aliases of `--bg-canvas` and `--primary-base`; use the current names in new code.

`agentic-ds-kit/color-ramp` exports `generateColorRamp(hex)`: an OKLCH ramp with steps 50–950. Step 500 stays within ΔE 3 of the input, and lightness falls from 50 to 950.

## Theming

Override semantic tokens in your CSS after tokens load. Do not rewrite component classes.

- Light is `:root`. Dark is `[data-theme="dark"]` on `html` (not a `.dark` class).
- Brand overlays: omit `data-color` for the default Nistha look (Electric Blue on Slate). Set `data-color="ink"` for the black primary on neutral greys, or `data-color="blue"` / `data-color="violet"` / `data-color="teal"`.
- For another hue, reassign brand, action, and focus roles to primitive ramps — not hex in React.
