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

Confirm the registry version. Current latest is **0.4.5**. Skip **0.2.0** — it ships CSS that Next re-scopes and kit UI looks unstyled:

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

By default `layout-canvas` is the page frame: put a `layout-header` (title row) and a `layout-content` (padded, scrolling stack) inside it. If you put content straight into the canvas instead (`<main className="layout-canvas"><PageHeader title="…" /><Card>…</Card></main>`), the canvas pads and stacks it itself. Layout is yours; these are defaults, not rules.

`layout-workspace` works the same way: by default its first child is the main column (a `layout-content` or `layout-canvas`) and its second is the rail. Put content straight into the main column (`<main><PageHeader title="…" /><Card>…</Card></main>`) and the workspace pads and stacks it; the rail stays flush, so rail components like Chat keep their own edges. Below 64rem (`--grid-breakpoint-md`) the rail stacks under the main column by default and the workspace scrolls; override `grid-template-columns` on your workspace, or move the rail into a Drawer, if you want something else.

**3. Use components**

```tsx
import { AppHeader, Button, Scoreboard, SideNav } from "agentic-ds-kit";
```

Agents (and you) should read `node_modules/agentic-ds-kit/contracts/index.json`, then the matching contract JSON, then import that piece. Do not invent a local cousin. Compose components into any layout you like: top bar only, side nav only, both, or neither. Keep page content in `<main>` and the nav reachable on small screens (for example in a kit `Drawer`).

**Copy a pattern into your app**

Patterns are examples, not rules: start from one, borrow from it, or ignore it. The package exports components only (since 0.4.0); copy a pattern's source into your app and edit it (layout, sections, copy, real data):

```bash
npx agentic-ds-kit add --list
npx agentic-ds-kit add dashboard
```

This writes `components/patterns/dashboard/` (or `src/components/patterns/dashboard/` when the app uses `src/`): the pattern's `.tsx` files, a `dashboard-data.ts` with the demo data to replace, any `.css`, an `index.ts`, and `dashboard.contract.json`. Kit imports in the copy point at `agentic-ds-kit`, so it compiles with no edits. Then import your copy:

```tsx
import { DashboardPattern } from "@/components/patterns/dashboard";
```

You own the copied files. Keep the contract JSON beside them: agents follow its `must` lines (kit components, semantic tokens, one primary Button, landmarks) and treat its `defaults` as suggestions you can change. The copied CSS uses semantic tokens only and the markup uses kit layout classes. If the copy renders unstyled, add `agentic-ds-kit/tokens.css` and `agentic-ds-kit/layout.css` to the root layout (step 4).

Copied patterns use plain CSS, not CSS Modules: each `.tsx` imports its `.css` file for side effects, and every class carries the pattern's prefix (`app-shell-pattern__rail`, `sign-in-pattern__form`) so names stay unique in your global styles. That is on purpose. create-next-app 16.4 writes a Turbopack rule to `next.config.ts` that sends every `*.css` file through `@tailwindcss/turbopack` with `as: "*.css"`, which turns a `*.module.css` into plain CSS with no class map, so `styles.rail` is `undefined` and the styles silently do nothing. Plain prefixed CSS renders the same with or without that rule. Keep it that way when you edit a copy, or narrow the rule if you want CSS Modules in your own code.

| Option | What it does |
| --- | --- |
| `--dir <path>` | Write somewhere else, e.g. `--dir app/overview/_pattern` |
| `--force` | Overwrite files that already exist (otherwise `add` stops and writes nothing) |
| `--list` | Print every pattern name with its one-line intent |

Upgrading the kit does not touch copied files. Re-run `add` with `--force` (into a clean branch) to pull a newer version of a pattern. Copies from 0.4.5 or earlier have a `*.module.css` that rendered unstyled under that rule; `add --force` writes the plain `.css` and new `.tsx` and lists the old module file, which nothing imports any more, for you to delete.

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

**Fonts.** A kit import sets a default body font (`var(--font-sans)`), text colour and page background with zero specificity, so any `body` rule of yours wins. The kit does not ship font files. `--font-sans` is `var(--font-ibm-plex-sans, "IBM Plex Sans"), system-ui, sans-serif`, so without Plex loaded you get `system-ui`. To get IBM Plex, load it with `next/font` and expose the CSS variables the tokens read:

