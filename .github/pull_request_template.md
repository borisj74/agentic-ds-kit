## What changed

<!-- One change per pull request. -->

## Why

## How I checked it

- [ ] `npm run lint` (0 warnings)
- [ ] `npm run build`
- [ ] `npx tsc --noEmit` and `npx tsc --noEmit -p packages/kit`
- [ ] `npm test`
- [ ] axe on the pages I changed (light and dark)
- [ ] Screenshots for visual changes

## Kit checklist

- [ ] Contract, `ui/` and docs updated together if behaviour changed
- [ ] Semantic tokens only (no hex, no primitive `--color-*`, no new tokens without discussion)
- [ ] `CHANGELOG.md` `[Unreleased]` updated if a kit user would notice
