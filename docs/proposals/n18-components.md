# Proposal: six new kit components (N18)

Status: **proposal only.** Nothing here is built, and none of these contracts are in `packages/kit/contracts/` or `contracts/index.json`. Each draft follows the shape of the existing contracts (`id`, `intent`, `useWhen`, `doNotUseWhen`, `props`, `passthrough`, `tokens`, `a11y`, `doNot`, `snippet`). Token names are existing semantic tokens; **none of these needs a new token or colour.**

Decide per component: build, change, or drop. Once one is approved, it is built the usual way: the contract moves into `packages/kit/contracts/`, then `ui/`, the docs page, the tests and the CHANGELOG.

| Component | Why now | Replaces in the repo today |
| --- | --- | --- |
| Text / Heading | Type is set by hand in every component's CSS | Per-component `font-size` / `line-height` pairs on `var(--type-*)` |
| Stack | Most layout in apps is a flex column or row with a token gap | About 95 CSS modules with `flex-direction: column` |
| VisuallyHidden | Screen-reader-only text is copied as a CSS class | 46 `.srOnly` copies in `packages/kit/ui` and `app` |
| ScrollArea | Scrolling regions must be focusable and named; done by hand | Hand-written `role="region"` + `tabIndex` in CodeSnippet, docs props table, charts |
| Toolbar | One-off `role="toolbar"` with no arrow-key movement | MessageActions' toolbar; editor and table action rows in apps |
| HoverCard | Tooltip is text-only and Popover opens on click; nothing for a rich preview on hover | Hand-rolled hover previews of people, links and records |

---

## 1. Text and Heading

Two small components so app code stops picking font sizes. Heading separates **level** (the `h1`–`h6` in the outline) from **size** (how big it looks), which is what most heading bugs come from.

```json
{
  "id": "text",
  "status": "proposed",
  "intent": "Body, UI and caption text on the kit type scale, with muted and subtle tones.",
  "useWhen": ["Paragraphs and short text outside a kit component", "Captions and helper text under a custom block"],
  "doNotUseWhen": ["Headings — use Heading", "Field hints and errors — use Field", "Links — use Link", "Code — use CodeSnippet or Kbd"],
  "props": {
    "as": { "type": "enum", "values": ["p", "span", "div", "label", "small"], "default": "p" },
    "size": { "type": "enum", "values": ["xs", "sm", "md", "lg"], "default": "md", "note": "Maps to type.size.body* and type.line.body*" },
    "weight": { "type": "enum", "values": ["body", "label", "title"], "default": "body", "note": "type.weight.body, type.weight.label, type.weight.title" },
    "tone": { "type": "enum", "values": ["default", "muted", "subtle", "danger", "success", "warning"], "default": "default", "note": "text.fg, text.fgMuted, text.fgSubtle, text.danger, text.success, text.warning" },
    "truncate": { "type": "boolean", "default": false, "note": "One line with an ellipsis; the full text stays in the DOM" },
    "children": { "type": "node", "required": true }
  },
  "passthrough": { "root": "as", "ref": "as", "className": "root", "rest": "as" },
  "tokens": ["font.sans", "type.size.bodyXs", "type.size.bodySm", "type.size.bodyMd", "type.size.bodyLg", "type.line.bodyXs", "type.line.bodySm", "type.line.bodyMd", "type.line.bodyLg", "type.weight.body", "type.weight.label", "type.weight.title", "text.fg", "text.fgMuted", "text.fgSubtle", "text.danger", "text.success", "text.warning"],
  "a11y": { "element": "p (or as)", "requirements": ["Tone is never the only signal: danger, success and warning text say so in words", "truncate keeps the full text in the DOM; add title only when the cut text matters"] },
  "doNot": ["Do not set font-size, line-height or font-weight next to Text", "Do not use Text for headings"],
  "snippet": "<Text tone=\"muted\" size=\"sm\">Last synced 2 minutes ago</Text>"
}
```