```tsx
// app/layout.tsx
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-ibm-plex-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Or use another font by overriding the token: `:root { --font-sans: "Inter", system-ui, sans-serif; }`.

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

**Do not install 0.2.0.** That release still used `*.module.css` filenames; Next hashed classes twice and kit UI rendered as unstyled HTML. Use **0.4.5 or later**.

```bash
npm view agentic-ds-kit version
# expect 0.4.5 or higher
```

### Upgrade to 0.4.0

0.4.0 is breaking: the package exports components only. `AppShellPattern` (with `AppShellMenuButton`, `useAppShell`, and their types) and `SignInPattern` (and its types) are no longer imports. Pick one:

- **Keep them as they were:** copy the source in and change the import.

  ```bash
  npx agentic-ds-kit add app-shell
  npx agentic-ds-kit add sign-in
  ```

  ```tsx
  import { AppShellPattern, AppShellMenuButton, useAppShell } from "@/components/patterns/app-shell";
  import { SignInPattern } from "@/components/patterns/sign-in";
  ```

- **Compose your own layout:** `AppHeader`, `SideNav`, and `Drawer` are kit components. Top bar only, side nav only, or both are all fine; keep content in `<main>` and the nav reachable on small screens (for example a Menu Button that opens `SideNav` in a left `Drawer`). The docs `/patterns#layouts` section shows three small compositions.

If you copied `add app-header` / `add side-nav` before 0.4.0, re-run them with `--force`: ShellHeader and ShellNav no longer import the app shell. They work alone; to host them in your app-shell copy, pass `header={<ShellHeader menuButton={AppShellMenuButton} />}` and `nav={(placement) => <ShellNav placement={placement} />}` from a client component.

Pattern contracts replaced `doNot` with `must` (kit look and accessibility) and `defaults` (suggestions), and gained `role: "example"`. Re-copy `AGENTS.md` / `CLAUDE.md` / the skill from `node_modules/agentic-ds-kit/`.

### Get later kit versions

npm does **not** push updates into an already-installed app. The app’s lockfile pins the version from the last install.

To pick up a newly published kit:

```bash
npm install agentic-ds-kit@latest
```

