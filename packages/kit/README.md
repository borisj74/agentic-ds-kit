# agentic-ds-kit

React components, JSON contracts, and tokens for agent-built UI. This is the **installable kit**, not the docs playground.

## Install

```bash
npm install agentic-ds-kit
```

Peer: React 19. Your bundler must compile this package (it ships TypeScript and CSS modules). Next.js:

```ts
const nextConfig = {
  transpilePackages: ["agentic-ds-kit"],
};
```

## Use

```tsx
import "agentic-ds-kit/tokens.css";
import { Button, Scoreboard } from "agentic-ds-kit";
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
