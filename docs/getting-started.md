# Getting started

The **kit** is the npm package `agentic-ds-kit`. The Next app in this GitHub repo is a **playground** (docs site) that consumes the package. You do not publish the playground.

| You want to | Do this |
| --- | --- |
| Put kit components in your product | [Install the package](#install-the-package-in-your-app) |
| Theme colors or dark mode | [Theme the kit](#theme-the-kit) |
| Browse the catalog locally | [Run the playground](#run-the-playground) |
| Extend the catalog (new Button-level piece or pattern) | Clone this repo, then [Add a component](#add-a-component) / [Add a pattern](#add-a-pattern) |

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- A Next.js app on **React 19** (the kit’s peer). Vite/other bundlers can work; the steps below are for Next.js App Router.

Optional: [Cursor](https://cursor.com) or Claude Code so agent rules load from files instead of chat paste.

Confirm the registry version (use **0.2.1 or later** — 0.2.0 ships CSS that Next re-scopes and kit UI looks unstyled):

```bash
npm view agentic-ds-kit version
```

## Install the package in your app

This is the normal path. You do **not** clone this repo. You do **not** need `transpilePackages`. You do **not** recreate the Next app if you already have one.

### Existing Next.js app

From the app root (the folder that already has `package.json` and `app/` or `src/app/`):

**1. Install**

```bash
npm install agentic-ds-kit
```

That pulls React peers only if they are missing. You should already have `react` and `react-dom` 19 from Next.

**2. Smoke test**

In any client or server page that can render a client child:

```tsx
import { Button } from "agentic-ds-kit";

export default function Page() {
  return <Button variant="primary">Save</Button>;
}
```

Run `npm run dev` and confirm the button is the kit primary (filled, kit radius/type) — not a raw browser `<button>`.

Importing from `agentic-ds-kit` loads semantic tokens (`--text-primary`, `--space-4`, …) and pattern layout roles (`layout-canvas`, `layout-header`, `layout-content`). You do **not** add `transpilePackages: ["agentic-ds-kit"]` in `next.config`. That was required for 0.1.0 only.

**3. Use components and patterns**

```tsx
import { Button, Scoreboard, ActivityPattern } from "agentic-ds-kit";
```

Agents (and you) should read `node_modules/agentic-ds-kit/contracts/index.json`, then the matching contract JSON, then import that piece. Do not invent a local cousin.

**4. Tokens in your own CSS**

If `layout.tsx` or a global stylesheet uses kit variables (`var(--surface-card)`, `var(--font-sans)`, …) **before** any kit component is imported, add this once in the root layout or `globals.css`:

```tsx
import "agentic-ds-kit/tokens.css";
```

```css
@import "agentic-ds-kit/tokens.css";
```

If every screen already imports a kit component, you can skip this. Importing tokens twice is harmless.

If your own markup uses kit layout classes (`layout-canvas`, `layout-header`, `layout-content`, …) before any kit component is imported, also add `agentic-ds-kit/layout.css` the same way. A kit import already loads it.

**5. `AppNav`**

`AppNav` uses `next/link`. Next.js is an **optional** peer. Other kit pieces do not need Next. If you import `AppNav` outside Next, routing will not resolve.

**6. Agent files (so Cursor / Claude Code follow the kit)**

The UI works without these. Agents will not, unless you copy them.

From the app root:

```bash
cp node_modules/agentic-ds-kit/AGENTS.md ./AGENTS.md
cp node_modules/agentic-ds-kit/CLAUDE.md ./CLAUDE.md
mkdir -p .cursor/skills/prototype-from-kit .claude/skills/prototype-from-kit
cp node_modules/agentic-ds-kit/skills/prototype-from-kit/SKILL.md .cursor/skills/prototype-from-kit/
cp node_modules/agentic-ds-kit/skills/prototype-from-kit/SKILL.md .claude/skills/prototype-from-kit/
```

Cursor also needs a short always-on rule. Add `.cursor/rules/kit.mdc` with the same six lines as `AGENTS.md` (or copy `AGENTS.md` contents into that file). Claude Code already loads `CLAUDE.md`, which is `@AGENTS.md`.

Confirm Claude: `/context` should list `AGENTS.md` / `CLAUDE.md`. The skill should show as `/prototype-from-kit`.

Do not paste the kit rules into chat every session.

### Brand-new folder (no app yet)

Do not `npm init` and stop there — the kit is not an app.

```bash
mkdir my-app
cd my-app
npx create-next-app@latest . --yes
npm install agentic-ds-kit
```

Then follow **Smoke test** through **Agent files** above. `create-next-app` installs React 19.

If the folder is not empty, `create-next-app` may refuse `.` — create the Next app in a new directory and install the kit there.

### Upgrade from 0.1.0

0.1.0 shipped TypeScript and CSS modules. 0.2.x ships compiled JS and CSS.

```bash
npm install agentic-ds-kit@latest
```

Then:

1. Remove `transpilePackages: ["agentic-ds-kit"]` from `next.config` (leaving it in is unnecessary, not fatal).
2. You can remove a standalone `import "agentic-ds-kit/tokens.css"` if a kit import is already on the tree.
3. Re-copy `AGENTS.md` / `CLAUDE.md` / the skill from `node_modules/agentic-ds-kit/` if those files changed.

**Do not install 0.2.0.** That release still used `*.module.css` filenames; Next hashed classes twice and kit UI rendered as unstyled HTML. Use **0.2.1 or later**.

```bash
npm view agentic-ds-kit version
# expect 0.2.7 or higher
```

### Get later kit versions

npm does **not** push updates into an already-installed app. The app’s lockfile pins the version from the last install.

To pick up a newly published kit:

```bash
npm install agentic-ds-kit@latest
```

If `package.json` already has `"agentic-ds-kit": "^0.2.7"` (or another `^0.2.x` range), `npm update agentic-ds-kit` also works. Re-copy `AGENTS.md` / `CLAUDE.md` / the skill from `node_modules` if those files changed.

There is no auto-update. Dependabot or Renovate can open a PR when a new version ships; that is the usual way to stay current without remembering.

### Install checklist

- [ ] `npm install agentic-ds-kit` in the Next app (not in `$HOME`)
- [ ] React 19 already in the app
- [ ] No `transpilePackages` for this package (0.2.1+)
- [ ] `import { Button } from "agentic-ds-kit"` looks like a kit button, not a default browser button
- [ ] Optional: `import "agentic-ds-kit/tokens.css"` if your CSS uses kit variables with no kit component imported
- [ ] Optional: `import "agentic-ds-kit/layout.css"` if your markup uses `layout-canvas` (and related) with no kit component imported
- [ ] Optional: copy `AGENTS.md`, `CLAUDE.md`, and the prototype skill for agents

### If something looks wrong

| What you see | Likely cause |
| --- | --- |
| Pattern looks like unstyled stacked divs | Layout CSS not loading. Import from `agentic-ds-kit` (or `agentic-ds-kit/layout.css`) and hard-refresh |
| `Module not found: agentic-ds-kit` | Install was run in the wrong directory (not the Next app root) |
| `ENEEDAUTH` / not logged in | Only needed to **publish** the kit, not to install it |
| `No workspaces found: --workspace=agentic-ds-kit` | That flag is for **this** monorepo. In your app use `npm install agentic-ds-kit` |
| `npm audit fix` prompt | Ignore unless `npm audit` lists a real issue. It is not caused by the kit |
| Peer React 19 warning | The app is on React 18. Use Next 15/16 with React 19, or wait — the kit does not support 18 |
| `AppNav` / `next/link` error | You imported `AppNav` in a non-Next bundler. Use another nav or run inside Next |

## Theme the kit

The kit uses **semantic CSS variables**. Components read roles such as `--surface-page` and `--action-primary`. Override those roles in your CSS. Do not rewrite component classes. Do not use primitive `--color-*` ramps in React.

Light values live on `:root`. Dark values live on `[data-theme="dark"]` on `html` — not a `.dark` class.

```html
<html lang="en" data-theme="dark">
```

```css
html {
  color-scheme: light;
}

html[data-theme="dark"] {
  color-scheme: dark;
}
```

Brand overlays: omit `data-color` for ink, or set `blue` / `violet` / `teal`.

```html
<html lang="en" data-color="violet">
```

For another hue, reassign brand, action, and focus roles to primitive ramps after tokens load:

```css
:root {
  --action-primary: var(--color-violet-600);
  --action-primary-hover: var(--color-violet-700);
  --brand-primary: var(--color-violet-600);
  --focus-ring: var(--color-violet-500);
}
```

Do not put hex in components. If a semantic role is missing from the kit, stop and ask — do not add a one-off. The playground page is `/theming`. Foundations is the visual scale.

## Run the playground

Clone the catalog if you want to click every component and pattern. This is not required to use the npm package.

```bash
git clone git@github.com:borisj74/agentic-ds-kit.git
cd agentic-ds-kit
npm install
npm run dev
```

`npm run dev` builds the kit, then starts Next. Wait until the server is up, then open [http://127.0.0.1:43123](http://127.0.0.1:43123) (prefer `127.0.0.1` over `localhost` on machines that resolve `localhost` to IPv6).

| Route | What you get |
| --- | --- |
| `/` | Redirects to Patterns |
| `/patterns` | Live pattern screens (Dashboard, Activity, Inbox, …) |
| `/installation` | Install the package |
| `/foundations` | Token scales |
| `/components` | Gallery and per-component docs |

```bash
npm run build    # kit dist + playground production build
npm run lint
```

After editing `packages/kit/tokens/tokens.json`:

```bash
npm run generate:tokens
```

This repo is an npm workspace. The published package lives in `packages/kit`. The playground is not published.

## Cursor vs Claude Code

Same kit law, different filenames. In **this** repo they are git-tracked. In **your** app you copy them from the package (see [Agent files](#6-agent-files-so-cursor--claude-code-follow-the-kit)).

| Job | Cursor | Claude Code |
| --- | --- | --- |
| Always-on rules | `.cursor/rules/kit.mdc` | `CLAUDE.md` (imports `AGENTS.md`) |
| Compose a screen | `.cursor/skills/prototype-from-kit/` | `.claude/skills/prototype-from-kit/` |
| Catalog | `packages/kit/contracts/` + `packages/kit/ui/` in this repo, or `node_modules/agentic-ds-kit/contracts/` in an app | same files |

Claude Code reads `CLAUDE.md`, not `AGENTS.md`, unless `CLAUDE.md` imports it. This repo does: the first line of `CLAUDE.md` is `@AGENTS.md`. The Next.js block under it is generated by `next dev` — leave it.

claude.ai chat will not load these files unless the person is in a Claude Code / Cowork session on the project.

## Point an agent at the kit

Do not paste the rules into chat every session.

**In this repo:** keep `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/kit.mdc`, and both skill copies.

**In a product app:** copy those files from `node_modules/agentic-ds-kit/` as in step 6 above. Point contracts at `node_modules/agentic-ds-kit/contracts/index.json`.

The rule is short on purpose:

1. Read `contracts/index.json`, then only the matching contract file(s).
2. If a contract exists, import the kit component from `agentic-ds-kit`. Never invent a local cousin.
3. If a pattern in `contracts/patterns/` matches the screen, import it from `agentic-ds-kit`.
4. If something is missing from the index, stop and ask — do not add a one-off.
5. Semantic tokens only. No hex in components. No primitive `--color-*` ramps in component CSS.
6. One `variant="primary"` Button per view.

**Eval prompts** (also in the README) are the smoke test that a coworker’s agent is actually using the kit.

## How the catalog works

Three groups in `contracts/index.json`:

| `group` | Meaning | Example |
| --- | --- | --- |
| `foundation` | Tokens | `packages/kit/tokens/tokens.json` |
| `component` | One UI piece and its props | `packages/kit/contracts/carousel.json` → `packages/kit/ui/Carousel/` |
| `pattern` | A screen that only composes components | `packages/kit/contracts/patterns/activity.json` → `packages/kit/ui/patterns/ActivityPattern/` |

A **component** contract has `props`, `doNot`, tokens, a11y. A **pattern** contract has `contains` (which components) and `doNot` (what not to invent). Patterns are contracts. They are not a field inside Button.

If the index has no match, the agent must ask. That is the product, not a gap in the docs.

## Add a component

Only when nothing in the index covers the UI. Do this in **this** repo, then publish a new kit version.

1. Add an entry to `packages/kit/contracts/index.json` (`group`: `component`).
2. Add `packages/kit/contracts/{id}.json` with intent, props, tokens, a11y, `doNot`, snippet.
3. Implement `packages/kit/ui/{Name}/` using semantic tokens only. Named exports. No local cousins.
4. Re-export from `packages/kit/src/index.ts` if the barrel does not pick it up.
5. Add playground docs under `app/components/` and a nav link if the gallery expects one.
6. Run the playground and click the new piece end to end.

Stop if you were about to add a one-off in `app/` instead of a contract.

## Add a pattern

Only when the screen is a repeated composition of existing components.

1. Add an entry to `packages/kit/contracts/index.json` (`group`: `pattern`).
2. Add `packages/kit/contracts/patterns/{id}.json` with `contains` and `doNot`.
3. Implement `packages/kit/ui/patterns/{Name}Pattern/` from kit components only.
4. Re-export from `packages/kit/src/index.ts`.
5. Wire playground nav (`lib/playground-nav.ts`) and Agentix (`app/_components/DashboardDemo.tsx`) if it is a product screen.
6. Mention it in `packages/kit/skills/prototype-from-kit/SKILL.md` (and the Cursor/Claude copies).

## GitHub and remotes

Public clone: [https://github.com/borisj74/agentic-ds-kit](https://github.com/borisj74/agentic-ds-kit)

```bash
git clone git@github.com:borisj74/agentic-ds-kit.git
cd agentic-ds-kit
npm install
npm run dev
```

Coworkers do not need Cursor Origin. Cursor users and Claude Code users both get the agent files from git.

This workspace keeps **origin** on Cursor Origin as a private mirror. GitHub is the **github** remote.

Optional: deploy the playground (Vercel) so non-git people can browse.

Publish a new kit version (maintainers). Run this from the **repo root** (the Cursor terminal in this project is already there):

```bash
npm run publish:kit
```

If npm asks for 2FA:

```bash
npm run publish:kit -- --otp=123456
```

You must be logged in (`npm login`). Bump `packages/kit/package.json` `version` first. Do not republish a version that already exists.