```json
{
  "id": "heading",
  "status": "proposed",
  "intent": "A heading with its outline level and its visual size set separately.",
  "useWhen": ["Section titles inside custom layouts", "A page title when PageHeader is too much"],
  "doNotUseWhen": ["A full page header with actions — use PageHeader", "A titled block — use Section or Card title"],
  "props": {
    "level": { "type": "enum", "values": [1, 2, 3, 4, 5, 6], "required": true, "note": "The h1–h6 element. Follow the page outline; never skip levels" },
    "size": { "type": "enum", "values": ["1", "2", "3", "4", "5"], "required": false, "note": "Visual size, type.size.heading1–5. Defaults to match level (6 looks like 5)" },
    "tone": { "type": "enum", "values": ["default", "muted"], "default": "default" },
    "children": { "type": "node", "required": true }
  },
  "passthrough": { "root": "h{level}", "ref": "h{level}", "className": "root", "rest": "h{level}" },
  "tokens": ["font.display", "type.size.heading1", "type.size.heading2", "type.size.heading3", "type.size.heading4", "type.size.heading5", "type.line.heading1", "type.line.heading2", "type.line.heading3", "type.line.heading4", "type.line.heading5", "type.weight.heading", "text.fg", "text.fgMuted"],
  "a11y": { "element": "h1–h6", "requirements": ["level sets the element; size never changes the outline", "One h1 per page"] },
  "doNot": ["Do not pick level for its size; use size", "Do not style a div or p as a heading"],
  "snippet": "<Heading level={2} size=\"4\">Billing history</Heading>"
}
```

## 2. Stack

A flex column or row with a token gap. Covers most one-off layout CSS without becoming a general layout system; page structure stays with the layout classes (`layout-*`).

```json
{
  "id": "stack",
  "status": "proposed",
  "intent": "Lays children out in a column or row with a token gap, alignment and optional wrapping.",
  "useWhen": ["Stacking form sections, cards or text inside a region", "A row of controls that should wrap on small screens"],
  "doNotUseWhen": ["Page structure — use the layout classes (layout-shell, layout-content, layout-split…)", "A metric grid — use layout-metrics or Scoreboard", "Joined buttons — use ButtonGroup"],
  "props": {
    "direction": { "type": "enum", "values": ["column", "row"], "default": "column" },
    "gap": { "type": "enum", "values": ["xs", "sm", "md", "lg", "xl"], "default": "md", "note": "space.gap.* tokens" },
    "align": { "type": "enum", "values": ["start", "center", "end", "stretch", "baseline"], "default": "stretch" },
    "justify": { "type": "enum", "values": ["start", "center", "end", "between"], "default": "start" },
    "wrap": { "type": "boolean", "default": false },
    "as": { "type": "enum", "values": ["div", "ul", "ol", "section", "form"], "default": "div" },
    "children": { "type": "node", "required": true }
  },
  "passthrough": { "root": "as", "ref": "as", "className": "root", "rest": "as" },
  "tokens": ["space.gap.xs", "space.gap.sm", "space.gap.md", "space.gap.lg", "space.gap.xl"],
  "a11y": { "element": "div (or as)", "requirements": ["No role; as=ul or ol for real lists", "Visual order equals DOM order (no reverse)"] },
  "doNot": ["Do not pass raw px or rem gaps", "Do not nest Stacks to fake a grid; use the layout classes"],
  "snippet": "<Stack gap=\"lg\">\n  <Section title=\"Profile\">…</Section>\n  <Section title=\"Security\">…</Section>\n</Stack>"
}
```

## 3. VisuallyHidden

One component instead of 46 copies of the same CSS class.