If `package.json` already has `"agentic-ds-kit": "^0.4.5"`, `npm update agentic-ds-kit` also works. An older range (`^0.2.x`, `^0.3.x`) will not pick up a newer minor: run `npm install agentic-ds-kit@latest`. 0.3.0 removed the content-pattern imports (Activity, AssistantWorkspace, Dashboard, EmptyFirstRun, Inbox, InviteMembers, ListDetail, SettingsForm); 0.4.0 removed AppShellPattern and SignInPattern too (see [Upgrade to 0.4.0](#upgrade-to-040)). Copy patterns in with `npx agentic-ds-kit add <id>` and import from your own folder. Re-copy `AGENTS.md` / `CLAUDE.md` / the skill from `node_modules` if those files changed.

There is no auto-update. Dependabot or Renovate can open a PR when a new version ships; that is the usual way to stay current without remembering.

### Install checklist

- [ ] `npm install agentic-ds-kit` in the Next app (not in `$HOME`)
- [ ] React 19 already in the app
- [ ] No `transpilePackages` for this package (0.4.5+)
- [ ] `import { Button } from "agentic-ds-kit"` looks like a kit button, not a default browser button
- [ ] Optional: `import "agentic-ds-kit/tokens.css"` if your CSS uses kit variables with no kit component imported
- [ ] Optional: `import "agentic-ds-kit/layout.css"` if your markup uses `layout-canvas` (and related) with no kit component imported
- [ ] Optional: load IBM Plex Sans/Mono (`next/font`, variables `--font-ibm-plex-sans` / `--font-ibm-plex-mono`) or override `--font-sans`; the kit ships no font files
- [ ] Optional: copy `AGENTS.md`, `CLAUDE.md`, and the prototype skill for agents
- [ ] Optional: `npx agentic-ds-kit add <pattern>` for each pattern you want to start from (patterns are not package imports)

### If something looks wrong

| What you see | Likely cause |
| --- | --- |
| Text is `system-ui`, not IBM Plex | The kit ships no font files. Load Plex with `next/font` (step 4) or override `--font-sans` |
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
3. Compose components freely; layout is the user's choice. Patterns in `contracts/patterns/` are examples to start from or ignore (`npx agentic-ds-kit add <id>` copies one). In a pattern contract, follow `must`; `defaults` are suggestions.
4. Layout accessibility: content in `<main>`, chrome in `header` / `nav` landmarks, navigation reachable on small screens.
5. If a component is missing from the index, stop and ask — do not add a one-off.
6. Semantic tokens only. No hex in components. No primitive `--color-*` ramps in component CSS.
7. One `variant="primary"` Button per view.

**Eval prompts** (also in the README) are the smoke test that a coworker’s agent is actually using the kit.

## Passing props through

Kit components are strict on look and accessibility and open on everything else. Every component takes, on top of its own props:

- **`ref`** — a plain prop (React 19, no `forwardRef`). On form controls it reaches the native element, so form libraries can register it; elsewhere it reaches the component's root.
- **`className`** — merged after the kit's classes. Use it for layout (width, margin, grid placement), not to restyle the component.
- **Any other HTML attribute** — `id`, `data-testid`, `aria-*` the kit does not manage, event handlers. These go to the same element as `ref`.

```tsx
const emailRef = useRef<HTMLInputElement>(null);

<Card className="signup-card" data-testid="signup">
  <Field label="Email" htmlFor="email">
    <Input id="email" ref={emailRef} className="signup-email" data-testid="email" autoComplete="email" />
  </Field>
</Card>
```

Where each one lands is in the contract's `passthrough` block, for example Input: `{ "root": "div", "ref": "input", "className": "root", "rest": "input" }`. The cases worth knowing:

- **Form controls** (Button, Input, Textarea, Checkbox, Switch, InputOTP): `ref` and attributes on the native element, `className` on the visual root.
- **Composite widgets:** Select, DatePicker and DropdownMenu put `ref` on the trigger button; ColorPicker on the hex input; FileUpload on the drop-zone button.
- **Overlays** (Modal, AlertDialog, Drawer, HelpPopover): everything goes on the dialog panel, not the portal or scrim. The ref is `null` while the overlay is closed. Tooltip keeps `className` on the trigger wrapper and puts `ref` and attributes on the tooltip bubble.
- **Charts** (BarChart, LineChart, PieChart): the `<figure>` wrapper, not the SVG.
- **Group roots** (RadioGroup, Slider, Field, FieldSet): the root, since there is no single native control.

The kit always wins on what it owns: `role`, the `aria-*` it manages, `data-state`, its own event handlers and its own props. When a kit prop has the same name as an HTML attribute with a different meaning, the kit prop is the one you get:

- `title` is heading text on Card, Section, PageHeader, Alert, Modal, Drawer, charts and others, not a tooltip.
- `onChange` on form controls passes the value, not the event. With react-hook-form, use `Controller`, or spread `register()` without its `onChange`.
- `size`, `value` / `defaultValue`, and `pattern` on InputOTP keep their kit meaning.
- `id` on Tag, Cell and HeaderCell names the inner checkbox; target the root with `data-*`.
- Navigation landmarks (Pagination, NavigationMenu, AppNav, SideNav) accept your `aria-label` so several navs on one page can be told apart.

## How the catalog works

Three groups in `contracts/index.json`:

| `group` | Meaning | Example |
| --- | --- | --- |
| `foundation` | Tokens | `packages/kit/tokens/tokens.json` |
| `component` | One UI piece and its props | `packages/kit/contracts/carousel.json` → `packages/kit/ui/Carousel/` |
| `pattern` | A screen that only composes components | `packages/kit/contracts/patterns/activity.json` → `packages/kit/patterns/ActivityPattern/` (copy-in) |

A **component** contract has `props`, `doNot`, tokens, a11y. A **pattern** contract has `role: "example"`, `contains` (which components), `must` (kit look and accessibility rules a copy keeps) and `defaults` (the example's suggested composition, each line changeable). Patterns are examples, not a field inside Button.

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
2. Add `packages/kit/contracts/patterns/{id}.json` with `role: "example"`, `contains`, `must`, and `defaults`.
3. Implement the pattern in `packages/kit/patterns/{Name}Pattern/` from kit components only (imports `../../ui/X`), with demo data in a sibling `{id}-data.ts`. Set `"delivery": "copy-in"` and `"add"` in its index entry and contract. Do not re-export it (the package exports components only): `npm run build` copies it into `patterns-src/` for `npx agentic-ds-kit add`.
4. Render it in the docs app by relative import from `packages/kit/patterns/`, not from `agentic-ds-kit`.
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
npm run bump:kit -- patch
npm run publish:kit
```

`bump:kit` writes `packages/kit/package.json` and rewrites the current-version pins in this file. Use `minor` or an exact version (`0.3.0`) instead of `patch` when that is the bump. `publish:kit` syncs the pins again, then publishes. Historical notes for **0.1.0** and **0.2.0** stay as written.

If npm asks for 2FA:

```bash
npm run publish:kit -- --otp=123456
```

You must be logged in (`npm login`). Do not republish a version that already exists.
