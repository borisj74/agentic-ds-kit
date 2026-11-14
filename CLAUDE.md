@AGENTS.md

## Working rules for every task

- Use the `github` remote, never `origin`. One branch and one PR per task. Never merge or push to `main`; Boris merges.
- No tags, publishing or releases without Boris's yes.
- Before any PR, run lint, both `tsc --noEmit` runs, build and test. All must pass.
- Leave `.cursor/mcp.json` uncommitted and never commit secrets.
- Contracts are the source of truth. Don't add contract fields. Compose from kit components and tokens, never make local cousins, and if something is missing, stop and ask.
- Make minimal changes, with no new runtime dependencies.
- Run the Jev token gate (`jev-mcp@0.5.1`): the deterministic scan, then `jev_triage`. Stop on `needs_new_token`.
- Use our own wording and design. Don't copy Affect UI, onsystem or @shadcn/lint.
- In the PR, list what you skipped or are unsure about, then stop and report the link.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
