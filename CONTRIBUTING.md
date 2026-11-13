# Contributing to Nistha

Nistha is published as the npm package `agentic-ds-kit`. This repo holds the kit (`packages/kit`) and the docs site (the Next.js app at the root).

## Set up

Node.js 20 or later.

```bash
npm install
npm run dev
```

The docs site opens at http://localhost:43123.

## Before you open a pull request

Run what CI runs:

```bash
npm run lint
npm run build
npx tsc --noEmit
npx tsc --noEmit -p packages/kit
npm test
```

Lint must finish with 0 warnings.

## Rules for kit changes

- **Contracts are the source of truth.** A component's contract lives in `packages/kit/contracts/`. If behaviour changes, update the contract, the component in `packages/kit/ui/` and its docs page in the same pull request.
- **Use the existing kit.** Read `packages/kit/contracts/index.json` first. If a component exists, use it. If one is missing, open an issue before adding it.
- **Tokens only.** No hex, `rgb()` or primitive `--color-*` ramps in components. Use the semantic tokens in `packages/kit/lib/tokens.css`, and the `--grid-*` tokens and layout classes for layout. New tokens need a discussion first.
- **Icons** are Lucide at `strokeWidth` 1.5 (`ICON_STROKE`).
- **Accessibility** is part of the contract: keep the `a11y` requirements true, and run axe on the pages you change.
- **Changelog.** Add a line under `[Unreleased]` in `CHANGELOG.md` for anything a kit user would notice.

More detail: [AGENTS.md](AGENTS.md) and [docs/getting-started.md](docs/getting-started.md).

## Pull requests

- Keep each pull request to one change.
- Describe what changed, why, and how you checked it (screenshots for visual changes).
- Maintainers merge. Releases and tags are made by maintainers only.

## Reporting a security problem

Don't open a public issue. See [SECURITY.md](SECURITY.md).
