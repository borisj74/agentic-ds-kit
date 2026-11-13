# Nistha

**Docs: [https://agentic-ds-kit.vercel.app](https://agentic-ds-kit.vercel.app)**

The Agentic DS Kit. Nistha means steadfast, steady practice. Install: npm i agentic-ds-kit

React components, JSON contracts, and tokens for agent-built UI. This is the **installable kit**, not the docs playground.

## Install

```bash
npm install agentic-ds-kit@latest
```

Peer: React 19. `AppNav` uses `next/link`; Next.js is an optional peer if you use that component.

## Use

```tsx
import { Button, Scoreboard } from "agentic-ds-kit";
```

Importing from the package loads semantic tokens. If your own CSS uses those variables before any kit component is imported, also add:

```tsx
import "agentic-ds-kit/tokens.css";
```

The package exports 140 components, including 12 **blocks**: larger compositions for a whole area of a screen (AgentOverview, RunDetail, LiveSession, PlanReview, ChangeReview, KpiBoard, UsageBilling, AppDirectory, WorkBoard, ActivityFeed, Plans, LogoStrip). Import a block like any component and put it inside your page's `<main>`. Browse them on the docs site at `/blocks`.

The package exports components only. Patterns (app-shell, sign-in, dashboard, empty-first-run, list-detail, settings-form, billing-schedule, integration-settings, settings, onboarding) are examples of what you can build: start from one, borrow from it, or ignore it. Layout is your choice. Copy one into your app and own it:

```bash
npx agentic-ds-kit add --list
npx agentic-ds-kit add dashboard
```

```tsx
import { DashboardPattern } from "@/components/patterns/dashboard";
```

The copy imports kit components from `agentic-ds-kit`, keeps its demo data in a `*-data.ts` file for you to replace, and ships its contract JSON beside it: follow its `must` lines (kit look and accessibility); its `defaults` are suggestions.

Contracts live in the package: `agentic-ds-kit/contracts/index.json`. Copy `AGENTS.md` (and `CLAUDE.md`) from this package into your app so Cursor and Claude Code follow the kit.

If your app lets a decision model or LLM pick which kit view to render, `npx agentic-ds-kit questions` builds the option list (labels, descriptions, enum props) from the contracts. No network, no model calls: [docs/questions.md](https://github.com/borisj74/agentic-ds-kit/blob/main/docs/questions.md).

## MCP

`npx agentic-ds-kit mcp` starts a read-only stdio server. Agents can list components, read a contract, search, look up semantic tokens, list patterns, and read the kit rules from this install. Cursor and Claude Code both run `npx -y agentic-ds-kit mcp`.

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
