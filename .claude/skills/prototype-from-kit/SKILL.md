---
name: prototype-from-kit
description: Use when building a playground screen from this design system. Compose from kit components and patterns.
---

# Prototype from kit

Use this skill when adding or changing playground screens in this repo.

## Steps

1. **Search the index** — Read `contracts/index.json`. Note `group`: `foundation`, `component`, or `pattern`.
2. **Open contracts** — Read only the 1–2 contract files that match the UI you need.
3. **Check patterns** — If the screen matches `dashboard`, `settings-form`, `list-detail`, `invite-members`, `assistant-workspace`, `empty-first-run`, `activity`, or `inbox`, use the pattern from `ui/patterns/` instead of hand-rolling the layout.
4. **Compose from `ui/`** — Import kit components. Match props exactly to contract enums; do not add variants.
5. **App shells** — Use `AppNav` with `groups` for playground/docs IA; flat `items` for list-detail.
6. **Stop if missing** — If no contract or pattern covers what you need, stop and ask. Do not scaffold a one-off.

## Hard rules

- Never define local cousins of kit components.
- Never use raw hex in component styles; semantic tokens only.
- Metric rows use `<Scoreboard items={...} />`, not flex layouts with borders.
- Settings pages use the `settings-form` pattern with `Field` wrappers.
- Invite / add-people screens use the `invite-members` pattern (Empty + Modal + FieldSet).
- Assistant / insights screens use the `assistant-workspace` pattern (`layout-workspace` + Chat `radius="none"` rail + two-column InsightCards).
- Empty / first-run screens use the `empty-first-run` pattern (PageHeader + Empty + one primary that opens a create Modal).
- Activity screens use the `activity` pattern (Scoreboard + task cards or list + tabbed DataTable feed).
- Inbox screens use the `inbox` pattern (Scoreboard + tabbed Table + detail Section + reply Drawer).
