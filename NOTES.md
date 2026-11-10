# Notes

Decisions for the nistha website (the docs site in this repo), newest first.

## 2026-11-10: component pages, previews and variants

Site (branches `claude/k79-nistha-site-859cfe`, PR #119, and `feat/variants-tab-cleanup`):

- **One tab bar across the site:** kit Tabs, `segmented`, `sm`. Used on the component stage, the components overview, Foundations and inside the docs.
- **Component stage tabs:** Preview · Variants · Code · Contract. Copy prompt for Claude Code · Cursor · MCP sits beside them.
- **Preview and Variants show components the same way.** Both render the component's own doc through a shared view mode (`app/components/DocView.tsx`), never a gallery thumbnail:
  - Preview shows the doc's master render, with its controls panel when the doc has one.
  - Variants shows only the doc's variant sections.
  - No nested tab bars: in the stage, `DocTabList` switches the doc's view and renders nothing.
- **Variants is a plain stacked list,** not cards: one full-width section per variant, separated by a divider. Each section reads name, one-line description, prop chips, then the live render; code stays below.
- **Prop chips come from the contract.** An enum value or boolean prop named in the variant title becomes a chip (`variantChips` in `lib/component-contract.ts`, with tests). No match, no chip.
- **Render ground is `--bg-canvas`** (slate-50). The 5% brand tint read as lilac; the plain white had no contrast with the page.
- **Cell and HeaderCell previews** sit on a white bordered row, because the components are transparent.
- **ContextMenu** uses the standard framed layout. The **AnchorNav** demo scroller pads for the focus ring. **Chat** variant frames are 32rem so nothing scrolls.
- **Side nav:** component groups sit under Components as its subtree. The Theme toggle in the top bar is icon-only.
- **Foundations swatches:** labels are pinned to slate-900 or white, whichever contrasts more. They no longer flip with dark mode. One exception: violet-500 reaches 4.23:1.
- **Overlays in previews:** the no-flash rule targets only the preview wrapper (`data-preview-scope`), so Select, DropdownMenu, DatePicker and Tooltip panels open again when a theme is saved.

Kit (branch `claude/avatar-fallback-edge`, not yet in a PR; site-visible only after merge):

- **Avatar:** the fallback fill and the AvatarGroup +N fill use `--bg-tray`, so the circle keeps an edge on `--bg-canvas`.
- **CodeSnippet:** with tabs, the header uses an even inset on top, bottom and start.
- **ProgressSteps:** done markers and the done line use `--action-primary`. Upcoming steps are unchanged.
- **DateRangePicker:** matches the BP dual date picker.
  - Layout: presets in a column, two months side by side (one month below 40rem).
  - Footer: the pending range, Cancel and Apply. Picks stay pending until Apply.
  - Contract a11y and intent are updated for this flow.

Open:

- Upcoming ProgressSteps style: the request was cut off after "Uncompleted", so it was left as is.
- The DateRangePicker week starts on Sunday (BP uses Monday). The panel opens aligned to the trigger's right edge.
- A light preview theme under dark chrome keeps some dark status colours: `tokens.css` has no `[data-theme="light"]` reset.
