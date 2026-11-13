# Backfill release tags and GitHub Releases (0.14.0 to 0.19.0)

From 0.20.0 on, `npm run publish:kit` tags each release itself. These one-off commands add the missing tags for 0.14.0 to 0.19.0. **They push tags and create Releases. Run them yourself, after this PR is merged** (the Release notes are read from `CHANGELOG.md` on `main`).

Each tag goes on the commit that bumped `packages/kit/package.json` to that version. The tag date matches the npm publish date.

```bash
git fetch github --tags
git checkout main && git pull github main
```

```bash
GIT_COMMITTER_DATE="2026-11-10T11:56:51Z" git tag -a v0.14.0 78ec66ad8628d2628206a932c4731935f6cd5cb0 -m "agentic-ds-kit 0.14.0"
GIT_COMMITTER_DATE="2026-11-10T18:19:00Z" git tag -a v0.15.0 ab91c505fa94c44842ea54dfa4c093bfa95c7640 -m "agentic-ds-kit 0.15.0"
GIT_COMMITTER_DATE="2026-11-10T18:55:13Z" git tag -a v0.16.0 5cfabcdd5ed64ef4ec6d14f540dab401ab3f54bc -m "agentic-ds-kit 0.16.0"
GIT_COMMITTER_DATE="2026-11-11T08:36:07Z" git tag -a v0.17.0 83e463367a93783b6d301821e63973ab3cc0f429 -m "agentic-ds-kit 0.17.0"
GIT_COMMITTER_DATE="2026-11-12T10:24:56Z" git tag -a v0.18.0 69fd4afeae3066fb5ad8750fb9b3698319045150 -m "agentic-ds-kit 0.18.0"
GIT_COMMITTER_DATE="2026-11-12T13:42:33Z" git tag -a v0.19.0 2c4c93b780b548c45901b8872c18458d52bb1167 -m "agentic-ds-kit 0.19.0"
```

Check each tag points at its bump, then push:

```bash
for v in 0.14.0 0.15.0 0.16.0 0.17.0 0.18.0 0.19.0; do git show "v$v:packages/kit/package.json" | grep -m1 '"version"'; done
git push github v0.14.0 v0.15.0 v0.16.0 v0.17.0 v0.18.0 v0.19.0
```

Create the GitHub Releases, oldest first. Only 0.19.0 is marked latest:

```bash
for v in 0.14.0 0.15.0 0.16.0 0.17.0 0.18.0; do
  awk -v v="$v" '$0 ~ "^## \\[" v "\\]" {f=1; next} /^## \[/ {f=0} f' CHANGELOG.md > "/tmp/notes-$v.md"
  gh release create "v$v" -R borisj74/agentic-ds-kit --verify-tag --title "v$v" --notes-file "/tmp/notes-$v.md" --latest=false
done
awk -v v="0.19.0" '$0 ~ "^## \\[" v "\\]" {f=1; next} /^## \[/ {f=0} f' CHANGELOG.md > /tmp/notes-0.19.0.md
gh release create v0.19.0 -R borisj74/agentic-ds-kit --verify-tag --title "v0.19.0" --notes-file /tmp/notes-0.19.0.md --latest
```

Not covered: 0.13.0 and older have no tag (only `v0.13.1` exists) and no 0.13.1 CHANGELOG entry.
