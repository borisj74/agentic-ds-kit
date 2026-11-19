# Changelog

All notable changes to `agentic-ds-kit` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.30.0] - 2026-11-19

The kit font is now Geist (with Geist Mono for code), replacing IBM Plex, and headings are 550 with tighter tracking ([#255](https://github.com/borisj74/agentic-ds-kit/pull/255)). The kit still ships no font files. To keep the new look, load the variable Geist with `next/font/google` and no `weight` list, exposing `--font-geist-sans` and `--font-geist-mono` as the [getting-started guide](docs/getting-started.md) shows, or override `--font-sans` with your own font. Apps that load only Plex will render in `system-ui` until they do one of these.

### Added

- **`--font-weight-heading` (550)**, one dial for every heading role and for strong text. It needs the variable Geist to render as a true 550. ([#255](https://github.com/borisj74/agentic-ds-kit/pull/255))
- **`--type-tracking-heading-1` … `--type-tracking-heading-5`** for the heading ladder: -0.06em at 40px and up, -0.04em at 24 and 32px. They sit on two new letter-spacing primitives, `condensed` (-0.04em) and `compressed` (-0.06em). ([#255](https://github.com/borisj74/agentic-ds-kit/pull/255))
- **`--type-weight-strong`** (reads `--font-weight-heading`, 550). `layout.css` applies it to `strong` and `b` with zero specificity, so emphasis in body copy is 550, not 700. ([#255](https://github.com/borisj74/agentic-ds-kit/pull/255))

### Changed

- **Visual change: the kit font is now Geist and Geist Mono, replacing IBM Plex Sans and IBM Plex Mono.** `--font-sans`, `--font-display` and `--font-mono` read `--font-geist-sans` / `--font-geist-mono` and fall back to the system UI and mono stacks. The kit still ships no font files: load the variable Geist with `next/font/google` and no `weight` list (so the full weight axis loads) as the getting-started guide shows, or override `--font-sans`. Apps that still load only Plex will fall back to `system-ui` until they load Geist. ([#255](https://github.com/borisj74/agentic-ds-kit/pull/255))
- **Visual change: every heading role is 550.** `--type-weight-heading` (was 500), `--type-weight-title` (was 700), `--type-weight-display-hero` and `--type-weight-title-section` (were 400) now all read the new `--font-weight-heading` (550). Body stays 400 and labels and buttons stay 500. Avatar initials, FilterButton, AnchorNav, author and list-row names (AgentFleet, AgentMonitor, AgentSteering, IntegrationPicker), block subtitles, tile labels and similar text that borrowed the heading weight now use `--type-weight-label` or `--type-weight-metric`, so they stay 500. ([#255](https://github.com/borisj74/agentic-ds-kit/pull/255))
- **Visual change: heading tracking tightens with size.** `--type-tracking-heading` is now -0.02em (was -0.01em) for 14–20px headings, `--type-tracking-title` is -0.04em (was -0.02em), `--type-tracking-display-hero` is -0.06em and `--type-tracking-title-section` is -0.04em (both were -0.03em). Kit headings now use the tracking token that matches their size. ([#255](https://github.com/borisj74/agentic-ds-kit/pull/255))

## [0.29.0] - 2026-11-19

### Added

- **Chart palette tokens.** `--chart-1` to `--chart-6` are a soft colour set for chart series, with light and dark values and at least 3:1 contrast on the card ([#246](https://github.com/borisj74/agentic-ds-kit/pull/246))
- **BarList.** A ranked list for one measure, with a quiet bar behind each label, sorting, `maxRows` with Show all, and `href` rows ([#247](https://github.com/borisj74/agentic-ds-kit/pull/247))
- **Heatmap.** A rows-by-columns grid where each cell's shade of `--chart-1` shows its value, with a legend, tooltip, arrow-key moves and a Table toggle ([#248](https://github.com/borisj74/agentic-ds-kit/pull/248))
- **ComboChart.** Bars and a line over the same categories, on one shared axis or with `axis="dual"` for a second axis on the right ([#249](https://github.com/borisj74/agentic-ds-kit/pull/249))
- **LineChart can stack areas.** New `stack` prop (`none`, `stacked`, `percent`) for `variant="area"`, with a total in the tooltip and table ([#250](https://github.com/borisj74/agentic-ds-kit/pull/250))
- **ScatterChart.** One dot per item placed by two measures, with optional `group` colours and `size="value"` dot sizing ([#251](https://github.com/borisj74/agentic-ds-kit/pull/251))

### Changed

- **Charts are quieter.** BarChart and LineChart draw fewer, fainter gridlines, and axis labels use the caption weight ([#245](https://github.com/borisj74/agentic-ds-kit/pull/245))
- **Chart tooltips are smaller and line up.** Values align at the end of each row, long names get an ellipsis, and tooltips sit on the raised surface ([#245](https://github.com/borisj74/agentic-ds-kit/pull/245))
- **Chart legends use the same swatch spacing** in horizontal and vertical layouts ([#245](https://github.com/borisj74/agentic-ds-kit/pull/245))
- **LineChart looks softer.** Lines are a little thinner, smooth curves bend more fully, the crosshair is a hairline, and areas fade toward the baseline ([#245](https://github.com/borisj74/agentic-ds-kit/pull/245))
- **PieChart no longer glows or blurs.** The other slices just fade when one is active ([#245](https://github.com/borisj74/agentic-ds-kit/pull/245))
- **Charts use the chart palette by default.** BarChart, LineChart and PieChart colour series from `--chart-1` to `--chart-6`, so a single series is blue, not the brand colour; pass `color` for a status meaning ([#246](https://github.com/borisj74/agentic-ds-kit/pull/246))
- **The LineChart smooth curve is a shared module** (`ui/shared/curve.ts`) that ComboChart also uses; LineChart output is unchanged ([#249](https://github.com/borisj74/agentic-ds-kit/pull/249))
- **The shared curve can be traced backwards** (`reversedCurveCommands`), so stacked bands share their edges ([#250](https://github.com/borisj74/agentic-ds-kit/pull/250))
- **Heatmap column labels thin out on wide grids.** Above 12 columns only every third label is drawn; screen readers still get every header ([#252](https://github.com/borisj74/agentic-ds-kit/pull/252))

### Fixed

- **PieChart fits narrow cards.** The donut shrinks and stays square in a narrow container instead of running past the card edge ([#245](https://github.com/borisj74/agentic-ds-kit/pull/245))
- **LineChart lines stop at the plot edges.** Round line ends no longer reach about 1px past the fills and gridlines ([#250](https://github.com/borisj74/agentic-ds-kit/pull/250))
- **BarList's Show all lines up with the row labels.** The button text no longer starts about 5px right of the labels ([#253](https://github.com/borisj74/agentic-ds-kit/pull/253))

## [0.28.0] - 2026-11-18

### Added

- **Marketing type roles.** Two roles for marketing and landing pages only; product screens keep the existing display and heading roles. Hero display (`--type-size-display-hero`, `--type-line-display-hero`) is 64/76 at desktop, 52/64 below the md grid breakpoint and 40/48 below sm. Section title (`--type-size-title-section`, `--type-line-title-section`) is 32/40, and 28/36 below sm. Both set weight 400 (`--type-weight-display-hero`, `--type-weight-title-section`) and -0.03em tracking (`--type-tracking-display-hero`, `--type-tracking-title-section`). In `tokens.json` they are ladder steps `displayHero` and `titleSection`; a ladder step can now carry `belowMd` / `belowSm` overrides, which the generator writes as `@media` blocks at the grid breakpoint values
- **Tracking tokens.** `--type-tracking-tight` (-0.03em), `--type-tracking-snug` (-0.02em) and `--type-tracking-wide` (+0.08em, for marketing overlines), backed by new primitives `letterSpacing.tightest` and `letterSpacing.widest`. Existing tracking is unchanged: the 40/700 display title keeps -0.02em, the same value as snug
- **Fixed text tokens.** `--text-fixed-dark` (slate 900) and `--text-fixed-light` (white) stay the same in light and dark mode, for labels on fills that don't change with the mode. The Color foundations page uses them for primitive swatch labels instead of `--color-slate-900` and `--color-white`
- **Docs and agent guidance.** The Typography foundations page shows the marketing roles and the tracking steps next to the existing roles, and lists every letter-spacing primitive. `tokens/usage.json` (served by the MCP `get_tokens` tool) marks each new token as marketing and landing pages only. A token test checks the new roles, breakpoint values and tracking in the built CSS
- **`--icon-size-sm` token (1rem, 16px).** A size for Lucide icons set in CSS, such as a trend arrow next to caption text. Shown on the Icons foundations page. In JSX, pass Lucide `size={16}` to match
- **FilterBar chips can open a popover.** New optional `renderOptions(id)`: when set, each chip opens its options in a kit Popover anchored under it, so the chevron does what it promises; `openId` and `onFilterClick` still say which one is open, and Escape or a click outside closes it. FilterButton now keeps an `aria-haspopup` its wrapper sets (the Popover says `dialog`) instead of always saying `menu`. The contract adds `renderOptions`, `popover` in `contains` and an a11y line
- **GuardrailLog filters open as dropdowns.** Verdict, Rule, Agent and Time open their choices in a popover under the chip instead of a grey block that pushed the list down. The event list loses its own frame inside the card, the agent Avatar shows only when there is an image (initials repeated the name beside them), and Flagged is a neutral badge so red and amber stay for the verdicts that changed the action
- **FailureClusters and EvalSuite filters open as dropdowns.** Like GuardrailLog, their filter chips open the choices in a popover under the chip through FilterBar's `renderOptions`, instead of a grey block that pushed the list or table down
- **Contract token lists follow.** EvalSuite drops `bg.subtle` (the grey filter block is gone) and GuardrailLog drops `shadow.sm` (its card keeps the hairline border without `--shadow-sm`). GuardrailLog's `events` note says the agent Avatar shows only with `src`
- **Progress has a neutral tone.** `tone="neutral"` draws a mid grey fill (the same mix as Meter's neutral), for a value that carries no judgement; `muted` stays an ink fill. The contract adds `neutral` to `tone`
- **Meter has a neutral intent.** `intent="neutral"` draws the value in a mid grey (`--fill-strong` mixed into the card surface), for a value that carries no judgement. It works on the bar, ring and half ring. The contract adds `neutral` to `intent`
- **UsageList bars are grey until they matter, and can hide a shared limit.** Normal bars use Progress's new `neutral` tone (a mid grey) instead of brand blue; amber near the limit and red at it are unchanged. A new optional `hideLimit` shows only the used amount ("3,510 credits") for a breakdown where every item shares one limit; the bar's name still says used of limit. The contract adds `hideLimit`
- **UsageMeter lets the total lead.** Its category breakdown uses UsageList's `hideLimit` and grey bars, so the amber total is the one coloured bar, and the daily chart sits in the card without a frame of its own. The card keeps its hairline border and drops `--shadow-sm`; the contract's `tokens` list drops `shadow.sm`
- **High-risk approvals need ⌘⏎.** ApprovalCard with `risk="high"` approves from the keyboard only with ⌘⏎ or Ctrl+⏎, and its Approve key chip and `aria-keyshortcuts` say so; low and medium risk keep plain Enter. Escape and Enter no longer act while focus is on a button or field inside the card, so Escape on Approve no longer denies. The contract's notes and a11y line say the same
- **Accordion opens and closes with motion.** A panel now unfolds (its height grows over 680ms, `--motion-duration-600` plus `--motion-duration-200`, on `--motion-ease-in-out`), then its text fades and settles in, starting 240ms later. Closing folds in 400ms. The chevron turns over 680ms with `--motion-ease-spring-soft` and darkens to `--icon-default` when open or hovered. Closed panels use `visibility: hidden` in place of the `hidden` attribute, so they stay out of the accessibility tree and the tab order. Reduced motion keeps only a short text fade. No props or contract fields change

### Changed

- **Scorecard label is sentence case.** The label drops the uppercase, tracked mono overline and uses caption type in the interface font ("Revenue", not "REVENUE"). Scoreboard tiles follow, since they render Scorecard
- **Scorecard padding steps up by size.** sm stays 8px (`--space-inset-sm`), md goes from 12px to 16px (`--space-inset-lg`), lg from 16px to 24px (`--space-inset-xl`)
- **Scorecard delta icon is 16px.** It uses `--icon-size-sm` instead of a raw `0.95rem`
- **Surfaces in the page flow drop their shadow (1 of 3).** Card, ChangeSummary, Command, CommentThread and CommentsPanel keep their hairline border and lose `--shadow-sm`, so the border alone draws the edge. Menus, popovers and dialogs keep the `--shadow-overlay-*` shadows. Contracts drop `shadow.sm` from their `tokens` lists (CommentsPanel draws its edge through Card, so only its contract changes)
- **Surfaces in the page flow drop their shadow (2 of 3).** DecisionCard, ExperimentCard, InlineDiff, IntegrationPicker and InvoiceDocument keep their hairline border and lose `--shadow-sm`. Contracts drop `shadow.sm` from their `tokens` lists
- **Surfaces in the page flow drop their shadow (3 of 3).** NotificationStack, PricingPlans, SetupGuide, TaskBoard, TileGroup and TiltCard keep their hairline border and lose `--shadow-sm`. PricingPlans' highlighted plan keeps its primary ring. Contracts drop `shadow.sm` from their `tokens` lists (TiltCard draws its edge through Card, so only its contract changes)
- **DataGrid, DataTable, Scorecard and chart frames drop their shadow.** Like the other surfaces in the page flow, they keep their hairline border and lose `--shadow-sm`, so the border alone draws the edge. DataGrid's sticky columns and the DataTable column menu keep their shadows. ChartFrame (shared by LineChart, BarChart and the other charts) follows. The docs component preview panel drops its `--shadow-xs` too. No props or contract fields change
- **Quieter ExperimentCard, IntegrationPicker and InvoiceDocument.** ExperimentCard lists variants as hairline rows instead of a bordered box each; the winner row keeps its primary-subtle fill, now without the primary border, and lines up with the others. Stop is a neutral outline at rest (its AlertDialog stays danger), the confidence note uses a 16px Info icon, and the header icon is muted. IntegrationPicker categories read in sentence case at caption size instead of uppercase tracked mono, the logo box drops its border and the icons are muted. InvoiceDocument's header wraps: the invoice number never breaks, and the actions drop under the title when the card is narrow. Its Bill to / Issued / Due labels are sentence case. No props change; the contracts drop the tokens they no longer use
- **Quieter ChangeSummary, CommentsPanel and CommentThread.** ChangeSummary's delta is plain mono text coloured by sentiment instead of a tinted pill, and the good / bad / neutral word is muted so colour shows once per row; the delta now shares the label's baseline. CommentsPanel's inline panel drops `--shadow-md`, its header count is muted mono text instead of an outline Badge, the trigger's open count is a neutral Badge, and thread rows drop the repeated message icon and line up with the filter. CommentThread shows ⌘⏎ as a key chip on the Comment button (the Button `shortcut` slot) and drops the decorative @ icon. All three header icons are muted. No props change; ChangeSummary and CommentsPanel contracts drop the tokens they no longer use
- **Quieter NotificationStack, PricingPlans, SetupGuide and TaskBoard.** NotificationStack icons are muted unless the tone is warning or danger, unread rows get a small primary dot beside the time, and the header's unread count is a neutral Badge. PricingPlans marks the recommended plan with a 1px primary border (no extra ring) and mutes the feature checks. SetupGuide lines Done and Skipped up with the Start / Continue labels, mutes the Done word, puts the current task on a neutral fill and mutes the header icon. TaskBoard columns lose their border, resting cards lose `--shadow-xs` (the lifted card keeps `--shadow-md`), and cards with no due date no longer print "No due date". No props change; contracts drop the tokens they no longer use
- **Button key chips are easier to read.** The `shortcut` chip uses `--font-sans` instead of `--font-mono`. In the mono face ⌘ and ⏎ were squeezed below cap height, so every ⌘⏎ and ⏎ chip in the kit read as a smudge; in sans they sit at cap height
- **DoneCheck is lighter.** The check list no longer draws its own frame inside the Card (rows keep hairlines), evidence output keeps its columns and scrolls sideways instead of wrapping, and the trailing "3/5" goes, since the "3 of 5 met" badge and the bar already say it
- **TaskBrief's Goal hint says what to write.** It reads "One sentence on what the agent should do." instead of repeating the Done when question
- **Risk is said once.** ApprovalCard drops its lead icon tile, so the risk Badge is the one place risk is stated, and the title and description line up with the preview, countdown and actions below (the description also gains the tile's width). In AgentInbox, approval and question icons use `--icon-warning` (they wait on you), recap icons in the list and detail use `--icon-success`, and failure icons stay `--icon-muted`, so the risk Badge is the one red. Read rows keep the agent name at heading weight. The contracts' `tokens` lists follow (ApprovalCard drops `status.warningSubtle`, `status.warningText`, `primary.subtle` and `primary.fg`, and its `risk` note no longer mentions the tile; AgentInbox drops `icon.danger` and `status.warningText` and adds `icon.warning` and `icon.muted`)
- **AgentInbox fits narrow widths.** Stacked below 40rem, the list's side rule becomes a rule under it and rows take the full width. The filter labels drop their counts (the unread Badge carries the number), and the filter stays on one row and scrolls sideways instead of wrapping, and picking a row brings the detail into view. The selected row gets a hairline ring in `--line-strong` on top of its tint, so it reads apart from hover in dark mode
- **AgentMonitor is quieter.** The header drops the robot lead tile, so the name and status lead. Only the running step's tile spins; the headline shows a still dot. Collapsed, it keeps the status chip and shows the same step strip as when open (every step, the running one included) in its own row at the bottom; picking a step opens the card on that step (the contract's `collapsed` note says so). The axis under the strip shows only its first and last labels (the start and now), since step tiles are equal widths and a middle tick suggested a time scale they do not follow. While waiting, the ApprovalCard takes the clock panel's place and grey surface instead of sitting framed inside the card. The docs demo's meta is shorter so the header keeps to two lines
- **AgentPlan reads cleaner.** Step numbers are plain mono figures instead of ringed discs (the running step's number turns `--primary-fg` on its tinted row), and step text lines up with the header and footer instead of sitting 12px in. Collapsed, the plan keeps the open card's header (title, status, summary line) at the same width, instead of a full-width single row that cut the summary off. The contract's `collapsed` note and `tokens` list follow (`primary.fg` in, `line.strong` and `action.onPrimary` out)
- **AgentTrail is quieter.** Pending steps leave the time column empty instead of repeating "Pending" (the marker, the muted label and the screen-reader text still say it), and the branch tag uses the control radius instead of a full pill. The docs demo's live timers read in seconds ("18s") like the finished durations
- **AgentLanes is quieter.** The title icon is ChartGantt instead of Sparkles. Lanes no longer repeat "Needs you" as a badge; the header count and the flag on the block say it. Running blocks drop their coloured edge stripe. Running, waiting and failed blocks get the same hairline edge as done blocks (neutral on running, `--status-warning-border` and `--status-danger-border` on the others). The time grid is solid hairlines a step fainter than `--line-default`, drawn under the handoff lines, and handoffs are one neutral line with an end dot, without the start ring or the blue live colour. Blocks are 32px tall in 48px lanes (were 24px in 40px), so they read as objects beside the two-line lane labels and clear a comfortable click target; handoff lines follow the block height. The docs demo drops its two task icons so every block reads the same
- **AgentTree reads as a tree.** Open branches draw indent guides: a hairline from the parent's chevron (or the root icon) down its children. The waiting row is a solid `--status-warning-subtle` tint like the failed row, instead of a dashed amber box, and the column headers read Status, Time and Cost in sentence case
- **AgentSteering is quieter.** The robot lead tile goes, as in AgentMonitor, and so does the compass icon in the steer field. Suggestion chips use the control radius instead of full pills, and the hint is plain muted text, "Enter to steer", instead of a mono "steer with ⏎"
- **AgentFleet is quieter.** Overview and compact cards drop the repeated Network icon (the expanded card keeps it). The count and its bar sit together as one group. The waiting callout's text is `--text-fg` with the amber icon, and it wraps evenly. The expanded card enters on `--motion-ease-out` instead of a spring, and the fleet totals are plain muted text instead of a boxed chip. No props change; the card drops `--shadow-sm` and the contract's `tokens` list drops `shadow.sm`
- **AutonomyDial is quieter.** The scale ends read "More oversight" and "More autonomy" in sentence case instead of uppercase tracked mono, the "default" badge is neutral instead of primary blue, and the explanation panel keeps its grey surface without a border. The contract's `tokens` list drops the overline type tokens
- **MemoryPanel is quieter.** Memories drop the brain icon repeated on every row, so their text shares one left edge with the group labels; the header and empty state use BookMarked instead of Brain, and "Used here" is a neutral badge
- **MessageActions loses its frame.** The action row is bare ghost icons under the message instead of a bordered box inside the card, and it pulls back by a button's inset so the first icon lines up under the text. Hover and focus reveal, tooltips and the divider stay
- **PermissionRequest is quieter.** The scope count reads "2 scopes" as plain muted mono text instead of an uppercase pill, access badges read "read", "write" and "admin" without forced uppercase, read is neutral so colour stays for write (amber) and admin (red), and the scope list keeps its grey surface without a border
- **ToolCallCard panes lose their frame.** Arguments and Result keep their grey surface, radius and header hairline but drop the outer border, so the open card no longer stacks two boxes inside itself
- **TraceWaterfall reads faster.** Axis ticks fall on round steps that fit the run (0s 20s 40s 60s for a 74-second run; runs of two minutes or more count in minutes) in one unit per axis instead of quarter splits like 19s and 37s. Span rows drop the kind dot that repeated the bar's colour (the legend and the detail header keep it), and the span detail uses the stats panel's grey surface instead of a bordered box
- **Contract token lists follow.** MemoryPanel, PermissionRequest, ToolCallCard and TraceWaterfall drop `shadow.sm` from their `tokens` lists (their cards keep the hairline border without `--shadow-sm`); MessageActions drops `radius.surfaceMd`
- **RadioGroup cards show the choice and follow size.** In the `card` variant the checked card gets a hairline in `--action-selected-border`, the colour its dot already uses, instead of looking like the others. `size="sm"` cards use 14px titles, 12px padding and 8px gaps, so a small option list (as in DecisionCard) sits under its question instead of out-shouting it
- **InsightCard is quieter.** The opportunity and neutral tones use a Lightbulb instead of Sparkles, and the title follows the card size (16px at sm, 18px at md, 24px at lg) instead of 24px at every size
- **CitedAnswer is quieter.** The sparkle avatar goes, so "Assistant · time" leads. Inline citation marks are small raised links at body weight instead of bold mono at body height; they stay real links named "Source N: title"
- **Collapsible titles are 14px.** The panel title drops from body size to `--type-size-body-sm`, so a panel's title no longer out-sizes the content around it
- **ContextWindow's fifth segment reads as filled.** It was the tray colour with an outline, so it looked like a hole in the bar; it is now a solid mid grey, darker than the first segment and the empty track, in the bar and the legend dot
- **RunningNow row is compact and says its overflow.** In row layout the strip is as wide as its chips instead of its container, and the overflow is a text button on the label line ("2 more · View all", or plain "2 more") instead of a lone "+2" chip that wrapped onto its own line. The label reads "Running now" in sentence case instead of uppercase tracked mono. The contract's `maxVisible` note and a11y line say so
- **RedactionPreview keeps colour for what is exposed.** Masked values in the payload are quiet grey placeholders instead of blue bordered chips (they still reveal on click, with a dashed edge while shown), and summary tags show the amber dot only for a type that is not masked, instead of a green dot on every tag
- **DropdownMenu group headings are sentence case.** Headings such as a ModelPicker vendor read as a muted caption ("Anthropic") instead of an uppercase tracked overline ("ANTHROPIC"); every grouped dropdown follows
- **ModelPicker's label matches other form labels.** It uses the form-label size (`--type-size-label`, 14px) like a kit Field instead of caption size, so "Model" no longer looks smaller than the labels around it, as in TaskBrief
- **Tag is the right height.** Each Tag size now sets its own UI line height (sm 16px, md 20px, lg 24px) instead of the shared 32px heading line height, so a small tag is 24px tall instead of 42px and sits level with the buttons beside it
- **AgentOverview summary cards start level with the Activity chart.** The "Since you last looked" heading is now for screen readers only (it still labels the summary section), so the two columns share one top edge. The line under the title drops its trailing period.
- **AppDirectory's detail drawer keeps the status next to the logo.** The Connected / Not connected Badge sits 12px after the app's logo tile instead of at the far edge of the drawer, so the two read as one.
- **AssumptionLog loses its inner frame.** The list of assumptions no longer draws its own border and radius inside the Card; rows are split by hairlines. Medium confidence uses the new neutral Meter instead of blue, so colour stays at the ends: amber for low, green for high
- **ActivityFeed events are calmer and line up.** The Avatar sits on the first line with the text and actions instead of centring in the row. The event type is quiet text after the time ("14:18 · Comment") instead of an outline Badge, since the verb already says it. The Agent Badge is neutral, so only status Badges carry colour. Open is an icon-only ghost Button (still named Open + the object). The time line sits 4px further below the copy, and on narrow blocks a lone Open stays at the row end while Reply rows move their actions under the text, lined up with it.
- **Card login example offers more than one way to sign in.** The Card contract snippet and docs end the body with a block Login Button (the one primary), a Divider labelled "Or continue with", then "Google" and "Apple" outline Buttons side by side in a `layout-split`. The example no longer uses `actions`. Card's props are unchanged
- **ChangeReview's file rows say their state once.** A reviewed, accepted or rejected file shows its state only as the Badge ("src · +3 −1" + Reviewed), which screen readers now hear through the ListView row name. "Not reviewed" has no Badge and stays in the line.
- **ChangeReview keeps the file list in view.** Side by side, the file list sticks to the top while a long diff and its comments scroll, and a long list scrolls on its own. Stacked below 64rem it scrolls with the page as before.
- **ChangeReview's file line says position and state only.** "File 1 of 5 · Not reviewed"; the +/− counts already sit in the file row and the diff header.
- **ChangeReview hides the J / K / R hint when stacked.** Below 64rem (usually touch) the keys line is hidden; it stays in the page, so the block's description still reads it.
- **DataTable's caption is 16px.** The caption moves from `--type-size-heading` (24px) to `--type-size-ui-md` (16px), the size a chart title renders at, so a table beside a chart (as in KpiBoard) reads as its peer instead of a bigger heading.
- **EvalSuite's case table is quieter.** Tags are plain text instead of neutral Badges, so Pass / Fail / Error are the only colour in a row, and each row's Open is a ghost Button instead of an outline one. Open keeps its "Details for <case>" group and its name. The Score Δ and Cost Δ headers read "Score vs v12" and "Cost vs v12" (the baseline's label), so they say what the change compares to.
- **FailureClusters marks the selected cluster with a fill, not an edge bar.** The 2px accent bar on the left of the selected row is gone; the row uses the same selected fill as a kit ListView row (`--action-selected`), and keeps it on hover.
- **Quieter FileUpload.** The upload icon in the drop zone no longer sits in its own bordered box, the upload, file and status icons are all 16px, and a failed file row keeps its neutral border: the alert icon and message carry the red. Retry and delete are unchanged. No props change; the contract drops `status.dangerBorder` and `radius.controlMd`
- **Quieter FilterButton count and chevron.** The applied-filter count is a subtle neutral Count instead of the brand fill, so a set filter no longer shouts, and the split chevron cell on applied or off chips is 32px (`--space-8`) wide at every size instead of the chip's full height. FilterBar inherits both. No props change
- **IntegrationPicker's search says Search.** The placeholder no longer says "Search integrations", so it fits wherever the picker is titled (Apps, Integrations). Its accessible name still comes from the title.
- **IntegrationPicker fits narrow cards.** Below 40rem of card width, search takes the full row and the category filter sits under it on one row that scrolls sideways instead of wrapping onto a second line.
- **KpiBoard's chart no longer repeats the KPI value.** The LineChart drops its description (the picked card's value, e.g. "$48.2k"), which sat over the y-axis and read like an axis label on a different scale. The picked Scorecard already shows the value, and the chart title still names the metric and the range.
- **ListView danger actions are quieter, disabled rows stay readable.** A row's `danger` action now renders as a ghost danger Button (red icon, no fill) instead of a solid red one. A disabled row fades once with `--opacity-disabled`: its text keeps the primary and secondary colours instead of also switching to `--text-disabled`, so the name and email no longer nearly disappear
- **ModalCard has more room and clearer groups.** Padding is 16 / 24 / 32 for sm / md / lg (was 12 / 16 / 24). The body sits 16 below the title, and the footer sits 24 below the body (16 on sm). The close X lines up with the title and the padding edge. Modal gets the same spacing, since it composes ModalCard.
- **DropdownMenu rows are 36px tall (were 40px).** Group headings start on the same line as item labels, and shortcuts no longer have extra letter spacing. Select options get the same rows, since Select composes DropdownMenu.
- **Timeline steps read as groups.** Phase, title and body use line heights that match their sizes (16px, 20px, 20px instead of 24px, 32px, 24px), so lines inside a step sit close and steps stay apart. The dot is centred on the phase line
- **TreeView md rows use 14px text, and the reorder grip shows on the row in use.** md labels move from `--type-size-body` (16px) to `--type-size-body-sm` (14px), in line with ListView. With `reorderable`, the grip appears on hover, keyboard focus, an open Move menu or a drag, and stays visible on touch screens
- **Table and DataTable headers are sentence case.** Header labels (Table `th` and HeaderCell, which DataTable uses) move from the overline style (Plex Mono, uppercase, wide tracking) to label type: the body family at caption size and label weight, with no tracking or case change. The Table and HeaderCell contracts list `type.family.body`, `type.size.caption` and `type.weight.label` in place of the four overline tokens. Overlines elsewhere (AppNav, PageHeader, InlineDiff, Command) are unchanged.

### Fixed

- **Chart titles, NumberTransition and ShimmerText use a real size token.** They pointed at `--type-size-heading-sm`, which does not exist, so they inherited whatever size was around them. Chart titles and NumberTransition (md) now use `--type-size-ui-md` (16px, what they rendered at on a 16px page), and ShimmerText `lg` uses `--type-size-ui-lg` (18px), so it is larger than `md` as intended.
- **ListView reads a row's Badge to screen readers.** A row's accessible name is now primary, secondary, then the badge ("app.ts, src · +3 −1, Reviewed"), so a status shown only as a Badge is no longer lost.
- **TreeView labels no longer break letter by letter in narrow trees.** A label stays on one line and ends with an ellipsis when its row runs out of room. The full label is in the row's accessible name, as before, and now also in a hover title
- **AutonomyDial no longer wraps its scale 3 + 1.** The one-stop-per-row layout now follows the dial's own width (a container query at 40rem, `--grid-breakpoint-sm`) instead of the viewport, so a dial in a narrow column, like PlanReview's side column, lists its four stops down the column instead of breaking the oversight-to-autonomy row onto two lines. A dial wide enough for one row keeps it.
- **BarChart keeps whole-number ticks for whole-number data.** When every value is an integer (counts of runs, events, people), the value axis steps by at least 1, so it reads 0, 1, 2 instead of 0, 0.5, 1, 1.5, 2. Charts with fractional values are unchanged.
- **MultiSelect is as tall as an Input.** With tags in it, the field was 6px taller than an Input at md (2px at sm), so it broke the line in forms. The shell now trims its vertical padding and keeps an Input's height (42px md, 34px sm); a second row of tags still grows it. The search input's minimum width drops to `--space-10`, so on a phone-width field it stays on the tags' row instead of adding an empty second line. No props change
- **Modal's scrim covers the whole screen.** The overlay padding no longer shrinks the scrim, so there's no undimmed 16px strip at the viewport edges.
- **DataTable number columns right-align their values.** `type: "number"` already right-aligned the header; the kit Cell inside each value cell now ends at the same edge
- **SegmentedControl is as tall as a Button.** Its items used the 24px body line height, so the track was 44px at md and 36px at sm next to 40px / 32px Buttons. Items now use the UI line height, and the selected thumb's radius is the track's radius minus its padding (4px), so it follows the track's curve. Components built on it (PricingPlans, CommentsPanel, IntegrationPicker) get 4px shorter. No props change; the contract drops `radius.controlSm`

## [0.27.1] - 2026-11-16

### Fixed

- **Primary button labels are readable in every colour preset.** The Ink, Blue, Violet and Teal presets did not set `--action-on-primary`, so the label fell back to `--text-fg-inverse`, about 3.7:1 on Teal's light fill. Each preset now picks white or neutral 950 by contrast, the same way the docs presets do, so every preset reaches at least 4.5:1 in light and dark. Teal light's hover and pressed fills now get lighter (teal 500 and 400) instead of darker, because its label is near-black: they were 3.62:1 and 2.61:1 and are now above 4.5:1. A test checks the label on the rest, hover and pressed fill for every preset. The docs site's theme presets had the same problem: hover and pressed now move away from the label there too (Teal light, Amber light and Ink dark change; the rest keep their steps), and the Theme builder's contrast list adds "Button label on hover" and "Button label pressed"
- **RedactionPreview keeps a revealed value on the same value.** Reveal state was keyed by the chip's position, so when the payload or spans changed order a shown value could jump to another chip. It is now keyed by the value itself (its type, text and which occurrence it is), so the same value stays shown
- **Agent components share one currency default.** TaskBrief defaulted to EUR while EvalSuite and CurrencyInput default to USD. TaskBrief now defaults to USD too; pass `currency` to change it
- **README starts with a quick start.** `npx agentic-ds-kit init`, an example prompt, and a short note on how agents read `contracts/index.json` and compose from kit pieces only

## [0.27.0] - 2026-11-15

### Added

- **TaskBrief** (organism, Agents): the brief a person hands an agent before it plans. A goal, one to eight one-line "done when" checks, optional spend, time and step limits, allowed tools, model and check-in level, in a kit Card. Start is the one solid primary and stays disabled, with the reason beside it, until there is a goal and one check. `status` "started" folds to one line (goal · checks · cap); "error" keeps the form and shows a kit Alert
- **DoneCheck** (organism, Agents): after an agent says it is finished, each agreed "done when" check marked Met, Not met, Unverified or Checking, with its evidence (a note, a Link, or test output in a CodeSnippet) in a kit Collapsible. Not met rows sort first with the agent's reason; unverified never counts as met. A person can Mark met or Mark not met ("set by you") and Re-check a row. Accept result is the one solid primary only when every check is met; otherwise Send back to agent is
- **AssumptionLog** (organism, Agents): the guesses an agent made without asking, so a person can confirm or correct them before they matter. Each row shows the assumption in one sentence, confidence as a small Meter plus Low / Medium / High, its source as a Tag, and "used in n steps", which opens a Popover listing the steps. Open rows sort weakest first; a SegmentedControl filters Open / Confirmed / Corrected / All. Correct turns the row into an Input (Enter saves, Escape cancels); corrected rows show the old text struck through, the new text and "agent will redo n steps". `compact` gives one line for a run header: the open count and the weakest guess
- **RedactionPreview** (organism, Agents): shows exactly what is about to leave the product for a model or outside tool before it is sent. The payload is read-only mono text with each sensitive value as a chip ("[email]") that announces "masked email"; a Tooltip gives the type and selecting the chip shows the value to the viewer only. One Tag per type with its count, one mask Switch per type (on by default; secrets such as API keys are locked on, with the reason as the hint) and a warning Alert when anything goes out unmasked. Send is the one solid primary and hands back the masked payload; `status` "sent" folds to one line ("Sent to … with 10 values masked")
- **GuardrailLog** (organism, Agents): every time a policy rule stepped in on an agent by itself. A summary ("14 blocked · 3 rewritten · 6 flagged this week"), a kit FilterBar (verdict, rule, agent, time; each opens a RadioGroup of values) and a list of rows, newest first, each with a verdict Badge in words, the rule, what the agent tried, the agent with an Avatar and when. Up and Down move between rows; a row opens a kit Drawer with the exact attempt in a CodeSnippet (and, for rewritten, what ran instead), the rule text and owner, a run Link and Request override: a Textarea for the reason and Submit, confirmed in a kit AlertDialog. `overrideStatus` covers sending, sent and error; `compact` gives one line for a header
- **EvalSuite** (block, Agents): test a candidate agent version against the baseline on a fixed set of cases before shipping. A Scoreboard of pass rate, average cost, p50 latency and regressions (baseline → candidate, with deltas whose good direction is set per metric); a SegmentedControl (Regressions / Improvements / All) and a FilterBar (tag, dataset) over a DataTable of cases with Pass / Fail / Error Badges and score and cost deltas, regressions first. Each row's Open button shows a Drawer with the input, both outputs as a split InlineDiff, the grader's note, Accept as new expected and Flag case. Promote candidate is the one solid primary, disabled with the reason beside it while regressions are unreviewed; `status` covers running (with progress) and error
- **FailureClusters** (block, Agents): failed runs across all agents grouped by likely cause, so ops fixes causes, not single runs. A FilterBar (time, agent, status) over a listbox of clusters, largest first: the cause, a count (NumberTransition), a status Badge (New / Known / Fixed / Regressed), an AvatarGroup of affected agents and the trend in words ("3× vs previous"). Up / Down / Home / End move the selection. Beside it the selected cluster: first and last seen, a LineChart over time, a sample failing call in a ToolCallCard opened to its error and a Table of recent runs, with Mark known, Mute 24h and Open issue as the one solid primary. Stacks below 64rem of block width

### Changed

- **KpiBoard takes three to six KPIs (was three or four).** Five or six cards scroll sideways in the Scoreboard's Conveyor, which Scoreboard already does past four; the chart and table still follow the picked card. More than six still belongs in a Scoreboard with Conveyor and a separate chart
- **CodeSnippet tabs use the segmented style.** The tabs in a CodeSnippet header are now kit Tabs `segmented` (`sm`): a tray with a raised active tab, so the selected file stands out. They were `line` tabs, where the only difference was a darker label and a thin underline

### Fixed

- **AgentLanes fits a phone.** When the block is narrower than 40rem (`--grid-breakpoint-sm`), each lane puts its agent above a full-width time track, so the track gets the whole width instead of what is left beside a fixed agent column. Only the round ticks keep a label and a grid line (every 10m on a 30-minute window, every 2m on a 10-minute one), so labels no longer pile on top of each other. A waiting block shows its warning icon without the "Needs you" text, which the agent row's badge already says. Handoff lines and the popover follow the new lane height. Wider blocks do not change
- **AutonomyDial's stops fill the track evenly.** The control is stretched to the dial's width, but its stops kept their natural width, so the leftover space sat after the last stop and the track looked padded more on the right than the left. The stops now grow into that space, so the inside padding matches on both ends. On phones (under 40rem, `--grid-breakpoint-sm`) the stops sit one per row with the icon and label at the start, so the icons line up down the list, with `--space-inline-sm` between icon and label
- **Tabs inside another Tabs keep their own look.** Variant and size rules matched any descendant, so a Tabs in the panel of a `segmented` Tabs (for example a CodeSnippet on a page with segmented tabs) picked up the outer tray background and label colour. The rules now apply only to a Tabs' own list, tabs and panel
- **Collapsible's toggle has the same corners as the controls around it.** It used `--radius-control-sm` (3px by default), sharper than a md Button and the rows a Collapsible usually holds. It now uses `--radius-control-md` (6px by default), and it follows the theme's radius like they do
- **DropdownMenu's field trigger has the same corners as Input and Select at every size.** `sm` used `--radius-control-sm` (3px by default) and `lg` used `--radius-control-lg`, while Input and Select keep `--radius-control-md` at every size. All three sizes now use `--radius-control-md`, so a condition picker in a DataGrid row, for example, matches the fields and buttons beside it
- **Solid primary Button and Badge pick a readable label colour.** They used `--text-fg-inverse`, which is the right label only when the brand is dark in light mode and light in dark mode. They now use `--action-on-primary` like Checkbox, Switch and Slider, which the theme presets set to white or near-black by contrast. Ink dark went from 2.87:1 to 6.90:1, Teal light from 3.74:1 to 5.28:1 and Amber light from 3.80:1 to 5.20:1. Nistha does not change
- **Muted text in theme presets reaches 4.5:1 on cards.** The non-Nistha presets mapped `--text-fg-subtle` (and so `--text-muted`, used by Field hints and FieldSet and Drawer descriptions) to neutral 400 in light and 500 in dark, about 2.5:1 and 3.7:1 on the surface. Presets now use the same steps as the kit: subtle 500 in light, muted 300 and subtle 400 in dark

## [0.26.1] - 2026-11-14

### Changed

- **Modal and ModalCard titles are larger, so they read as headings above 14px field labels.** The default (`md`) title is now `--type-size-heading` (24px, was 16px) with `--type-tracking-heading`, the same as Drawer, AlertDialog and Card. `sm` is now `--type-size-body` (16px, was 14px, the label size), like Card `sm`. `lg` does not change

## [0.26.0] - 2026-11-14

### Changed

- **Lighter headings: `--type-weight-heading` is now 500 (was 600).** Section, Card, Drawer, AlertDialog and Modal titles, and `heading-1…5`, use the semantic token `type.weight.heading`, which now points at `fontWeight.medium`. Page titles stay at 700 (`--type-weight-title`); sizes and tracking do not change. Modal titles are 16px, so at 500 they sit close to 14px/500 field labels; to keep the old weight, set `--type-weight-heading: 600` in your theme
- `generate-tokens` emits every `--type-weight-*` from `tokens.semantic.type.weight` in `tokens.json` instead of fixed primitive picks, so editing a semantic weight now reaches `tokens.css`. Output for the other weights is unchanged

## [0.25.0] - 2026-11-14

### Added

- **Inspect mode**: with `NEXT_PUBLIC_NISTHA_INSPECT=1` (or `true`), every kit component writes `data-nistha="<contract id>"` on its root element. A component built on another kit component writes both ids on the shared element (`tiltcard card`, `select dropdownmenu`). Off by default, and off in production builds (`NODE_ENV=production`) unless `NEXT_PUBLIC_NISTHA_INSPECT_FORCE=1` is also set. With the mode off the markup is unchanged. The switch is a plain function (`ui/shared/inspect.ts`), so server components such as Button, Card and Table stay server components
- **`inspect <url-or-file>`**: reads a rendered page (Node `fetch` of the server HTML, or a local `.html` file) and lists the kit pieces on it, grouped by level, with counts, plus ids not in the installed index. Landmark checks: `no-main`, `multiple-main`, `no-h1` (errors). No markers is a note that inspect mode may be off, not an error. `--json` prints the same data. `--browser` reads the live page after hydration with Playwright, an optional install the kit loads only then. Exit 0 OK, 1 landmark errors, 2 could not run
- **MCP `inspect_ui`**: the same result for an agent, from a `url` or from `html` plus `name`

## [0.24.0] - 2026-11-14

### Added

- **`review --score`**: a 0–100 contract fit score, the share of UI elements that come from the kit minus 5 per error and 2 per warning for every 100 elements (up to 100 elements counts as 100), so a big folder is not pushed to 0 by its size. UI elements are opening JSX tags: kit imports count as kit; `button`, `a`, `input`, `select`, `textarea`, `img`, `table` and `dialog` count as other; layout and text tags, icons and other components are not counted. Text output prints the score and the formula; `--json --score` adds `score: { value, kitElements, otherElements, errors, warnings, formula }`. Without `--score` or `--min`, output and exit codes are unchanged
- **`review --min <n>`**: exits 1 when the score is below `n` (and turns on `--score`); an invalid `n` exits 2
- **MCP `review_ui`** results include `score`
- **`templates/github/contract-fit.yml`**: a workflow to copy into `.github/workflows/`. On `pull_request` it runs `review --json --score` and keeps one PR comment with the score, counts and top 10 findings. Report only unless `MIN_SCORE` is set; fork PRs still pass with the score in the log
- **Contract fit docs page** (`/contract-fit`) with the formula and a worked example
- Nistha runs contract fit in its own CI (`.github/workflows/contract-fit.yml`, not a required check): patterns must score 100, the docs app is report only

## [0.23.0] - 2026-11-14

### Added

- **`npx agentic-ds-kit review <path>`**: checks a file or folder (`.tsx`, `.ts`, `.jsx`, `.js`, `.css`) against the contracts and tokens and says what to fix. Five rules: `raw-value` (error: hardcoded colour, spacing, radius or shadow, or a primitive `--color-*` ramp; the fix names the closest semantic token), `wrong-use` (error: Button with `href`/`to`/`as="a"`, more than one solid primary Button in a file, icon-only Button without an aria label), `outside-kit` (error: other UI libraries and local copies such as `components/ui/button`), `rebuild` (warning: an organism or block built by hand from its parts) and `pattern-fits` (warning: the file looks like a pattern; fix `npx agentic-ds-kit add <id>`). Text output by default, `--json` for findings plus error and warning counts. Exit 1 on any error, 0 for warnings only, 2 when the review cannot run
- **MCP `review_ui`**: the same findings for an agent, from a `path` or from `code` plus `filename` (a draft that is not saved yet). Read-only
- `AGENTS.md` and the `prototype-from-kit` skill tell agents to run review on what they changed and fix the errors before finishing

## [0.22.0] - 2026-11-14

### Added

- **`level` on every contract**: `atom`, `molecule`, `organism`, `block` (the `kind: "block"` contracts) or `template` (patterns), right after `status`. `contracts/index.json` copies it from each contract (`npm run sync:index -w agentic-ds-kit` now syncs `level` as well as `intent`, and `--check` reports both). The tokens row has no level. A new test checks every contract and index row
- **MCP level filter**: `list_components` takes an optional `level` (`atom`, `molecule`, `organism`, `block`) next to `kind`, and its rows include `level`. `get_component` and `search_components` include `level`; `list_patterns` and `get_pattern` include `level: "template"`. An unknown level is a tool error
- **Build order** in `AGENTS.md` and the `prototype-from-kit` skill: start from the biggest piece that fits (pattern, block, organism, molecule, atom), check `level` in the index, and never rebuild a block or organism from atoms when the kit has it
- **`npx agentic-ds-kit init <folder> [--template <pattern-id>] [--force]`**: a new Next app (App Router, TypeScript) that starts from a pattern, or from a blank page with a kit PageHeader. It writes `package.json` (this kit's version, Next 16, React 19), `tsconfig.json` with the `@/*` alias, `next.config.ts`, `.gitignore`, `app/layout.tsx` (kit tokens and layout CSS, icons on demand), `app/page.tsx` rendering the pattern in `<main>`, `AGENTS.md`, `CLAUDE.md`, `.mcp.json` (the kit MCP server) and a short README, then copies the pattern in exactly as `add` does (contract and `requires` included). `--template settings` follows its contract: the page hosts it in the app-shell example (`layout-shell--inset`, copied in too) with a SideNav Settings group built from `SETTINGS_SECTIONS` and the section read from `?section=`. `app/icons-on-demand.tsx` loads `agentic-ds-kit/icons-on-demand` so any Lucide name renders. No install and no network. A folder with files is refused unless `--force`, which only adds missing files. Templates ship in `templates/next-app/`. `add` behaves and prints as before; its logic now lives in `bin/add.mjs`
- Docs site: **Start here** (`/start-here`), for product managers and designers: what Nistha is, pick a starting screen, run `init`, ask Claude or Cursor for changes, example requests, the words we use (template, block, organism, molecule, atom) and when to ask an engineer. First link on the home page and in the Docs nav
- Docs site: a level Badge on component and block pages, and a level filter (`?level=`) in the components gallery that works with the group tabs and search

### Changed

- **AppHeader and SideNav contracts: `compose.blocks` is now `compose.parts`.** If you read the raw contract JSON, read `compose.parts`. The wording "building blocks" is now "compose parts" in the contracts, CLI help, skill, docs and comments, so it no longer clashes with blocks (`kind: "block"`). Component names and exports (`AppHeaderRoot`, `SideNavRoot`, …) do not change

## [0.21.0] - 2026-11-13

### Added

- **Link**: text that navigates. `variant="inline"` (underlined, inherits the sentence's type) or `"standalone"` (on its own line, underlined on hover), `external` (new tab, `rel="noopener noreferrer"`, ExternalLink icon and a screen-reader "opens in a new tab"), and `linkAs` for router links. Contract, docs page and tests included; Button's contract now points navigation to Link
- Cell `tone` and Scorecard `badgeTone` contracts list `primary` and `highlight` (the components already supported them through Badge)
- Contracts document props the components already had: Button `draggable` / `onDragStart` / `onDragEnd`; DropdownMenu `triggerDraggable` / `onTriggerDragStart` / `onTriggerDragEnd`; Input, Select and Textarea `describedBy`; HeaderCell `defaultChecked`; Scoreboard `aria-label`; ShimmerText `style`; ModalCard `role`, `tabIndex` and `aria-modal`
- `agentic-ds-kit/icons-on-demand`: opt-in entry that lets any Lucide icon name render in kit icon props, each loaded as its own chunk
- MCP: `detail` (`summary` or `full`), `limit` and `offset` on `list_components`, `get_tokens` and `questions`; `kind` filter on `list_components`. Paged answers carry `page: { offset, limit, total, next }`
- CLI: `npx agentic-ds-kit --version` (also `-v`)
- Pagination `compact`: icon-only Previous and Next around a "2 of 10" status for narrow screens (screen readers hear "Page 2 of 10")
- `KitLabelsProvider` (with `useKitLabels`, `DEFAULT_KIT_LABELS` and the `KitLabels` type): translate or reword the screen-reader labels the kit writes itself (close buttons, pager and month arrows, picker panels, remove buttons, Chat and MessageActions controls) across 23 components. Pass only the keys you change; the rest stay English. Components' own `ariaLabel` props still win
- Breadcrumb `ariaLabel` (default "Breadcrumb") and Field `helpLabel` (default "Help"), so these server-rendered components can be translated without the provider

### Changed

- The BillingSchedule pattern's next-charge panel is a kit Card (`size="sm"`) with a vertical Divider. Its surface is now the card fill instead of the subtle grey. Re-copy with `npx agentic-ds-kit add billing-schedule --force`
- `contracts/index.json` intents are generated from each contract (84 had drifted); the contract wins
- DatePicker's panel uses `var(--z-overlay)` instead of a fixed `z-index: 20`
- `npx agentic-ds-kit mcp` runs on a small built-in server with no runtime dependencies (MCP protocol **2025-06-18**, tools only; it also answers 2025-03-26 and 2024-11-05 clients). `@modelcontextprotocol/sdk` and `zod` are no longer dependencies, so installing the kit no longer pulls express, hono and the rest of the SDK. Tool names, arguments and answers are unchanged; invalid arguments still return an `isError` result
- **Breaking edge, icons:** a Lucide name outside the bundled set (about 120 common icons, including every name the kit's own components use) no longer loads by default; it renders nothing and warns in development. Pass the Lucide component, or `import "agentic-ds-kit/icons-on-demand"` once to keep the old behaviour. Importing Button now bundles about 110 modules instead of about 1,800
- **Breaking edge, MCP:** `list_components` and `get_tokens` return summary rows by default (no category or usage notes). Pass `detail: "full"` for the previous fields. Answers are compact JSON and no longer repeat the data as `structuredContent`, so they are 3 to 6 times smaller. `questions` still returns the full CLI JSON by default
- `npx agentic-ds-kit add` reads `paths` (and `baseUrl`) from tsconfig.json or jsconfig.json, comments allowed, to print the `@/...` import for both root and `src/` aliases
- Peer dependency is `next >=15` (Next 14 does not support React 19)
- The published package no longer ships source maps: 644 kB instead of 1.1 MB (2.7 MB unpacked instead of 4.4 MB)
- The README states that the package is ESM-only
- Pagination wraps instead of overflowing on narrow screens
- CommentsPanel no longer overflows a 375px screen: a thread's one-line preview truncates instead of setting the panel's minimum width

### Removed

- DropdownMenu `triggerRef` and `triggerProps` are no longer in the published types. They were marked `@internal` (Select's pass-through) and still work at runtime

## [0.20.0] - 2026-11-13

### Added

- `describedBy` on InputOTP, SegmentedControl, RadioGroup and Slider; `labelledBy` and `error` on Slider. Field passes its label id to a Slider so the thumbs are named

### Changed

- Alert titles use the `-fg` tones for contrast; the icon keeps the status colour
- Escape in an open Select or DatePicker inside a Modal, Drawer or AlertDialog closes only the Select or DatePicker. Modal, Drawer and AlertDialog ignore an Escape that a child already handled (`event.defaultPrevented`)
- Escape in an open overlay (ContextMenu, Tooltip, Popover, DateRangePicker, Combobox, MultiSelect, TagInput, AnchorNav, DateTimePicker) closes only that overlay, not a parent Modal or Drawer
- Field no longer adds `role="group"`; RadioGroup's fieldset is `role="radiogroup"` and carries `aria-invalid` instead of each radio
- `aria-invalid` is no longer set on the DatePicker, Select and FileUpload trigger buttons; the error still reaches them through `aria-describedby`
- Modal, Drawer, AlertDialog and ModalCard skip their entrance animation under `prefers-reduced-motion`
- Muted text on tinted AgentInbox and SetupGuide rows uses `--text-fg-muted` for contrast
- NumberTransition, ShimmerText and the TraceWaterfall totals give screen readers visually hidden text and hide the animated part. TraceWaterfall totals now read their value, not "Total time" / "Total cost"
- LineChart, BarChart and UsageMeter use `role="group"` with a label when their points are focusable
- The Modal and Drawer focus trap skips disabled controls and only matches `a[href]`
- The Select trigger has `aria-haspopup` in server-rendered HTML

### Known issues

- Field borders (`--line` / `--border-strong`) are about 1.2:1 against the field fill, below WCAG 1.4.11 (3:1). A darker border was tried and rejected as too jarring; to revisit with a new primitive

## [0.19.0] - 2026-11-12

### Added

- **Blocks**: larger kit components for a whole area of a screen, imported like any component. Their contracts have `"kind": "block"`, a `category` and a `summary`; the MCP returns `kind` and `block`. Twelve ship: AgentOverview, RunDetail, LiveSession, PlanReview, ChangeReview, KpiBoard, UsageBilling, AppDirectory, WorkBoard, ActivityFeed, Plans and LogoStrip
- Selection props on AgentTrail, AgentTree, AgentSteering and Chat; a selected state on Scorecard; `aria-expanded` on AgentInbox rows

### Changed

- LineChart draws smooth lines by default (`curve="linear"` keeps straight segments)
- AgentMonitor's step strip gives every step the same width

### Deprecated

- AgentMonitor `weight` is ignored

## [0.18.0] - 2026-11-12

Polish release. No prop or API changes.

### Changed

- Cell and HeaderCell are tighter (sm 40px, md 48px), so DataTable rows are shorter
- A single-series BarChart paints every bar in the first palette colour unless a datum sets `color`; chart gridlines are fainter
- AgentInbox and NotificationStack drop the unread dot (unread rows stay bold); AutonomyDial drops its tick dots
- LoadingAnimation, Timeline's Now step, AnchorNav's selected link, FilterButton's count and the Slider thumb follow the brand colour
- AppNav's active fill uses `--surface-brand-subtle`, as SideNav does

### Fixed

- AgentLanes handoff lines, FileUpload row alignment and touch targets, AgentMonitor touch targets, UsageMeter's chart and ExperimentCard's variant letters

## [0.17.0] - 2026-11-11

### Added

- Copy-in patterns `settings` (Billing, Profile, Team, Notifications and Security sections) and `onboarding` (four steps plus error and submitting states)
- `layout-shell--inset` layout class: the canvas frames the nav and the page floats on an inset panel
- `--sidenav-divider` variable on SideNav; the default SideNav look is unchanged

### Changed

- `npx agentic-ds-kit add <id>` also copies the patterns a pattern builds on

## [0.16.0] - 2026-11-10

### Added

- Motion components: BlurCrossfade (crossfades a value or state; the one approved use of `filter: blur`, off under reduced motion), TextReveal, TiltCard, GridBackground and GradientText (ink, brand and inverse tones). All opt-in; no existing component animates differently

## [0.15.0] - 2026-11-10

### Added

- 22 agent components, each with a contract the MCP lists: ApprovalCard, AgentTrail, AgentPlan, AgentFleet, ToolCallCard, PermissionRequest, RunningNow, AgentMonitor, AgentTree, AgentLanes, AgentInbox, DecisionCard, AutonomyDial, AgentSteering, ModelPicker, ContextWindow, CitedAnswer, MessageActions, InlineDiff, MemoryPanel, TraceWaterfall and UsageMeter
- 10 SaaS components: ChangeSummary, CommentThread, CommentsPanel, ExperimentCard, IntegrationPicker, InvoiceDocument, NotificationStack, PricingPlans, SetupGuide and TaskBoard
- Copy-in patterns `billing-schedule` and `integration-settings` (`npx agentic-ds-kit add <id>`)
- DateRangePicker can show two months

### Fixed

- Avatar fill on canvas, the CodeSnippet tab inset and ProgressSteps colour

Nothing is removed or renamed.

## [0.14.0] - 2026-11-10

### Changed

- The Nistha look is the default: Electric Blue primary on cool Slate neutrals, and info follows the brand blue. To keep the previous black look, set `data-color="ink"` on `<html>`
- Page titles are 700 with tighter tracking; overlines, table heads and nav group labels are Plex Mono caps
- A selected DataTable row uses `--action-selected`

### Added

- `--primary-fg` token for brand text on light blue fills

Token names and component props are unchanged.

## [0.13.0] - 2026-11-07

### Added

- `npx agentic-ds-kit mcp` starts a read-only stdio MCP server so agents can query the installed contracts, tokens, patterns, rules, and questions output

## [0.12.0] - 2026-11-06

### Added

- SegmentedControl: one choice in a joined track, controlled or uncontrolled, sm or md, optional icons, `role="radiogroup"` with roving tabindex and arrow keys
- TileGroup: selectable cards for a plan or option picker, single or multi select, with title, description, a price or meta slot, and checked or disabled tiles
- Kbd: a shortcut chip for one key, placed in a row for a chord
- Customize panel slots for interface, heading, and mono fonts, a neutrals scale, a spacing scale, and shadow intensity, each writing the existing CSS variables

### Fixed

- `agentic-ds-kit questions` writes its JSON with a blocking stdout write so the catalog is not cut off when it grows past the pipe buffer

## [0.11.0] - 2026-11-06

### Added

- Combobox, DateRangePicker, NumberInput, CurrencyInput, MultiSelect, TagInput, AnchorNav, FilterBar, Popover, ContextMenu, Resizable, TimePicker, and DateTimePicker

### Breaking: removed patterns

- Inbox (`inbox`), Activity (`activity`), Invite (`invite-members`), Delivery (`delivery`), and Assistant (`assistant-workspace`). They were too app-specific.

## [0.10.0] - 2026-11-06

Cards-inspired restyle of tokens, type, radius, and shadow, plus playground theming and a follow-up of live studio controls.

### Added

- Font roles (`--font-heading` / `--font-body`, aliases of `--font-display` / `--font-sans`) and a `data-font` switcher (Inter, IBM Plex, Geist, system)
- Copy prompt for AI from the active tokens and contracts catalog
- Token `useWhen` / `doNot` / notes via `packages/kit/tokens/usage.json`
- Primary hex → ramp, with Ink / Blue / Violet / Teal shortcuts and a coherent dark pair
- Live `--radius-base` and `--shadow-sm` controls in `/studio`
- `delivery` pattern (Scoreboard + Timeline + members DataTable)
- Playground `/studio` for live token controls
- Badge `appearance`: `soft` | `tint` | `solid` | `outline` (default `soft`)

### Changed

- Semantic tokens follow Cards: canvas / subtle / tray / surface / raised / floating ladders, type ladders, radius derived from `--radius-base`, soft shadow scale
- Playground light/dark and color presets
- Old token names (`--surface-page`, `--text-primary`, `--action-primary`, numbered radius/shadow) remain aliases

### Breaking

**Button** no longer takes `variant: primary | secondary | tertiary | danger`. It is now `appearance` × `mode`, with an optional `flat` set:

| 0.9.0 | 0.10.0 |
| --- | --- |
| `variant="primary"` | `appearance="solid" mode="primary"` |
| `variant="secondary"` | `appearance="outline" mode="neutral"` |
| `variant="tertiary"` | `appearance="ghost" mode="neutral"` |
| `variant="danger"` | `appearance="solid" mode="danger"` |

`appearance`: `solid` | `outline` | `soft` | `ghost`. `mode`: `primary` | `neutral` | `danger`. `flat` removes elevation (combine with solid, outline, or soft; ghost is coerced to soft). Sizes stay `lg` | `md` | `sm`. One `appearance="solid" mode="primary"` Button per view.

**Badge** now has `appearance: soft | tint | solid | outline` (default `soft`). Tones: `neutral | primary | brand | success | warning | danger | info | highlight` (`brand` aliases `primary`).