```json
{
  "id": "visuallyhidden",
  "status": "proposed",
  "intent": "Text that screen readers announce but sighted users don't see.",
  "useWhen": ["Extra context for an icon or a terse visible label", "A heading that gives a region its outline place without showing", "Live status text"],
  "doNotUseWhen": ["Naming a control — use its ariaLabel prop", "Hiding something from everyone — don't render it"],
  "props": {
    "as": { "type": "enum", "values": ["span", "div", "h2", "h3", "p"], "default": "span" },
    "focusable": { "type": "boolean", "default": false, "note": "Shows the content when it or a child has focus (skip links)" },
    "children": { "type": "node", "required": true }
  },
  "passthrough": { "root": "as", "ref": "as", "className": "root", "rest": "as" },
  "tokens": [],
  "a11y": { "element": "span (or as)", "requirements": ["Stays in the accessibility tree (clip-path, not display none or aria-hidden)", "focusable content becomes visible on focus"] },
  "doNot": ["Do not hide focusable controls unless focusable is set", "Do not duplicate text a screen reader already hears"],
  "snippet": "<Button iconStart=\"Trash2\" ariaLabel=\"Delete\" />\n<VisuallyHidden as=\"h2\">Filters</VisuallyHidden>"
}
```

## 4. ScrollArea

A scroll container that is focusable and named, so keyboard users can scroll it (axe `scrollable-region-focusable`). Today CodeSnippet, the charts and the docs props table each do this by hand.

```json
{
  "id": "scrollarea",
  "status": "proposed",
  "intent": "A named, keyboard-scrollable region with a token max size and edge shadows that show more content.",
  "useWhen": ["A wide table or code block that scrolls sideways on small screens", "A list in a fixed-height panel"],
  "doNotUseWhen": ["The whole page — let the page scroll", "A Modal or Drawer body — they already scroll", "Data grids — DataTable and DataGrid manage their own scrolling"],
  "props": {
    "ariaLabel": { "type": "string", "required": true, "note": "Names the region; unique on the page" },
    "orientation": { "type": "enum", "values": ["vertical", "horizontal", "both"], "default": "vertical" },
    "maxHeight": { "type": "string", "required": false, "note": "A CSS length or a var(--…) token; ignored for horizontal" },
    "shadows": { "type": "boolean", "default": true, "note": "Inset shadows on the edges that have more content" },
    "children": { "type": "node", "required": true }
  },
  "passthrough": { "root": "div", "ref": "div", "className": "root", "rest": "div" },
  "tokens": ["shadow.insetTopLight", "shadow.insetBottomLight", "shadow.insetStartLight", "shadow.insetEndLight", "focus.ring", "border.focus.width", "radius.surfaceSm"],
  "a11y": { "element": "div role=region", "requirements": ["role=region with aria-label", "tabIndex 0 only while the content overflows", "focus-visible kit ring", "Arrow keys and Page Up/Down scroll natively while focused"] },
  "doNot": ["Do not hide the scrollbar", "Do not nest ScrollAreas on the same axis"],
  "snippet": "<ScrollArea ariaLabel=\"Invoice lines\" orientation=\"horizontal\">\n  <Table …/>\n</ScrollArea>"
}
```

## 5. Toolbar

A row of controls that is one Tab stop, with arrow keys between items (WAI-ARIA toolbar). MessageActions already uses `role="toolbar"` without the arrow keys; it would compose Toolbar.

