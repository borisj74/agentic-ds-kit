# Kit Sandbox

Personal experiment (Florence-style, code-only) for Boris Jovanovic — not BillingPlatform, not PracticeFlow.

A tiny Next.js playground that proves JSON component contracts + a short always-on rule + one skill help agents prototype faster without inventing local components.

## What's here

- `tokens/tokens.json` — primitives and semantic roles
- `contracts/` — component contracts and `index.json` catalog
- `ui/` — kit implementations (`Button`, `Scorecard`, `Scoreboard`)
- `app/` — playground dashboard
- `CLAUDE.md` / `.cursor/rules/kit.mdc` — always-on agent rules
- `.cursor/skills/prototype-from-kit/` — skill for composing screens from the kit

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Stack

Next.js (App Router), TypeScript, CSS modules + semantic token variables. No Figma, Storybook, auth, or database.
