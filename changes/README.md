# Changes waiting for the next release

Don't edit `CHANGELOG.md` in a pull request. Add one file here instead, so pull requests never conflict on the changelog.

## One file per pull request

Name it after the branch, with `/` turned into `-`: branch `feat/filterbar-popover` → `changes/feat-filterbar-popover.md`.

Write it the way a `CHANGELOG.md` section reads, using only these headings: `### Added`, `### Changed`, `### Deprecated`, `### Removed`, `### Fixed`, `### Security`.

```md
### Changed

- **FilterBar chips can open options in a popover.** Say what a kit user will notice, in one bullet.
```

Use as many headings and bullets as the change needs. Skip the file only when no kit user would notice the change (CI, tooling, docs-site-only fixes).

## At release time

After `npm run bump:kit`, run:

```bash
npm run changelog
```

It reads the version from `packages/kit/package.json` (or takes one, `npm run changelog -- 0.28.0`) and today's date (or `--date 2026-11-20`). It moves anything still under `[Unreleased]` and every file here under a new `## [version] - date` heading in `CHANGELOG.md`, in Keep a Changelog section order, then deletes those files. This README stays. Add `--dry-run` to print the result without changing anything.

It stops without writing anything if a file has an unknown heading or no bullets, if the version is already in `CHANGELOG.md`, or if there is nothing to release.