```json
{
  "id": "toolbar",
  "status": "proposed",
  "intent": "A group of related controls that is one Tab stop, with arrow keys moving between them.",
  "useWhen": ["Formatting controls above an editor", "Actions on a selected row or message", "A canvas or chart's zoom and view controls"],
  "doNotUseWhen": ["Two or three joined buttons that act as one — use ButtonGroup", "Choosing one option — use SegmentedControl or Tabs", "Page actions in a header — plain Buttons in PageHeader"],
  "props": {
    "ariaLabel": { "type": "string", "required": true },
    "orientation": { "type": "enum", "values": ["horizontal", "vertical"], "default": "horizontal" },
    "size": { "type": "enum", "values": ["sm", "md"], "default": "sm", "note": "Passed to kit Buttons inside" },
    "loop": { "type": "boolean", "default": true, "note": "Arrow keys wrap from the last item to the first" },
    "children": { "type": "node", "required": true, "note": "Kit Buttons, Toggle-style Buttons, DropdownMenu triggers and Dividers" }
  },
  "passthrough": { "root": "div", "ref": "div", "className": "root", "rest": "div" },
  "tokens": ["space.gap.xs", "border.divider", "radius.controlSm"],
  "a11y": { "element": "div role=toolbar", "requirements": ["role=toolbar with aria-label and aria-orientation", "One Tab stop (roving tabindex); arrows move, Home/End jump", "Disabled items stay focusable with aria-disabled", "Dividers are role=separator"] },
  "doNot": ["Do not put text inputs in a horizontal Toolbar (arrow keys conflict)", "Do not use more than one solid primary Button"],
  "snippet": "<Toolbar ariaLabel=\"Formatting\">\n  <Button iconStart=\"Bold\" ariaLabel=\"Bold\" aria-pressed={bold} />\n  <Button iconStart=\"Italic\" ariaLabel=\"Italic\" aria-pressed={italic} />\n</Toolbar>"
}
```

## 6. HoverCard

A rich preview (a person, a link, a record) that opens on hover **and** on keyboard focus, and never holds the only way to do something.

```json
{
  "id": "hovercard",
  "status": "proposed",
  "intent": "A small card with a rich preview that opens on hover or focus of a link or name.",
  "useWhen": ["Previewing a person behind an avatar or @mention", "Previewing a linked record or page"],
  "doNotUseWhen": ["Short text hints — use Tooltip", "Anything people act on or must read — use Popover (click) or a page", "Help text for a field — use HelpPopover"],
  "props": {
    "trigger": { "type": "node", "required": true, "note": "A focusable element: Link, Avatar inside a link, or Button" },
    "children": { "type": "node", "required": true, "note": "The card content: Avatar, Text, Badge, Link" },
    "placement": { "type": "enum", "values": ["top", "bottom", "left", "right"], "default": "bottom" },
    "openDelay": { "type": "number", "default": 500, "note": "ms; motion.* tokens set the fade" },
    "closeDelay": { "type": "number", "default": 300 }
  },
  "passthrough": { "root": "div (card)", "ref": "div (card)", "className": "card", "rest": "div (card)" },
  "tokens": ["surface.elevated", "border.subtle", "shadow.overlayMd", "radius.surfaceMd", "space.inset.md", "z.overlay", "motion.overlayDuration", "motion.overlayEasing"],
  "a11y": { "element": "div (card), not a dialog", "requirements": ["Opens on pointer hover and on keyboard focus of the trigger", "Escape closes it; moving the pointer onto the card keeps it open (WCAG 1.4.13)", "The trigger works on its own (e.g. the link navigates); the card adds nothing people need to act on", "The card is linked with aria-describedby only when its text is short"] },
  "doNot": ["Do not put the only copy of an action in a HoverCard", "Do not open on hover for touch-only triggers"],
  "snippet": "<HoverCard trigger={<Link href=\"/people/ana\">Ana Ruiz</Link>}>\n  <Avatar name=\"Ana Ruiz\" />\n  <Text size=\"sm\">Billing lead · Lisbon</Text>\n</HoverCard>"
}
```

## Open questions

1. **Text / Heading vs. existing type classes.** Should Section, Card and PageHeader switch to Heading inside (no visual change), or only new code use it?
2. **Stack scope.** Keep it to column and row, or also grid? This proposal says no grid: grids stay with the layout classes and `--grid-*` tokens.
3. **VisuallyHidden migration.** Replace the 46 `.srOnly` copies in one pass, or as each component is touched?
4. **ScrollArea in CodeSnippet and charts.** Compose it in those components once it exists?
5. **Toolbar and MessageActions.** MessageActions would gain arrow-key movement, which changes its keyboard behaviour. OK as a minor change?
