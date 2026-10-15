# agentic-ds-kit

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

The package exports components only. Patterns (app-shell, sign-in, activity, assistant-workspace, dashboard, empty-first-run, inbox, invite-members, list-detail, settings-form) are examples of what you can build: start from one, borrow from it, or ignore it. Layout is your choice. Copy one into your app and own it:

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

## Tokens

`lib/tokens.css` is generated from `tokens/tokens.json`:

```bash
npm run generate:tokens -w agentic-ds-kit
```

Components consume **semantic** variables (`--surface-page`, `--action-primary`, `--radius-control-md`). Primitive `--color-*` ramps are the source scale only.

## Theming

Override semantic tokens in your CSS after tokens load. Do not rewrite component classes.

- Light is `:root`. Dark is `[data-theme="dark"]` on `html` (not a `.dark` class).
- Brand overlays: omit `data-color` for ink, or set `data-color="blue"` / `data-color="violet"` / `data-color="teal"`.
- For another hue, reassign brand, action, and focus roles to primitive ramps — not hex in React.
