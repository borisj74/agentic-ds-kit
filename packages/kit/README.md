# agentic-ds-kit

React components, JSON contracts, and tokens for agent-built UI. This is the **installable kit**, not the docs playground.

## Install

```bash
npm install agentic-ds-kit
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

```tsx
import { ActivityPattern } from "agentic-ds-kit";
```

Contracts live in the package: `agentic-ds-kit/contracts/index.json`. Copy `AGENTS.md` (and `CLAUDE.md`) from this package into your app so Cursor and Claude Code follow the kit.

## Tokens

`lib/tokens.css` is generated from `tokens/tokens.json`:

```bash
npm run generate:tokens -w agentic-ds-kit
```

Components consume **semantic** variables (`--surface-page`, `--action-primary`, `--radius-control-md`). Primitive `--color-*` ramps are the source scale only.

## Theming

Override semantic tokens in your CSS after tokens load. Do not rewrite component classes.

- Light is `:root`. Dark is `[data-theme="dark"]` on `html` (not a `.dark` class).
- Brand overlays: omit `data-color` for blue, or set `data-color="violet"` / `data-color="teal"`.
- For another hue, reassign brand, action, and focus roles to primitive ramps — not hex in React.
