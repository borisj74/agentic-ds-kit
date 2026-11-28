# Changelog

All notable changes to `agentic-ds-kit` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.31.0] - 2026-11-28

A UI polish pass across components, blocks and patterns, a refreshed Command palette with flat Kbd chips and Keycaps built on Kbd, and a catalog cleanup. The docs site now serves `/llms.txt` built from `contracts/index.json`, the four deprecated pieces are hidden from default lists, and the MCP `get_component` tool reports each piece's `status`.

### Added

- **DropdownMenu radio groups.** A group with `selection: "radio"` renders `menuitemradio` rows with `aria-checked`; `selected` marks the one chosen.
- **DropdownMenu typeahead.** Typing letters in an open menu moves to the next item whose label starts with them.
- **Command `description`, `keywords`, `loading` and `onAsk`.** Items can show a one-line description after the label, search also matches descriptions and hidden keywords, `loading` shows a Spinner row and sets `aria-busy`, and `onAsk(query)` adds an Ask Chat row that stays when nothing matches.
- **Command key footer and live result count.** A footer shows ↑↓ Navigate, ↵ Open and (inside a Modal) Esc Close; a polite live region reads "3 results" after each search. New KitLabels keys: `navigate`, `openItem`, `resultCount`, `loadingResults`, `ask`, `askHint`, `askAbout`.
- **Table `rowActionsAs="icons"`.** Row actions can show as icon-only ghost Buttons (each named by its `ariaLabel`) instead of the row menu. The column stays 56px with no header text, so a `footer` total stays under its column. Default is still `menu`.
- **`agent-permissions` pattern** (copy-in: `npx agentic-ds-kit add agent-permissions`). What each agent may do on its own, as a page: AppHeader, a PageHeader with Ask, the waiting kit PermissionRequest first (Grant / Deny, then one line), "What agents may do" as a Table with each level as an icon and a word and a ghost Edit (none on a level set by workspace policy), a Card with a Switch that makes every action ask first, and an AutonomyDial for the default level of new actions. Edit opens a kit Drawer with a card RadioGroup and, for "Up to an amount", a CurrencyInput under the group. Below 640 the nav opens in a Drawer from a Menu button, the Table becomes a drill ListView, Edit opens from the bottom and the dial is left out. Northwind demo data; preview views: default, edit-drawer, granted, denied, error and 390. It uses the new PermissionRequest `badge` and `summary` and the new ListView `valueIcon` and `note`.
- **PermissionRequest `badge`.** A warning Badge with a Hand icon on a row above the title, like "Needs you", with `requestedAt` beside it. The scope count is left out on that layout.
- **PermissionRequest `summary`.** A strip of two to four `{ label, value }` cells under the description (a `dl`), like Changes / For / Still asks. Columns when the card is wide, label and value rows under 40rem.
- **ListView `valueIcon`.** A quiet, aria-hidden Lucide icon before an item's `value`, like a level icon next to "Up to $250".
- **ListView `note` and `noteTone`.** Short text at the end of the secondary line after " · ", like "$500 asked", read in the row name; `noteTone` colours only that part.
- **settings-form `header={false}`** drops its PageHeader, so the form can be the body of a page that has its own header.
- **FieldSet `layout="side"`.** The legend and description sit in a fixed left column with the fields to their right, and stack when the FieldSet is under 40rem wide. The description is now linked to the group with `aria-describedby`.
- **Alert `children` is optional, and `action` takes `appearance: "outline"`.** A page Alert keeps its tinted box with an outline action when the page already has its solid primary, like an error summary above a form with Save. Leave out `children` when the title says it all.
- **AlertDialog is a bottom sheet below 480px.** It docks 40 from the bottom at full width, with Cancel and the action stacked full width at lg 40, Cancel on top. Focus still starts on Cancel.
- **UsageMeter `compact` and `upgradeLabel`.** `compact` is one block for a settings page: title, badge and Upgrade on one line, then "used of limit · reset · pace", the meter and the categories in a row, spanning its container. Under 40rem the categories drop and Upgrade goes full width below the meter. `upgradeLabel` renames the Upgrade button (default "Upgrade plan").
- **Settings has a personal Sign-in page.** A new `"sign-in"` `SettingsSection` value under the You group, with its own `SETTINGS_SECTIONS` entry, index row and screen view. It holds your password and your two-factor Switch, which moved out of Security. `twoFactor` now drives this page.
- **AppShellPattern has two looks: `layout="inset"` (default) and `layout="flat"`.** Inset puts the nav and top bar on the page background and the page in a raised card. Flat puts the nav on the surface with a hairline edge and runs the page edge to edge on the subtle background, led by the brand, a subtitle line and search.
- **AppShellPattern sidebar search and command menu.** `search` adds a search field under the brand, in both layouts. Clicking it or pressing ⌘K (Ctrl+K) opens the kit command menu (Command in a Modal). On the collapsed rail it becomes an icon button with a tooltip. `subtitle` adds one muted line under the product name.
- **AppShellPattern notifications as a nav row.** `notifications` makes Notifications the first nav row, with its unread count. It opens a panel at the sidebar's edge, over the page, with Tabs (such as Notifications and Requests), a list, an empty state and a settings button. On the collapsed rail the count is a dot; on small screens the panel opens as a full-height drawer. No notifications control sits in a top bar.
- **AppShellPattern workspace switcher and quick actions.** `workspace` puts a workspace switcher (mark, name, chevron, menu) in the nav's top row beside the collapse button. The search row reads "Quick actions" with a ⌘K hint, plus a small search button beside it.
- **SideNav.Item `renderControl`.** Wraps a row's control, for example to anchor a Popover on it, the compose twin of the preset's `renderItem`.
- **AppShellPattern rail collapse.** A toggle after the logo and title in the top bar (`AppShellPattern.RailToggle`), lined up with the nav's edge, shrinks the side nav to icons, with each label in a tooltip. Collapsed, the top bar shows only the logo, which turns into the expand toggle on hover or focus. The state is remembered for the browser session; `collapsed`, `defaultCollapsed` and `onCollapsedChange` control it.
- **AppShellPattern `projects` and `account` props.** `projects` adds a short "Projects" group with a "New project" row to a props nav. `account` puts the signed-in person (avatar, name, and a role or email) at the bottom of the nav with a menu for actions such as Settings, Theme and Sign out.
- **AppShellPattern work panel.** `workPanel` adds an optional right panel with Tabs, off by default, fixed width and closable. `AppShellPattern.PanelToggle` opens it. Below the breakpoint it opens in a right Drawer.
- **AppHeader `--appheader-title-size`.** A new cssVar for the product title size, defaulting to `--type-size-heading`. AppShellPattern sets it to `--type-size-ui-lg`, so the product name stays quieter than the page title.
- **BillingSchedule component.** One customer's billing schedule in a kit Card with its own header, exported from `agentic-ds-kit`. One closed prop, `view`: `full` (every charge in one Table, the next charge marked in words), `nextOnly` (the next charge, Pays with and Change card) or `failed` (the open failed payment as a danger Alert with Update card, over the charges still owed). Each view has its own empty, loading and error states. It takes the same `Charge` and `NextCharge` data as the billing-schedule pattern, and exports both types.
- **Charts take `actions`.** LineChart, BarChart, ComboChart, Heatmap, PieChart and ScatterChart put kit Buttons in their header before the Table toggle, for example an icon-only Ask.
- **Card header actions can be icon-only, and there can be two.** `headerAction` takes one action or an array of up to two; more are ignored, with a warning in development. `iconStart` adds an icon, and `iconOnly` makes it an icon-only Button named by `label`.
- **ListView rows take `dot` and `meta`.** `dot` is a small status dot in the leading slot, and its tone (Note, Good, Warning, Problem, Info) is read as part of the row name. `meta` is short muted text at the row end (like "2h ago"), also read in the row name.
- **LineChart `referenceLine`.** A labelled dashed guide at a value (like a goal or last period's average). The value axis widens to include it. `highlight: "above" | "below"` marks points of solid series past it with an accent dot; the table and point names say so.
- **LineChart dashed series.** A series with `dashed: true` draws as a dashed line with no fill and a dashed legend swatch, for comparing against the previous period.
- **ComboChart `stack="stacked"` and four bar series.** One bar per column: positive values pile up from zero and negative values pile down, so gains and losses sit either side of the baseline with the net as the line.
- **Chat takes a `context` chip.** Pass `context={{ label, onRemove? }}` to show what the next message is about (for example a chart card and its period) as a kit Tag above the composer. The composer is described by it ("Asking about …") for screen readers, and `onRemove` makes the Tag removable. New kit label `chatContext`.
- **Chat `embedded`.** Inside a host that already has a title, an edge and padding (a work panel tab, a Drawer), Chat drops its header band, outer border and side insets and fills the host's height, with the suggestions lined up to the thread text. `title` still names the section.
- **Tabs `fill`.** The tab panel takes the height left under the tab list, so a full-height child can reach the bottom.
- **The docs site serves `/llms.txt`.** It lists Foundations and every non-deprecated component, block and pattern with its contract intent and docs URL, built from `contracts/index.json` at build time.
- **The MCP server ships the prototype-from-kit skill.** `npx agentic-ds-kit mcp` publishes it over Skills over MCP (`skills/list`, `skills/get`, `resources/read` on `skill://prototype-from-kit/SKILL.md`), read from the installed `skills/prototype-from-kit/SKILL.md`. Claude Code picks it up with no copy step. Clients without skills see the same tools as before.
- **Scoreboard can be a metric picker.** `selectable` turns the strip into a radiogroup (arrow keys, Home/End, one tab stop) with `value`, `defaultValue` and `onValueChange`. Each item's `id`, or its label, is its value.
- **Scoreboard `appearance="divided"`.** Plain values in one row with thin rules between them. They stack below about 38rem.
- **Scorecard `sparkline`.** A small decorative trend line under the value, in `--chart-1`. Scorecard also takes `appearance="plain"` (no frame) and `selectionRole="radio"` (role radio instead of aria-pressed).
- **Scorecard has three new looks: reference, expressive and meter.** `sparklineVariant="reference"` adds an area fill, a faint grid, a dashed `reference` line with its label, darker dots on the last `highlightLast` points and start and end dates (`sparklineDates`). `sparklineVariant="expressive"` draws a smooth curve with a soft area, a dashed previous period (`compare`, in `--chart-5`) with a This period / Previous legend, and the latest point's value in a small tag on its end dot. `meter={{ value, max, label, direction }}` swaps the line for a calm kit Meter bar toward a target, or under a limit with `direction: "lower"` (past the limit it turns amber and says Over limit). The plain line stays the default, so existing cards don't change. Scoreboard passes each look through per item.
- **Card `headingLevel` (1–4, default 2) sets the title's heading element.** Use 1 when the card title is the page heading, such as a Sign in card, or 3 or 4 under another heading. The title looks the same at every level.
- ListView rows take a `value` string, like an amount, shown on the right of the name in tabular figures with meta and the badge under it. It joins the row's accessible name.
- ListView groups take a `total` string shown on the right of the group header.
- **SaveBar** is a new kit component for form pages. It sticks to the bottom of main, says what is unsaved ("2 unsaved changes" plus the field names), when it was last saved or why the save failed, and holds Discard and Save changes as the page's one solid primary. States `saved`, `dirty` and `error`; `saving` shows Save's spinner. Under 30rem of width it stacks and the buttons go to lg 40.
- **Field `changed`** adds the word "Edited" with a Pencil icon beside the label for a value not saved yet. Put the old value in `hint`.
- **KitLabels `edited`** ("Edited") is the word Field shows for `changed`.
- **ApprovalCard `variant="compact"`.** For AgentMonitor's waiting state only: one row with the title (and the countdown when set), one line of description, the exact command or diff with its tag, and small right-aligned Deny and Approve with their key chips (Esc, ⌘⏎). No risk Badge, heading or facts; the risk is read to screen readers with the title. The default card is unchanged.
- **ApprovalCard `waitingSec` (compact only).** Seconds the agent has already waited, shown as "waiting m:ss" in the title row and counting up while pending; hidden when left out. AgentMonitor passes it from `pendingAction.waitingSec`.
- **Alert `action.icon` and `secondaryAction.icon`.** An optional leading Lucide icon on an Alert's buttons, such as RotateCcw on Retry. It is aria-hidden; the label still names the action.
- **`topBar` on AgentActivityPattern and AgentPermissionsPattern.** Default `true` keeps today's page with its own AppHeader and narrow nav Drawer. Set `topBar={false}` to put the page inside your app shell; it then renders only its `main`.
- **RunningNow `idleText`.** When nothing runs and you know when the last run was, `idleText="Idle · last run 2h ago"` shows that line with no count on the label and no clock icon. It takes the place of `emptyText` and is ignored while items run or load.
- **`--bg-tray-floating` token.** Fill for a highlighted row on a floating surface such as the Modal card. Same as `--bg-tray` in light; one step above `--bg-floating` in dark, where tray and the card are the same colour.
- **Table `rowTone`.** `(row, index) => "default" | "highlight"`. A highlighted row is a rounded shape (`radius.surfaceSm`) tinted with `status.infoSubtle` and edged all round with `status.infoBorder`, in table and stacked layouts, with or without row dividers. Use it for the one row a person should look at first, and say why in the row's own text. It adds no ARIA state and is not selection.
- **Table `rowDividers`.** `"default" | "none"`. `none` drops the lines between body rows (the header and footer lines stay), rounds the hover tint and makes the header compact: labels 8px over the header line, then 12px before the first row. For short lists inside a Card.
- Accordion `type` (`single` or `multiple`, default `single`); `defaultOpen` also takes an array of ids.
- Accordion items take optional `meta`, `count` and `disabled`, and `content` can hold kit pieces such as a Field or Table.
- Accordion headers move with the arrow keys: Down and Up between headers, Home and End to the ends, Right opens, Left closes. Disabled items are skipped.
- **ActivityFeed `variant="agent"`.** An agent's steps on the shared history rail, with an Avatar marker per step and a time column when wide. Each event is `{ id, at, actor: { id, name, initials? }, sentence, meta, reason?, undo?: { until, onUndo }, state?: "undone" | "final", note? }`:
  - `sentence` is the step as one sentence, `meta` is agent · app · task · who allowed it, and `reason` is one plain line on why.
  - `undo` shows an sm Undo Button with a mono deadline ("14:22 · 8 min left") until `until`.
  - `state: "undone"` strikes the sentence and adds an Undone Badge; `state: "final"` adds a Lock Badge Final. `note` says who undid it, or what to do instead.
  - No built-in filters and no visible heading: put it in a Card under the page's PageHeader and a FilterBar. Load more reads "Load earlier days".
  - Below 40rem the time joins the meta line, and Undo (with its deadline) or the Badge (with its note) moves under the copy.
  - `feed` and `history` are unchanged.
- **`agent-activity` pattern** (copy-in: `npx agentic-ds-kit add agent-activity`). AppHeader, a PageHeader with Ask, a FilterBar (Agent, Allowed by, App) with the step count, and ActivityFeed `variant="agent"` in a Card. Undo strikes the step and a Toast confirms it. Empty (filtered) and load-error states. Below 640 a Menu IconButton opens the app's nav in a Drawer.
- **AutonomyDial `savedAt`.** Pass a time and the panel note reads "Saved 14:01" with a check.
- **AgentSteering `pauseNote`.** A footer hint that says what Pause does, for example "Pause finishes the draft, sends nothing". It also describes the Pause button.
- **MemoryPanel `usedLabel`.** Rename the "Used here" badge, for example "Used for this reminder".
- **ApprovalCard `facts`.** An optional `{ label, value }[]` says what will happen and why the risk is what it is (e.g. Will do / Why medium), as a `dl` above the exact command or diff.
- **PermissionRequest scope `limit`.** Each scope can say how far the access goes, e.g. "$500 per refund".
- **DecisionCard option `disabled` and `disabledReason`.** A disabled option stays in the list and says why instead of disappearing.
- **RunningNow `onStop(id)`.** Running and waiting items get an icon-only Stop named "Stop <name>", beside the item.
- **AgentPlan `steps[].calls` and `trace`.** A step's tool calls show under it as one ToolCallCard group row, and `trace` takes a compact TraceWaterfall in the header for time and cost so far.
- **TraceWaterfall `spans[].stepId`.** Spans group under their plan step heading.
- **CitedAnswer `emptyText`.** An answer with no citations now says so ("No sources. Check before you act on this.") under the text. Pass `""` to hide it.
- **MessageActions `selectedReason`.** The picked reason's toggle Button is pressed and the thanks line names it ("Thanks, noted: Source is wrong").
- **AssumptionLog `limit`.** Long lists show the weakest 5 with "Show n more"; `limit={0}` shows every row.
- **GuardrailLog event `summary`.** A one-line "what happened and why" becomes the row title; rule, agent and time drop to the caption.
- **RedactionPreview `status="error"`, `errorText`, `onRetry`, `layout` and `keepLast`.** A failed send keeps the card, says nothing left the product and offers Try again. `layout="split"` shows Before and After side by side (After first on a narrow card). `keepLast={{ card: 4 }}` sends a card as "[Card number •••• 4242]".
- **`AgentStatus` and `toAgentStatus()`.** One status language for agents and runs: queued, running, needs-you, paused, done, failed, drawn as an icon plus the word. `toAgentStatus()` maps the older words (waiting and approval to needs-you, idle and pending to queued).
- **AgentOverview: `view`, `defaultView`, `onViewChange`, `onReview`, `onAsk`, `onNewTask`, and `status`, `now`, `cost`, `subAgents` on each agent.** List is the default view; Timeline renders AgentLanes on wide blocks only.
- **ListView: `actionLabel` on a row action.** The button's accessible name when the visible label is not enough, e.g. visible "Review", read as "Review Tax checker". Leave it out and the button keeps its visible text. AgentOverview rows use it.
- **RunDetail: `messages`, `onSend` and `thinking`.** An Ask panel (kit Chat) under the trail to ask or steer the agent on the run.
- **Alert has a header, actions and an inline placement.** The header reads `Warning · Billing`: the tone word, then `eyebrow`, with `timestamp` and Dismiss on the right. New props: `eyebrow`, `timestamp`, `onDismiss` (a Dismiss Button), `action` and `secondaryAction` (`{ label, onClick }`, rendered as kit Buttons), and `placement="inline"` for a neutral card surface. `placement="page"` is the default and keeps today's tinted look unless you set `eyebrow`, `timestamp` or `onDismiss`.
- **Toast has `size`, `progress` and `timestamp`.** `size` is `sm`, `md` (default) or `lg`. `progress` (0 to 100) shows a progressbar and keeps the toast open; clear it and switch to `status="success"` when the work ends. `timestamp` shows next to Dismiss.
- **KitLabels keys `info`, `success`, `warning` and `danger`** for the Alert tone word (English: Info, Success, Warning, Error).
- **Chat `loading`** (boolean, default false). While the data the assistant reads is loading, the guided empty state keeps the greeting and intro, shows kit Skeleton rows in place of the suggestions, and the composer and Send are disabled. The section gets `aria-busy="true"`. When no `placeholder` is set, the composer reads "Available when your data loads" (a default like the existing "How can we help you?", not a KitLabels key).
- **Chat `suggestionLayout`** (`"list"` default, or `"grid"`). `grid` shows object suggestions as md outline Buttons with their icon, two columns when there is room and stacked when narrow, under a plain "Suggested" caption. The hint is not shown in `grid`. Both layouts send the label.
- **Chat `summary`** (string). One mono line under the intro for the key figures, like "October MRR $184,320  -3.1% vs September".
- **Chat `composerLabel`** (string). A visible label over the composer input that names it instead of the placeholder. In the guided empty state the labelled composer moves under the greeting, above the suggestions (8 and 16 apart, 32 under the greeting), and an embedded Chat is then as tall as its content. Once the thread has messages, the composer is at the foot again, and focus moves with it to the foot input.
- **`assistant-start` pattern** (copy-in: `npx agentic-ds-kit add assistant-start`, requires `app-shell`). The app-shell example's flat chrome (SideNav when wide, the nav in a Drawer from an "Assistant" top bar when narrow), then a centred `--grid-width-sm` column: Chat `embedded` with greeting, intro, mono figures, the labelled composer and a 2×2 grid of suggestions, then a Connected apps Card (Ask in the header) with a ListView of sources: Stripe Connected, QuickBooks Sign-in expired with Reconnect. Ready, Loading and Reconnect failed states. After the first send, the thread fills the page and the Card leaves.
- **Delta atom.** How a value moved: an arrow and the signed change (`+$600`, `−$90`, `No change`) in success, danger or neutral text, with no fill. `direction` up, down or flat; `tone` overrides the colour when a rise is bad news. `goodWhen` (up or down) judges the move: the text reads `Better · +6.3 pts` with CircleCheck or `Worse · +17%` with TriangleAlert, and only Worse is coloured. New KitLabels keys `better` and `worse`.
- **Avatar `shape` and `presence`.** `shape="square"` for organisations (customers, workspaces). `presence` online, away or offline draws a corner mark with its own shape and adds the word to the accessible name; the words come from new KitLabels keys `online`, `away`, `offline`.
- **Avatar and AvatarGroup sizes `xs` (20) and `xl` (48).**
- **Count `prefix="+"`** for overflow counts (+3). Visual only; screen readers hear the count and label.
- **KitLabels `moreAvatars` and `moreSelected`** for the AvatarGroup +N name ("3 more") and the MultiSelect overflow ("2 more selected").
- **Badge `icon`.** Optional leading tone icon (CircleCheck for Paid, CircleX for Overdue). Plain role labels stay without one.
- **BarList can show a share, a change and an icon per row.** `scale="total"` sizes each bar as its share of the sum and writes the share (33.0% of total) at the start of a new meta line. Per row, `previous` adds a change Badge that says Up 12.2%, Down 3.8% or No change, `media` puts a small icon in a 24px tile before the label, and `meta` adds a muted second line.
- **`--control-height-sm`, `--control-height-md` and `--control-height-lg` tokens** at 32, 36 and 40px. Button, IconButton, FilterButton, Input, Select and the other one-line fields take their height from them, so controls of one size line up in a row.
- **Button `loading`.** It sets `aria-busy`, shows a spinner in the leading icon slot, keeps the label and ignores clicks. The button stays focusable.
- **`IconButton`.** A typed export of Button for icon-only actions: `icon` and `ariaLabel` are required. It renders Button, so it looks the same.
- **`SplitButton`.** A main action joined to a chevron that opens a kit DropdownMenu of related actions, like Save invoice with Save and send. FilterButton stays the split control for filters.
- **Card has a header row, a source line and Ask.** New optional props: `icon`, `eyebrow`, `meta` and `onDismiss` put an icon tile, a grey label, a timestamp and an X above the title. `source` adds a grey line under the body. `onAsk` with `askLabel` adds a neutral Ask button with MessageCircle on the left of the footer.
- **ChangeSummary can narrate a period.** New optional `summary` (a headline sentence above the rows), `groupBy: "sentiment"` (Better, Worse and Steady groups, each with a count in a kit Badge), `why` on each item (a one-line reason under the values, also read out with the row) and `onAsk` (an Ask in Chat Button). With `summary` and no items, the card shows a quiet month instead of the Empty state.
- **LineChart `highlightLast`.** A dot and a value chip on the latest point of the first solid series.
- **LineChart `changeStrip`.** A short bar strip under the plot on the same labels, like net change per day. Square bars go up for gains and down for losses in one colour, on their own scale. It shares the crosshair and tooltip and adds a legend item, a table column and a part of each point's accessible name. The default format is signed with a real minus sign (+1,200, −1,600).
- **`error` and `onRetry` on LineChart and ComboChart.** The plot is replaced by the kit's "Couldn't load" row with Retry.
- **`tooltipNote` on LineChart and ComboChart.** One sentence under the tooltip rows for a sample, like "The largest one-day drop in 30 days."
- **ComboChart `isLoading` and `emptyLabel`**, the same as on LineChart.
- **Chat answers can show the figures they quote.** Assistant messages take `parts` (metrics as Scorecard sm, a Table sm, a small LineChart area, a sources line and follow-up pills that send), and `steps` that collapse into one "3 steps · 2.4s" row.
- **Chat shows its work.** `thinkingSteps` draws a live step list while thinking, `onStop` swaps Send for Stop, and messages take `status: "streaming"` (caret and a placeholder for parts still coming) or `status: "error"` with an `error` card that offers Retry and Copy details.
- **Chat has a guided empty state.** `greeting`, `intro`, rich `suggestions` (`{ label, hint, icon }`, shown as LinkList rows), `recent` (ListView; a row sends its question again unless it has `onSelect`) and `recentEmptyLabel`. Plain string suggestions work as before.
- **DatePicker, DateRangePicker and DateTimePicker have an lg size (40px), like Input.**
- **DatePicker and DateRangePicker take `weekStart` (0 Sunday, 1 Monday) and `isDateDisabled`.** Days turned off, and days outside minDate/maxDate, are struck through and read as unavailable.
- **DateTimePicker takes `minDate` and `maxDate`.**
- **DateRangePicker has typed start and end fields in its footer.** A valid, available day updates the pending range. New KitLabels keys: `startDate`, `endDate`, `rangeTo`.
- **Empty `kind`**: `no-data`, `no-results`, `first-use` or `permission`. It sets the default icon and the role (role=status for all but first-use, which gets the brand tile). Failures are not a kind; use LoadError.
- **Empty `size`**: `sm` (in a chart, list or table cell; bare 16px icon, the title is a sentence, no heading), `md` (default, a card body, 32px tile) and `lg` (a page, 40px tile, heading-5 title).
- **LoadError is a public component** with `message`, `reference`, `onRetry` and `size` (sm, md, lg). role=alert. After a retry that fails again, focus returns to Try again.
- **KitLabels `tryAgain`** ("Try again") for the LoadError button.
- **Scorecard `goodWhen` ("up" | "down").** With trend up or down the delta reads "Better · +6.3 pts" or "Worse · +17%", with CircleCheck in success or TriangleAlert in danger, so a rising cost never reads as good news by colour alone. `deltaTone` still overrides the colour.
- **FileUpload has `variant="compact"`.** The Choose files Button and the limits line on one row, for drawers and tight forms. Dropped files still land. `variant="zone"` is the default.
- **TagInput has `size="lg"` and `maxTags`.** lg is the 40px frame, matching Input and Button. `maxTags` shows a count such as `3/8` at the end of the field and blocks adds past it with a message.
- **KitLabels keys `tagExists`, `tagLimit`, `tagCount` and `removeTagHint`** for the TagInput duplicate, limit, count and Backspace messages.
- **Select takes `size="lg"`** (40px), matching Input and Button lg.
- **Field takes `optional`, `required` and `success`.** `optional` adds a muted "Optional" after the label (KitLabels `optional`). `required` sets `aria-required` on Input, Textarea, Checkbox, Switch and ColorPicker, with no asterisk. `success` shows a CircleCheck message, e.g. "Email verified."
- **Field accepts NumberInput, CurrencyInput, MultiSelect and TagInput** as its control.
- **insight-stack pattern** (`npx agentic-ds-kit add insight-stack`). A ranked AI summary in one card, built from kit parts: an eyebrow, time and X, a title and source, then the findings as an ordered list. Each finding has a rank Count, a change and a one-line detail. A signed change uses Delta with `tone` and `goodWhen`, so churn reads `Worse · +2.4 pt`; an unsigned amount like `$1,360` is tone-coloured text. A Why? toggle opens a confidence Meter and the evidence. `loading` shows Skeleton rows with no X or footer. No findings gives the compact all-clear card. The footer has See all (`onSeeAll` or `seeAllHref`) and Ask (`onAsk`), both outline sm Buttons with your labels. Sizes sm 320, md 384 and lg 448. InsightCard stays as it is for one finding.
- **KitLabels `why` and `confidence`** ("Why?", "Confidence") for the insight-stack toggle and its Meter.
- **Section `icon`.** A 40px tile with a 20px Lucide icon left of the heading, such as a provider mark. Decorative (aria-hidden).
- **Card `badge`.** One kit Badge right under the title, 4 below it, such as a connection status.
- **UsageMeter `overage`.** Pass `{ rateLabel, amount }` and, past the limit, the warning and the meter's name say the rate and what is billed so far. The badge reads Over limit.
- **UsageBilling `upcoming` and `plan.fit`.** The next invoice shows as an InvoiceDocument estimate beside the other limits, and the plan card can say whether the upgrade plan covers this period.
- **InvoiceDocument `status="estimate"`, `period` and `onPay`.** Estimates read Estimated total and cannot be paid; `onPay` puts Pay {total} as the solid primary for the customer's view.
- **PricingPlans `fit`.** One line per plan on how it covers current usage.
- **ListView `flush`.** Rows meet the list's edges: square, with a 1px rule between rows, text inset 16 (xs, sm, lg) or 24 (md), and a plain icon at its own size. At md the lines are 14/20 and 12/16 with 2 between them, so a two-line row is 62. A selected row fills edge to edge and gets a 2px brand edge on its start side. Off by default, so existing lists look the same.
- **ListView item `metaTone` and `iconTone`** (`"neutral" | "danger"`). Danger colours the meta text (like "17 days late") or the leading icon (like a declined payment). The words must still say the problem.
- **ListView size `lg`.** Touch-size rows: 16/24 primary and value, 14/20 secondary and meta, 4 between the lines, inset 16. For a phone record list.
- **SegmentedControl `fullWidth`.** The track fills its container and the segments share it equally; a segment never gets narrower than its label.
- **ListView has an xs size, row priority and a primary row action.** `size="xs"` gives compact 40px rows for dense cards. `item.priority` (`high`, `medium`, `low`) shows a bar marker and starts the secondary line with the word, and `sort="priority"` orders rows by it. `item.primaryAction` shows one outline Button in a fixed-width slot so verbs line up, with the other actions in the row menu.
- **DataGrid number and money columns.** `type: "number"` and `type: "money"` are end-aligned with tabular figures; money shows decimal strings in `currency` (default USD).
- **DataGrid computed columns.** `compute: (row) => string` makes a read-only, derived column such as Amount = Qty × Unit price. It is not a formula editor, and there is still no `formula` type.
- **DataGrid cell validation.** `validate: (value, row) => string | undefined` rings that cell in danger with an icon, sets `aria-invalid` and ties the message to the cell ("Qty, row 3: enter 1 or more · left out of the total"). `errorSummary` adds a "1 line needs a fix" status line.
- **DataGrid totals footer.** `totals: (validRows) => { label, value, emphasis?, narrowLabel? }[]` renders Subtotal, tax and Total in `tfoot`, from the valid rows only.
- **KpiBoard `goodWhen` and per-range `hint`.** Metrics pass `goodWhen` to the kit Delta so deltas read Better or Worse; a range value can carry its own hint, such as "vs Oct".
- **Modal, AlertDialog, Drawer and ModalCard take `eyebrow`, `tone` and `footerStart`.** The header shows a tone icon and status word with the eyebrow (Warning · Integrations) next to Close; `footerStart` puts Ask or a count on the left of the footer actions.
- **AlertDialog `consequences` and `confirmText`.** List what happens under the description, and make the person type a name before the action turns on. Focus starts in that field.
- **NotificationStack items take `group` and `action`.** `group` ("Today", "Yesterday") gathers items under a heading; `action` adds one outline sm Button under a row, for events that need a decision such as Retry payment.
- **CommentThread takes `members` for @mentions.** Typing @ in the composer opens a member list above the field (arrows, Enter to insert, Escape to close). `@Full Name` of a member or anyone in the thread now reads as brand text.
- **CommentsPanel `inline="auto"` docks the panel beside the page from `--grid-breakpoint-lg`.** Below that, the same trigger opens the Drawer. Closing the docked panel brings the trigger back and moves focus to it. Until the client has read the breakpoint (server markup, hydration) it renders only the trigger, so a wide first paint never flashes the Drawer.
- **CommentsPanel threads take an optional `context`.** The open thread's meta line then names the record: "INV-1842 · 3 comments · Open".
- **Progress `indeterminate`.** A bar for work that is underway when the percent is not known. A third of the track slides across, aria-valuenow is left off, and with reduced motion it is a faint still fill. Rings fall back to the bar.
- **Progress `tone="success"`** for a finished or healthy result.
- **Skeleton `layout`: `table`, `card` and `list`.** One piece holds a whole loading area with one Loading label. `lines` sets the rows.
- **Spinner `inverse`** for a primary fill: the mark and label use the on-primary ink.
- **ProgressSteps `optional` steps.** Set `optional: true` on a step. While it is upcoming it gets a dashed marker and the word Optional.
- **ProgressSteps `onStepClick`.** When you pass it, completed steps become buttons named by their label, with the kit focus ring. Upcoming steps stay inert.
- **RunDetail `calls="all"`.** Every started step's ToolCallCard stacks beside the trail in step order, the failed one open with its error, "Attempt 1 of 3" and Retry. Retry shows only on that ToolCallCard. The calls fold once the run is done. Picking a trail step scrolls to its call. In this mode the monitor is the one-row AgentMonitor bar and the block heading is for screen readers only, since the page's PageHeader names the run.
- **RunDetail `trace`.** Pass TraceWaterfall spans to get a compact "Run trace" in place of the monitor's step strip. It hides below 40rem of block width; time and cost stay in the monitor.
- **RunDetail `onStop` and AgentMonitor `onStop`.** While a run is running, "Stop run" (sm, outline, danger) sits beside Pause. A kit AlertDialog asks once ("Stop this run?") and confirming calls `onStop`.
- **RunDetail step `attempt`** (`{ n, max }`) shows "Attempt 1 of 3" beside Retry on a failed step's ToolCallCard.
- **`run-detail` pattern** (copy-in: `npx agentic-ds-kit add run-detail`). AppHeader, a PageHeader with a Runs breadcrumb, the meta line and Ask, then RunDetail with `calls="all"` and the trace. Northwind demo data with Failed, Running and Done states. Below 640 a back bar (Runs, Ask) replaces AppHeader.
- **AgentTrail `variant="list"`** (default `"rail"`): plain rows without the rail line or the status line, the done time or the status word on the right, a "2 of 4" counter, and a filled selected row. RunDetail `calls="all"` uses it.
- **ToolCallCard `variant="panel"`** (default `"default"`): a grey body with white code boxes, Arguments and Result side by side, arrays of plain values on one line, no status Badge in the head, and Attempt on the left with Retry on the right. RunDetail `calls="all"` uses it. Other ToolCallCards are unchanged.
- **SetupGuide blocked tasks.** A task can be `status: "blocked"` with `dependsOn` and `blockedReason`. It shows a lock, the word Blocked and what unlocks it, with no button, and it turns To do once its `dependsOn` tasks are done.
- **SetupGuide provider tiles.** A task's `integrations` show as compact tiles under the row while it is current. `onIntegrationConnect(integrationId, taskId)` and `connectingId` drive them.
- **IntegrationPicker `connectFlow="detail"`.** Connect and Manage open a Drawer with the app's detail, what it can access, and Connect or Disconnect. Items take the optional `publisher`, `about`, `permissions` and `connectedNote`, and the picker takes `onDisconnect`, `selectedId`, `defaultSelectedId` and `onSelectedChange`.
- **IntegrationPicker `showConnected` and `tileSize`.** `showConnected` adds a "Connected n" segment (value `"connected"`). `tileSize="compact"` puts each tile on one row.
- **SideNav.Item takes a controlled `expanded` and `onExpandedChange`.** Use them to open or close a parent row from your own state. `defaultExpanded` still works when you leave them out.
- **A parent row on the closed rail opens a flyout of its children.** Click it, or press Enter, Space or Right. Escape, Left, a press outside or a pick closes it, and focus goes back to the parent. The parent shows the soft current-page chip when one of its children is the current page.
- **Arrow keys move through SideNav rows.** Down and Up move through the visible rows, Home and End jump to the first and last, Right opens a parent and Left closes it or goes from a child back to its parent.
- **The app-shell pattern has a skip link.** It is the first focusable control, hidden until it has keyboard focus, and moves focus to the page's `<main>`. The label is the new `skipToMain` KitLabels key ("Skip to main content").
- Sign in template: `step` (`"credentials"` | `"code"`) and `onVerifyCode` for a one-time code step on InputOTP md (6 digits, groups 3 + 3, `autoComplete="one-time-code"`), with Verify as that step's one primary.
- Sign in template: `onBack` and `onBackupCode` show ghost "Back" and "Use a backup code" buttons under Verify on the code step.
- **Table can sort.** Set `sortable` on a column to make its header a button (ascending, descending, then off). Give currency and date columns a `sortValue`.
- **Table `rowActions`** adds one row menu in a last 56px column, named "Actions for <first cell>".
- **Table `state`**: `loading` keeps the header and shows skeleton rows, `empty` shows a small Empty with `emptyLabel`, and `error` shows LoadError with `errorMessage` and Try again from `onRetry`.
- **Table `stickyHeader`** keeps the header in view when the Table has a height.
- **Table `stack` and `rowHref`** (opt-in): below 480px each row stacks into two lines, and `rowHref` links the row from its first cell.
- **Tabs take an icon and a count per tab, an `overflow` mode and an `activation` mode.** A count renders as a neutral kit Count and is part of the tab's name. `overflow="more"` moves tabs that don't fit into a More menu (new KitLabels key `moreTabs`); `activation="manual"` makes arrow keys move focus and Enter or Space select.
- **Section takes `eyebrow`, `count`, `headingLevel` (2, 3 or 4), `divider` and `sticky`.**
- **PageHeader takes a `tabs` slot and `overflowActions`.** Page Tabs render under the title inside the header. Overflow actions show as outline Buttons and fold into one ⋯ menu when the header is narrower than 40rem.
- **ActivityFeed `variant="history"` for one record's events.** It shows an invoice or similar record on the same rail as Timeline and AgentTrail, with a time column when wide and the status word at the end of each row. On a phone, the time and status move into a line under the event.
- **ActivityFeed status chips.** `statusChips` adds All plus one chip per status word, using the kit SegmentedControl. Control it with `statusChip` and `onStatusChipChange`.
- **ActivityFeed error state.** `error` shows "Couldn't load activity" with your reason, and `onRetry` adds an outline Retry button.
- **Popover takes `eyebrow`, `tone`, `title`, `footer` and `footerStart`.** The same header and footer as Modal, so a small anchored panel can carry a heading, a status word and its actions.

### Changed

- **The MCP `list_components` and `search_components` tools skip deprecated components.** `get_component` still returns them, now with a `status` field (`stable` or `deprecated`). `inspect` still names deprecated pieces it finds on a page.
- **`npx agentic-ds-kit add --list` skips deprecated entries.**
- **Deprecated block pages show a "deprecated" badge**, as deprecated component pages already did.
- **AgentTrail, AgentMonitor, AgentInbox and TaskBoard stay stable.** Their contract intents no longer say they will become internal parts of a larger block.
- **DropdownMenu and Command share one item anatomy.** Rows follow size (DropdownMenu sm 28px, md 32px default, lg 40px; Command 40px), with a bg tray highlight, 4px item radius, 8px padding, secondary icons and full-width group separators. DropdownMenu rows were 36px; descriptions now sit on the label line with an ellipsis.
- **Shortcuts render as Geist Mono key chips.** One chip per key (`⇧⌘P`, `Ctrl K`, a `G I` sequence), aria-hidden, with `aria-keyshortcuts` on the item for chords.
- **Selected and radio checks move to the end slot.** A `selected` item keeps its start icon; the check (or a 16px spacer) sits at the end, where the submenu chevron goes. Select's option checks move to the end too.
- **Command's highlighted row shows the focus ring** while Command has focus.
- **DropdownMenu caps its height** at the screen minus 16px for every menu, not only searchable ones; the list scrolls inside the panel.
- **Placement and which-one rules in the contracts.** command.json and dropdownmenu.json now list the flip and placement rules and when to use Command, DropdownMenu or Select. Cell `actionMenu` docs name the menu after the row ("Actions for INV-1842").
- **Installation is now part of Get started.** The playground's Installation page moved into a new "Installation details" section on Get started (requirements, smoke test, fonts, tokens, labels, copying patterns, new folder, agent skill, upgrade). `/installation` redirects to `/get-started#installation`.
- **Billing schedule template is now a customer's schedule with editing.** The next charge is one figure with its lines and draft invoice, beside a danger Alert that names the invoice, amount, next and last retry and what happens after (Update card is the one solid primary; Change card hides meanwhile). Upcoming (with a total row) and Billed are two kit Tables with status as icon and word. A pencil on scheduled rows opens a kit Drawer with DatePicker, CurrencyInput and a RadioGroup for split fees; Skip this month asks once in an AlertDialog. Charge statuses are now `scheduled`, `retrying`, `invoiced`, `paid`, `failed`, `waived` (`upcoming` is now `scheduled`), `date` is `YYYY-MM-DD`, and charges carry `invoice`, `value` and `splitLabel`. New props `next`, `failureDetail`, `currency`, `onAsk`, `onDownloadInvoice`, `onSaveCharge` and `onSkipCharge`; `nextId` and `paymentMethod` are gone (the next charge comes from `next`). `summary` mode is unchanged. Below 40rem of its own width the tables become two ListViews (Upcoming grouped by month with month totals, then Billed), and the next-charge Card and failure Alert stack.
- **PermissionRequest under 40rem of card width.** Grant and Deny stack full width at size lg, Grant first, and the key hint is left out.
- **ListView tones gain `warning`.** `metaTone`, `iconTone` and the new `noteTone` take `"neutral" | "warning" | "danger"`.
- **Icons use stroke width 2, Lucide's default.** `ICON_STROKE` and `--icon-stroke` go from 1.5 to 2, so every kit icon and any `svg.lucide` you pass in gets a slightly heavier line. `ICON_STROKE_STRONG` and `--icon-stroke-strong` stay at 2 and are now the same value; they are kept so existing imports keep working. The `agent-permissions` and `settings` patterns drop their local `strokeWidth={1.5}`, so re-copy them (or delete that prop) if you added them before.
- **The settings example is now a settings shell, and this is breaking for anyone using it.** It renders its own settings SideNav (Back to app, then Workspace: General, Billing, Team, Integrations; You: Profile, Notifications, Security) and the inset panel itself, so drop the `AppShellPattern` wrapper and your Settings group in the app nav. Each page has a scope line under its title and no breadcrumb. Below 64rem, Settings is an index page of two LinkLists, and each section has Back to Settings. `npx agentic-ds-kit init --template settings` now renders `<SettingsPattern />` alone.
- **Settings sections:** `SettingsSection` gains `general` and `integrations`. General is new (workspace name, URL, currency, invoice prefix, time zone), and Delete workspace moves there from Security. Integrations renders the integration-settings example, which `add settings` now copies too. The default section is General (it was Billing). `SETTINGS_SECTIONS` rows now carry `group`, `scope` and `description`, and `SETTINGS_GROUPS` lists the two groups.
- **Settings routing props:** `section` also takes `null` (the narrow index page), plus `onSectionChange`, `sectionHref` (real links per section) and `appHref` (Back to app). `headerActions` now sit on the title row.
- **General, Profile and Notifications save from the kit SaveBar** (Cancel and Save), which names the unsaved changes. This replaces the hand-built footer bar.
- **FilterButton, Combobox and MultiSelect sit on the shared control scale.** `sm` is 32px, `md` 36px and FilterButton `lg` 40px, with 14/20 text (16/24 at `lg`). FilterButton was 32 / 40 / 48; Combobox and MultiSelect `md` were 42.
- **One ChevronDown on every filter and select trigger.** Combobox swaps its up-down chevrons for ChevronDown. The FilterBar `+N` overflow trigger shows a ChevronDown like the chips and still opens a kit DropdownMenu.
- **MultiSelect has a trailing chevron button** (Show options / Hide options) after the tags. Its tags render at Tag `sm` so the field holds 36px.
- **Off and disabled states.** An off FilterButton keeps its dashed outline on the page canvas fill instead of no fill. Disabled FilterButton, Combobox and MultiSelect use `--surface-disabled`, `--border-disabled` and `--text-disabled` instead of lowering opacity.
- **Meters and bars share one corner radius.** Progress bars, TraceWaterfall bars (full and compact), ContextWindow and AgentFleet bars now use `--radius-control-sm` on the track and the fill, the same subtle corners Meter already had. Progress and TraceWaterfall bars were square; ContextWindow and AgentFleet were pills. UsageMeter, Scorecard meter bars and Cell/DataTable progress cells pick this up through Meter and Progress. 4px-tall bars (size sm, compact trace) come out fully round, because the radius is half their height.
- **Breaking: the onboarding pattern is now Business, Plan, Billing, Review and Confirm.** If you copied it in with `npx agentic-ds-kit add onboarding`, your copy keeps working; re-adding it replaces the old steps, and code that passes the old names stops type-checking. The renames:
  - Step values (`step`, `defaultStep`, `onStepChange`): `welcome` | `workspace` | `connect` | `done` become `business` | `plan` | `billing` | `review`.
  - `onCreateWorkspace(values)` becomes `onConfirm(values)`. `values` is now `{ business: { name, country, currency, vat? }, plan, billing: { email, terms, prefix } }` (type `OnboardingValues`, was `WorkspaceValues`).
  - `workspaceState` becomes `confirmState`, with the same values (`idle` | `error` | `submitting`). Type `WorkspaceState` becomes `ConfirmState`.
  - `onTaskAction` is removed, with the SetupGuide step. `onSaveAndExit` and `onFinish` stay; `onFinish` now runs after `onConfirm` resolves.
- **Onboarding picks the plan with a kit TileGroup** and reviews everything in a kit ListView, one group per step with an Edit action and the first invoice's amount.
- **Confirm on Review stays disabled until Business, Plan and Billing are all valid.** An invalid step is marked as an error in ProgressSteps and shows its Field error when you go back to it. While the account is created, Confirm uses Button `loading` with "Creating account…".
- **Onboarding footer:** Save and exit is a ghost Button at the start of the footer on wide screens, and in the AppHeader below md. Back is ghost. Skip for now is gone, since every step is required.
- **settings-form template is now company billing details.** Three FieldSets (Company, Billing address, Currency and invoices) in one Card, legends left when wide. A sticky SaveBar replaces the Save and Cancel buttons and the Toast. Changed fields say Edited with the old value in the hint (on a phone, Edited alone). The phone layout drops the subtitle and moves VAT number under Legal name. Save with errors shows a summary Alert that takes focus and jumps to each field. Discard, and leaving through the page header with changes, ask first in an AlertDialog; closing the tab gets the browser's own prompt. Controls go to lg 40 and the Card frame drops below `--grid-breakpoint-sm`. `onCancel` now fires after a confirmed Discard.
- **PageHeader actions centre on the title line.** With a subtitle, the actions used to centre on the whole title block and sat low; now they line up with the title. Stacked below 40rem nothing changes.
- **Settings:** wide pages put the title 24px below the panel's top edge. The nav puts Back to app at the very top, above the workspace, then the Workspace and You groups, with the user at the bottom.
- **Settings › Security is a workspace setting.** It moved from the You group to the Workspace group, with the scope line "applies to all 12 members · owners can change it". It holds the sign-in rules (Okta SSO, Require SSO, two-step for members) with one solid primary, Save sign-in rules, then your sessions, then a Danger zone (a kit Section heading).
- **Delete workspace moved from General to Security's Danger zone.** The kit AlertDialog now asks you to type the workspace name. General ends at its form and SaveBar.
- **Settings › Billing:** a Plan card (Compare plans opens kit PricingPlans in a Drawer), a Payment method card, a compact kit UsageMeter for AI credits (Upgrade to Business moves into it), and invoices in a kit DataTable with the retry note. The billing schedule stays, below Invoices. Below `--grid-breakpoint-md`, AI credits comes first and invoices are a ListView.
- **Settings › Team:** a seats Card with a kit Meter (seats count pending invites) and Add seats, a role filter next to search, a Last active column, members in a kit DataTable, and "Showing 5 of 12". The Security save row has a muted footer background. Below `--grid-breakpoint-md`, members are a ListView with a row menu.
- **Settings contract:** the default "Security has no solid primary" is now "Security has one solid primary, Save sign-in rules". New must: "Danger actions sit in their own group after every card that saves". Intent, `contains` and states are updated to match.
- **Pattern pages: one page per pattern, states behind a switch.** Each pattern page picks its state (empty, loading, error and the rest) from a State switch in the preview toolbar instead of a grid of thumbnails, and the Patterns index shows one card per pattern. The separate Mobile 390 screens are gone: the preview's Mobile width shows any state at 390.
- **Command reads quieter.** Group headings are sentence-case captions instead of uppercase, tracked labels. Inside a Modal, Command drops its own border and corners, so the Modal card is the only frame.
- **The billing-schedule pattern renders `<BillingSchedule view="full" />`.** Its table, failure Alert, next-charge panel and states now come from the kit component (`nextOnly` maps to `view="nextOnly"`). The pattern keeps the edit Drawer, the Skip AlertDialog and the summary card. Its `Charge`, `ChargeStatus` and `NextCharge` types are re-exported from the kit, so a copied-in pattern needs a kit version with BillingSchedule.
- **Card `headerAction` with `href` looks like the other header Buttons.** It is still a real link (`<a>`, or `linkAs`), now with the neutral sm Button look instead of underlined link text.
- **InsightCard `description` takes inline nodes**, so key numbers can sit in `<strong>`.
- **AppShellPattern work panel tabs fill the panel height**, so a tab like Chat embedded reaches the bottom instead of leaving an empty band.
- **DashboardPattern is now a revenue overview.** It renders inside the app-shell example (inset, with its workspace switcher, Quick actions, Notifications and Saved views) and has:
  - controls for period, granularity and compare, plus a dismissible one-sentence summary;
  - selectable KPI cards that drive the main chart, which has a labelled reference line and a dashed previous period. Each card uses the Scorecard look that fits it: MRR against its target, Net new MRR as an expressive line, subscribers and churn as meters toward a target or under a ceiling, ARPA as the plain line;
  - MRR movements, revenue by plan, retention by signup month and top plans;
  - a "Might churn this month" table and a Needs attention rail;
  - an Ask button on every card, which opens the work panel's Chat with a context chip (the panel also has What changed).
  New props: `metrics`, `selectedMetric`, `compare`, `period`, `granularity`, `insight`, `rail`, `loading`, `panel` and `shell`. `npx agentic-ds-kit add dashboard` now also copies `app-shell`. The old `breadcrumbs` prop is gone.
- **prototype-from-kit description and pattern line.** It now triggers on "building a product screen from Nistha (agentic-ds-kit)", and says patterns are blueprints that only compose kit pieces, never new primitives.
- **Radius is a fixed scale on 2 and 4px steps.** `--radius-xs` 2px, `--radius-sm` 4px, `--radius-md` 6px, `--radius-lg` 8px, `--radius-xl` 12px, `--radius-2xl` 16px, `--radius-3xl` 24px, `--radius-full` 9999px. Before, every step was computed from `--radius-base` (3, 5, 6, 8, 10, 13, 19). Role tokens point at the same steps as before, so these change in pixels: `--radius-control-sm` 3 → 2px, `--radius-surface-md` 10 → 12px, `--radius-surface-lg` 13 → 16px, `--radius-media-lg` 10 → 12px. The numbered aliases follow: `--radius-50` 3 → 2px, `--radius-100` 5 → 4px, `--radius-300` 10 → 12px, `--radius-400` 13 → 16px, `--radius-500` and `--radius-600` 19 → 24px.
- **`--radius-base` no longer moves the scale.** It stays 8px. To retheme corners, set the steps (or the role tokens) you want.
- **New layout rule in `AGENTS.md`:** radius and spacing use only 2 or 4px steps.
- **Scorecard sparklines have square line ends.** The plain line and the new looks use butt caps and miter joins.
- **Scoreboard strips of more than four cards share the strip's width.** Cards grow to fill the row and scroll only once each would drop below 12rem, so labels no longer wrap on wide screens.
- **Tooltip has no border.** The dark bubble and its arrow are one solid fill, with the same radius, padding and shadow as before.
- A selected ListView row now shows a heavier name on top of the selected fill. Focus keeps its outline ring.
- **PageHeader `subtitle` takes a string or inline nodes.** Pass a lucide icon before a short scope line, such as `<><Users /> Applies to everyone in Northwind</>`. A leading icon is muted, 16px and centred on the text. Strings render as before.
- **Accordion opens and closes more calmly.** The panel, chevron and content now move together in 240ms with a plain ease-out: no spring on the chevron, no delayed slide on the content (it only fades), and the same timing both ways. Under `prefers-reduced-motion` the panel shows and hides at once.
- **AgentFleet matches the polished Paper board.** Every card now leads with the orchestrator mark (28px overview, 24px compact, 36px open), names use the heading weight, status and legend dots are 6px with 6px gaps, segment bars are 6px (4px on compact cards), cards carry the extra-small shadow, the open card's stat strip has 16px block padding and the medium surface radius, sub-agent rows are 44px with the running icon in the info colour, and the compact footer label reads in the muted text colour.
- **AgentFleet totals is a chip.** The fleet line sits in a bordered chip with a Layers icon, mono medium text, sized to its line. The waiting callout uses a 14px icon and the caution text colour; loading cards add a bar and a short line.
- **AgentInbox matches the polished Paper board.** Unread rows get a 6px primary dot in a fixed slot before the icon, a heavier name and full-strength preview; read rows keep the slot empty with a muted preview. Row icons take their type colour (approval caution, question info, failure danger, recap success), and rows put 12px between icon and text. The selected row uses the strong primary tint. The list and detail split 5:6, and loading rows use 16px circles.
- **AgentMonitor matches the polished Paper board.** The header leads with an agent mark and keeps the name on one line (truncated, full name on hover) with the status on the right. The clock panel opens up (16px between rows, 24px between clock and cost, snug clock tracking, regular-weight cost) and the headline reads at 14/20 with a 16px status icon. Step tiles are 36px; the running tile uses the info colours and the last step of a finished run shows a check on the success tint. Paused uses pause bars and mutes the stopped clock; failed puts the clock and what it spent on one line; loading shows five 36px step tiles. Start run and Resume are outline primary, Cancel run uses a stop icon and View diff a file icon. The card has the extra-small shadow.
- **AgentMonitor collapsed is one compact row.** Agent mark, the name over a mono "02:14 · $0.42" line (other statuses lead with the word), one tile per tool the run used, then the chevron; done shows a check instead of the tools. Picking a tool opens the card on its first step. A passed headline still shows under the name, and run actions sit on a row below. RunDetail's header bar follows.
- **AgentPlan matches the polished Paper board.** Step numbers sit in a 20px outlined circle; the step that runs now is a filled info circle on the info tint. Per-step status words are read to screen readers only (the marker shows the state; tool-call counts stay visible). After a failed step the remaining labels are muted. Accept plan steps back to outline while a step is being edited or added. Collapsed is one line: title, "· summary" (truncated), status and chevron. Drafting rows use 20px circles.
- **AgentSteering matches the polished Paper board.** The header leads with a 28px agent mark, the name reads in the heading weight, and the status dot is 6px with the status word in muted text. The composer field leads with a compass icon and stays read-only, not disabled, while a steer sends. The footer key hint reads "steer with ⏎" in mono and is left out once the run is done. A finished run keeps its quick steers in view, disabled. Loading adds the agent mark's circle.
- **AgentTree matches the polished Paper board.** The card has 24px padding and the extra-small shadow; column heads are lowercase mono in the subtle colour over wider lanes (104 / 56 / 60px with 16px gaps); rows are 40px with 4px between them and 12px between icon and name; root and branch names read at 14/20 in the heading weight; status words are medium weight and times subtle; a folded branch tints its row and names its count in mono; the running icon uses the info colour; Retry is a ghost danger button. Under 40rem the tree keeps the previous compact lanes.
- **AgentTree waiting rows are outlined, not filled.** A waiting leaf has a dashed caution outline on the surface and reads "Waiting for you"; its Approve is a ghost button. A finished tree shows a check on the root, indents step 24px, and loading draws 16px circles on 40px rows at Paper's depths.
- **AgentOverview: the request card and the Since rail start level.** The "Needs you" line (status, agent and time) now sits above both columns, so the left request card and the right "Since" card share a top edge. On narrow screens the order is unchanged.
- **ActivityFeed history dots use the brand colour.** Every dot on the `history` rail is now the brand fill, as on Timeline, instead of near-black. An event whose `status.tone` is `danger` or `warning` gets a danger or warning dot. The connecting line is unchanged.
- **AutonomyDial matches the polished Paper board.** The four stops share the track equally, a row of dots under them fills up to the current stop, the end labels read in medium weight, the "default" mark is a primary Badge, and the explanation panel has a hairline border. When the dial is narrow and stacks its stops, the dots hide with the end labels.
- **Breaking: BillingSchedulePattern's `NextCharge` and data exports.** `NextCharge` is now `{ date, amount, paysWith }`. `detail`, `lines` and `invoice` are replaced by `paysWith`, the payment method shown under Pays with. The `UPCOMING_WINDOW` and `BILLED_WINDOW` exports from `billing-schedule-data` are removed. If you copied the pattern in and pass `next`, rename your fields.
- **BillingSchedulePattern matches the polished board.** Each state sits in a kit Card with the Card's own header (Billing schedule, the plan name and Download all). Upcoming and billed charges share one Table (Date, Description, Status, Amount). The next charge says Next charge, and status Badges have no icons. The `nextOnly` panel shows the date, the figure, Pays with and Change card. An open failed payment puts a danger Alert above the table, and the load error's Retry has a RotateCcw icon. Every date reads 01 Dec 2026. Row actions show only when you pass `onSaveCharge` or `onDownloadInvoice`.
- **CitedAnswer matches the polished Paper board.** The author line leads with a 24px assistant mark and the name reads in the heading weight. Citation marks sit on the text's baseline in mono, like the source numbers, instead of raised. The toggle reads "Used 3 sources" in muted text with an 8px radius. A clicked source keeps the strong primary tint. Loading shows a small spinner beside a small "Reading sources…" shimmer.
- **Combobox and MultiSelect show the selected check at the end of the row.** Item text now lines up with the input text, and the check sits on the same side as in Select, DropdownMenu and ModelPicker.
- **MultiSelect tags sit evenly in the field.** With tags shown, the space before the first tag matches the space above and below it. With no tags, the placeholder still lines up with Input, Select and Combobox.
- ContextWindow matches the polished design: the title uses the heading weight, the stacked bar is a pill track with a hairline edge and hairline splits between segments, the legend is tighter, and values and percent are medium weight.
- ContextWindow compact is 32px tall with a smaller muted icon. Near limit and Full show only the icon, and the word stays for screen readers.
- ContextWindow near-limit notice now reads "Oldest messages will be trimmed soon. Trim now to keep control." Segment tokens show one decimal under 100K (8.0K). Loading shows two bars, then five lines. The error banner has more padding.
- **Every component preview's Controls panel now looks and works like the Button preview's.** Size is the small sm / md / lg toggle and comes first, every other choice is a radio list (for example InlineDiff's unified / split), on/off options are Switches, and Reset sits as the panel's last row. All panels are built from one shared playground piece, so they stay in step.
- TraceWaterfall matches the polished design: a kind-coloured dot before each row label (failed rows keep their icon and "Failed"), Paper's lane widths, 14px bars, rows with no gap between them, and tighter card spacing.
- TraceWaterfall tool spans are teal (`--chart-2`) instead of grey. Costs are medium weight, and a missing cost shows a subtle "—". Whole seconds drop the ".0" (58s). The detail badge is primary. "dashed = still running" shows only while a span is still open (no `endMs`).
- TraceWaterfall failure note is sans and medium weight, and the load-error banner has the polished padding.
- **DecisionCard matches the polished Paper board.** The card is tighter (16px padding, 12px gaps) and the "who asks" title reads at 14/20. Skip reads "Skip for now", is a ghost button and sits at the start of the footer. Confirm drops its Check icon and shows its ⌘⏎ key as a chip in place of the hint line, and steps back to outline while sending or after an error.
- **Button `shortcut` chips hide on touch screens.** Under `(hover: none) and (pointer: coarse)` the key chip is left out, as the review cards' key hint line already was. This applies to every Button with a `shortcut`.
- InlineDiff matches the polished design: a smaller title (ui-sm), tighter card and diff spacing, outline badges for neutral states, "+2 −1" counts in the file header (still read as "2 added, 1 removed"), sentence-case Before / After heads, and line numbers that stay subtle on added and removed rows.
- InlineDiff footer is now Reject (with an Esc key chip), Accept all, then Accept (with a ⌘⏎ key chip and no Check icon). The "⌘⏎ accept · Esc reject" hint line is gone.
- InlineDiff error banner has more padding, a medium-weight message and the danger icon colour.
- **Kbd is flat, with a 4px corner.** The key chip drops its thicker bottom border and drop shadow, so it is a plain bordered chip, and its corner moves from 2px to `--radius-sm` (4px) to match Badge and Tag.
- **Command and DropdownMenu key chips have a 4px corner.** The shortcut chips in Command rows, its footer and Esc hint, and DropdownMenu items now use `--radius-sm`, the same corner as Kbd, Badge and Tag.
- MemoryPanel matches the polished design: a Brain mark in the header, on each row and in the empty state (it was BookMarked), heading-weight title, mono group labels, roomier rows, the age in mono, and a primary "Used here" badge.
- MemoryPanel pinned pins now show in the primary colour (the old rule lost to the Button's own colour). The row Forget button is neutral, while the AlertDialog keeps the danger action. The confirm dialog uses the small size.
- MemoryPanel row actions now run Edit, Forget, then Pin. The pin holds the right edge, and Edit and Forget fade in to its left on hover or focus.
- MemoryPanel loading rows start with a circle, and the error banner and privacy note have the polished spacing.
- **MessageActions matches the polished Paper board.** The action icons sit in one hairline frame (2px inset, 8px radius) under the message. Copied shows the success tint with a green check (kept on hover and focus), a pressed thumbs up turns primary, and Retrying uses Button `loading` instead of a disabled button. "Thanks, noted" reads as plain subtle text without a check. The reasons group keeps its "What went wrong?" name for screen readers only.
- **AgentMonitor step tiles no longer animate in on load.** The Steps strip shows at full size right away, including steps added during a run. Hover, selection, the running spinner and the step-detail panel are unchanged.
- **Pattern previews sit in one Northwind app.** Dashboard, Empty first run, List detail, Settings form, Assistant start, Billing schedule, Integration settings, Insight stack, Agent activity and Agent permissions now preview inside the dashboard's app shell (workspace switcher, Quick actions, nav, account), with their own nav row current and the dashboard's page header and padding. The shared nav gains a Settings row. On a phone the nav moves into the shell's drawer, as before.
- **PermissionRequest matches the polished Paper board.** A key icon leads a 14/20 title, and the scope count is a kit Badge at the end of the header; `requestedAt` moves to the start of the footer in mono (above the buttons on narrow cards). The card is tighter (16px padding, 12px gaps) and the scope list has a hairline border. Each scope puts its reason and expiry on one line (expiry drops under the reason on narrow cards), with the limit below. Read access is an info Badge. Error Retry is a ghost danger button, and Grant steps back to outline while granting or after an error. Resolved rows show the access and resource in mono. Deny and Grant show their keys as chips (Esc, ⌘⏎) in place of the hint line.
- **RunningNow matches the polished Paper board.** The label and count read in mono (label subtle, count muted). Status icons are 14px: running in the info colour, waiting and failed in caution and danger. The "Needs you" and "Failed" words are read to screen readers only; a waiting or failed item's activity takes the caution or danger text colour instead. Row chips use the small surface radius. Stack rows put 12px between icon and text with the activity in muted text, and the stack's label sits 6px above the list. Loading chips vary in width and stack skeletons use 16px circles.
- **Command's active row is a quiet fill, no outline.** The highlighted result no longer draws the 2px focus ring; it uses the tray fill like DropdownMenu's highlighted item (`--bg-tray-floating` inside a Modal, so it stays visible in dark). Keyboard focus still shows on the search row.
- **Command's search row inside a Modal looks like kit Input.** It has Input's border, fill, corners, height and focus ring, with the Esc hint at its end, instead of the blue focus underline.
- **BillingSchedule matches the Paper table.** In `view="full"`, the Next charge row is a rounded tinted row (`rowTone="highlight"`), and the table has no row dividers (`rowDividers="none"`).
- **TagInput tags sit evenly in the field.** With tags shown, the space before the first tag matches the space above and below it, as in MultiSelect. With no tags, the placeholder still lines up with Input, Select and Combobox.
- **UsageMeter's daily usage is bars, not a line.** One kit BarChart bar a day: brand by default, the soft warning tone from `warnAt` of `dailyCap`, the soft danger tone over it. The chart note gives today, the cap and how many days were near or over it. The Table toggle shows the same days.
- Accordion header is the md control height (36) with a 14/20 title. The chevron now sits before the title and turns from right to down.
- Collapsible's whole header row is the toggle button, with the same leading chevron. The boxed ChevronsUpDown toggle is gone, and the button's name is the title instead of "Toggle {title}".
- **AutonomyDial in a narrow column.** Stacked stops mark the selected row with a check, and the "More oversight / More autonomy" end labels hide.
- **AgentSteering quick steers are kit Buttons.** They render as outline sm Buttons (32px) instead of 24px chips, and stay visible after a steer is applied.
- **ModelPicker cost tier is a word.** `costTier` shows as Low, Standard or High; "$", "$$" and "$$$" still work and show as those words.
- **DropdownMenu disabled items dim only the label, danger items included.** The description (often the reason) and the icon stay readable, so ModelPicker's "Not on the Growth plan" is no longer faded.
- **ContextWindow segment fills use the chart ramp.** Segments use `--chart-1`, `--chart-2`, `--chart-4` and `--chart-5` instead of status colours, so a fill never reads as a state. The compact form shows "Near limit" or "Full" as a word next to its icon, and the warning says the oldest messages drop first.
- **MemoryPanel type.** The title uses the label weight like the other agent panels, and fact text is 14/20.
- **One yes key and one no key on the review cards and blocks.** ⌘/Ctrl+Enter is the yes on ApprovalCard, PermissionRequest, DecisionCard, InlineDiff, PlanReview and ChangeReview; Escape is the no when focus is not on another control. ApprovalCard no longer approves on plain Enter. PlanReview now approves with ⌘/Ctrl+Enter and rejects with Escape; ChangeReview accepts all with ⌘/Ctrl+Enter outside text fields.
- **Key hints move off the buttons.** Shortcut chips are gone from the review buttons; one hint line in the footer (e.g. "⌘⏎ approve · Esc deny") spells out the keys and hides on touch screens. The yes buttons carry a Check icon.
- **One resolved row for all four cards.** Approved, granted, chose and accepted show a CircleCheck; denied and rejected a CircleX; expired a Clock. Expired is a solid row, no longer dashed on a see-through background.
- **Card sizing.** The four cards use `space-5` padding, an 18/24 title and the shared focus ring. ApprovalCard drops its fixed 25rem width and fills its container.
- **Words, not only symbols.** PermissionRequest access Badges read Read, Write or Admin, and its error Retry is a kit Button. InlineDiff counts read "2 added, 2 removed".
- **DecisionCard Skip** is an outline button labelled Skip and takes Escape.
- **PlanReview Reject and ChangeReview Reject file** are outline neutral, not danger. ChangeReview's Accept all moves to a footer beside the keys line.
- **One status set across the run components: Queued, Running, Needs you, Done, Failed.** RunningNow shows Needs you and Failed as visible words, AgentPlan steps show their status word during a run, AgentTree and AgentTrail say Needs you, and ToolCallCard says Failed (CircleX) instead of Error. The `status` values are unchanged.
- **TraceWaterfall tool spans are neutral (`line.strong`), bars and legend marks are square, and a failed span shows an icon and the word Failed.**
- **Retry and Approve are small outline neutral Buttons** in AgentTree (no ⏎ chip on Approve) and AgentPlan.
- **DoneCheck has one visible action per row.** Mark met and Mark not met move into a row "More actions" menu, and evidence notes and links show inline; long output stays in a Collapsible.
- **Icons are 16px and focus uses the shared box-shadow ring** in RunningNow, AgentTree, AgentPlan, TraceWaterfall, ToolCallCard and AgentTrail.
- **CitedAnswer missing sources are said in the text.** A missing mark reads "[n] missing", the toggle reads "3 sources · 1 missing", and the source list opens on first render when any source is missing. Marks get a 24px hit area.
- **MessageActions reasons are kit toggle Buttons** (sm, `aria-pressed`) in a group named "What went wrong?", and the thanks line has a check icon.
- **AssumptionLog confidence shows the percent** ("Low 46%"), and the steps Button reads "n steps".
- **GuardrailLog Flagged is a neutral outline Badge**, so it no longer looks like a filled status.
- **AgentOverview is redesigned.** Needs you shows the oldest open request as one ApprovalCard and counts the rest; All agents lists each agent with an icon-and-word status, one fact, its cost and one action (Review for failed, Ask for running); a Since rail (ActivityFeed history) lists what happened after the last visit. The Scoreboard summary, the activity BarChart and the AgentInbox list are gone, the filter now counts agents, not events, and the default title is "Agents".
- **AgentTrail shows each step's status word as visible text** under its label, and the failed step is the current step (`aria-current="step"`) when nothing runs or waits.
- **A warning Alert uses `role=status`, not `role=alert`.** A warning shown on page load is not urgent. danger stays `role=alert`.
- **Danger toasts stay open until closed.** `status="danger"` now defaults to `duration: null` (no countdown bar). Pass `duration` to keep the old 5 second close.
- **The toast stack shows at most three toasts.** Older ones are hidden, their timers pause, and they are left out of the live region until a newer one closes. Toast cards use `--radius-surface-sm`.
- **ListView `primaryAction` lane.** The action slot is a fixed 96 lane (was a minimum of 80). Once any row has a `primaryAction`, rows without one keep the empty lane, so badges, values and verbs line up down the list. In AgentOverview this lines up the cost column at desktop. Below `--grid-breakpoint-sm` the empty lane is hidden at every size, so AgentOverview's sm rows keep their width at 390.
- **ListView `size="lg"` below `--grid-breakpoint-sm`:** a row's `primaryAction` drops to a full-width line under the row, and the badge stays beside the name.
- **Avatar sizes remapped (breaking).** `sm`, `md` and `lg` are now 24, 32 and 40 (were 32, 40 and 48). Use `md`, `lg` and `xl` for the old sizes. Applies to AvatarGroup and to kit pieces that render avatars.
- **Avatar initials get a tint from the name.** The same name always gets the same tint, from existing tokens (`--primary-subtle-strong`, `--info-line`, `--success-line`, `--highlight-line`, `--bg-tray`).
- **Badge sizes and look.** `sm` is 20 and `md` 24 tall (`lg` 28), with no border and a 4px corner (`--radius-sm`). Solid fills use the tone's fg ink token. Outline draws its hairline inside, so heights stay exact. Soft neutral uses `--bg-tray` so it shows on canvas grounds.
- **Tag corner is 4px**, matching Badge.
- **AvatarGroup** rings each face with `--surface-card` (2px) and gives the +N a proper accessible name (role img, "3 more").
- **Cell `trendPositive` / `trendNegative` render a kit Delta** (arrow and signed value) instead of a chevron. Same props; put the sign in the value.
- **Scorecard `delta` renders a kit Delta** (arrow from `trend`, colour from `trend` or `deltaTone`). Trend `neutral` with a `deltaTone` still shows the tone's status icon. Scorecard `goodWhen` now passes through to Delta, so a judged Better delta is neutral instead of green.
- **MultiSelect overflow is a kit Count `+N`** (neutral, subtle) instead of a Badge.
- **Contracts name which mark to use.** Badge, Tag, Count, Delta, Avatar, AvatarGroup and ListView each say their one job.
- **Button heights are 32, 36 and 40px.** sm was 26px, md was 38px and lg was 50px. Padding at the sides and type sizes are the same as before.
- **An icon-only Button is a square of its height.** md was 34px and is now 36px; lg was 44px and is now 40px; sm stays 32px.
- **Every one-line field uses the same heights.** Input was 34, 42 and 50px and is now 32, 36 and 40px. Select, NumberInput, CurrencyInput, DatePicker, DateRangePicker, DateTimePicker and TimePicker were 34 and 42px and are now 32 and 36px. Combobox, MultiSelect and TagInput were already on this scale.
- **Disabled Button has its own look.** It uses `--text-fg-disabled`, `--border-disabled` and `--surface-muted` in place of `--opacity-disabled`. A disabled ghost Button keeps no fill.
- **Danger Buttons get an icon.** A labelled solid, outline or soft danger Button with no `iconStart` shows a `TriangleAlert` icon, so danger is never colour alone. Pass `iconStart="Trash2"` for a delete.
- **Button's default fill and border no longer use `transparent`.** Solid and soft buttons draw a border in their own fill colour, and ghost has no border. Nothing changes in size.
- **Contracts:** Button documents Ask as a neutral sm Button with a `MessageCircle` icon. FilterButton no longer forbids SplitButton and says which split control is for what.
- **Card footer is a row under a divider.** Ask sits on the left and the actions on the right. Footer buttons no longer stretch and stack at full width.
- **Scorecard value sizes are three real steps.** sm 18/24, md 24/32, lg 32/40. Before, all three rendered at 24px.
- **Scorecard sm padding is space-4**, so Card and Scorecard share the space-4 / space-6 padding scale. The frame now names the same tokens as Card (`surface-card`, `border-faint`).
- **ChangeSummary actions are kit Buttons.** View full report is now an outline neutral sm Button instead of a link-style button, and loading rows show a second Skeleton line.
- **DashboardPattern's main chart shows how MRR moved.** With MRR picked, the area marks the latest value, a strip underneath shows the net change per day, week or month on the same dates, and the tooltip on the largest drop says so. Other metrics get the latest-value mark only. From the Charts redesign board (D).
- **Square line ends and square bars.** LineChart and ComboChart lines use square caps and mitred joins; ComboChart bars lose their 2px corner radius.
- **ComboChart `axis="dual"` fits the line's own range.** The right axis no longer forces zero, so a running total like MRR keeps its shape instead of lying flat at the top.
- **Chart loading sets `aria-busy`** on the chart body.
- **Chat looks closer to the redesign board.** User messages sit in a soft bubble, assistant answers use the full width, and a context Tag moves under the intro in the guided empty state.
- **The dashboard's revenue chart has its Table view back.** The Overview chart now sits directly in its Card body, so with the Card fix from #314 it keeps its Table toggle and legend without drawing a second frame, including when Compare is on.
- **The dashboard template is now a billing home.** `npx agentic-ds-kit add dashboard` copies a page titled Billing with Export and one solid New invoice, and two tabs. Overview has four selectable KPIs (MRR, Collected, Overdue, Failed payments) that pick the revenue chart's metric, a chart card whose title states the finding ("MRR is $7.4k below the $420k target"), a Needs attention card and the oldest overdue invoices in a stacking Table. Needs attention leads the source order, so it is the first card on a phone, and the grid puts it beside the chart when wide. Every Overview card uses Card md wide and sm narrow, with a labelled Ask in its footer.
- **The analysis charts moved to a Revenue tab.** MRR movements, revenue by plan, retention by signup month and top plans move across as they were, with the period, granularity and Compare controls and the summary. The three stub tabs (Subscribers, Churn, Cohorts) are gone.
- **Dashboard demo data.** `DashboardMetricId` is now `mrr | collected | overdue | failed`; the Might churn table and its data became Overdue invoices (`OVERDUE_INVOICES`). If you copied the pattern before, your copy keeps working; only new copies change.
- **The three date pickers open with the shared overlay header**: CalendarDays icon, the picked value or range status as the eyebrow, the Choose date title, and Close. Opening focuses the picked day instead of the month arrow.
- **Below 40rem DateRangePicker opens as the kit Drawer bottom sheet**, with one month, the presets and the typed fields, and Cancel and Apply in the sheet footer.
- **Today shows a short bar under the number instead of a border ring.**
- **The picked value in the trigger is set in Geist Mono** (a preset name in DateRangePicker stays in Geist).
- **DatePicker uses the shared Escape stack** (useOverlayDismiss), so Escape closes only the newest open overlay.
- **DateTimePicker's panel is modal**: Tab stays inside, like the other two pickers.
- **DashboardPattern's period control is a DateRangePicker** with Last 30 days, Last 3 months and Last 12 months as presets, or a custom range, in a Field labelled Period.
- **Field lists DateRangePicker and DateTimePicker as allowed children.**
- **Empty md looks smaller.** The 48px round well becomes a 32px square tile with a 16px icon, and the title goes from heading-5 to the 18/24 ui-lg size. Use `size="lg"` for the old page-sized heading.
- **Every kit error row now renders LoadError.** ChartFrame charts, ChangeSummary, TaskBoard, PricingPlans, CommentThread, CommentsPanel, NotificationStack, ExperimentCard, SetupGuide, InvoiceDocument and IntegrationPicker show a centered icon, the message and a "Try again" Button instead of the red strip with "Retry".
- **Empty first run template is now a new billing workspace.** It renders inside the app-shell example (`add empty-first-run` also copies app-shell). Empty (first-use, lg) holds Create invoice, the one solid primary, and an outline Try sample data, with a one-line setup status and Open setup under it in the same Card. The New invoice Modal adds a customer inline (Combobox), picks a plan (Select) and a due date (DatePicker). Sample data shows an info Alert with Clear sample data over the invoices Table, and Create invoice moves to the header. New props `setup`, `onOpenSetup` and `shell`; `onCreate` now gets `{ customer, newCustomer, plan, dueDate }`.
- **EvalSuite: deltas in words, counts in the view tabs, a Review column.** Pass rate, cost and latency pass `goodWhen`, so each delta says Better or Worse. The Regressions tile is gone; the tabs read "Regressions 3 / Improvements 6 / All 48". The table columns are Case, baseline, candidate, Score change ("−0.42 of 1", or "No score"), Cost change ("+$0.004") and Review (To review / Accepted / Flagged); Tags leave the default columns and stay a filter. The Promote reason says what to do. Latency reads "1.8 s". The title is 16/24.
- **FailureClusters: agents as text, trend as counts, actions last.** AvatarGroup is gone; the selected cluster names its agents in its meta line. The trend reads "4 more than the previous period" in muted text instead of status colours. `sample.summary` shows as the cause sentence under the heading (and no longer inside the ToolCallCard). Mute, Mark known and Open issue move to the end of the detail. The title is 16/24.
- **ExperimentCard: the metric sits under each value.** Each variant shows "paid within 7 days · 50%" under its value instead of "50% of traffic" under its label. The title is 16/24 and the confidence note is body-sm in muted text.
- **FileUpload's action is a neutral sm Choose files Button.** The brand "Click to upload" text is gone, and the dashed zone is no longer a button: `id`, `ref` and native attributes now go to the Choose files Button. While files are dragged over, the zone reads "Drop files here".
- **FileUpload rows are tidier.** Zone and rows use `--radius-control-md`. Uploading rows put the Progress bar and "Uploading 40%" on one line. Error rows lead with an alert icon, and Retry is a labelled sm Button (full width on small screens).
- **TagInput tells the person what happened.** A duplicate shows "finance is already added" instead of being silently dropped. The first Backspace on an empty query highlights the last tag and says so; the second removes it. Messages are announced.
- **TagInput keeps the 32 / 36 / 40 frame with tags inside it.**
- **Field keeps the hint when an error shows.** The error goes under the hint with a CircleX icon, and no longer has `role="alert"`; use an Alert error summary on submit (see the Field docs). Hint and message text are now 12/16.
- **Field spacing is 8px from label to control and 4px below the control**, instead of 8px everywhere.
- **Disabled controls use the disabled tokens instead of fading.** Input, NumberInput, TagInput, TimePicker, the shared field controls, Checkbox and Switch no longer use opacity.
- **Read-only Input and Textarea get the tray fill** and keep full contrast.
- **Checkbox md is 16px** (was 18.4px). **Switch is 32 by 20 (sm), 36 by 20 (md) and 40 by 24 (lg)**, on the 4px grid.
- **The integration-settings pattern follows the redesign.** A Section head (provider, account, Ask) sits over two Cards: Connection (status Badge with an icon, last sync with numbers, and the sync error Alert holding Retry and View invoices) and Sync settings (Selects and Checkboxes, Save). Disconnect moves out of the form into its own Section, `--space-10` below. Scopes are one sentence instead of Tags, and Fields put labels on top. Disconnect stays usable while access is expired.
- **New `lastSync` prop** `{ at, invoices, payments, next }` on IntegrationSettingsPattern, and `error` now takes `{ title, detail }` as well as a string. New `onAsk` shows the Ask button in the head.
- **integration-settings contract:** `contains` drops switch and tag and adds checkbox. New musts: options saved by Save are Checkboxes (Switch only for settings that apply at once), and Disconnect sits outside the settings form.
- **UsageMeter `warnAt` now defaults to 0.8**, the same line as UsageList (was 0.9).
- **UsageBilling Upgrade is solid only at or past the allowance's `warnAt`**; below it the button is outline. Invoice rows take `status: "issued"` and say Issued like InvoiceDocument; `"open"` still works and also reads Issued.
- **InvoiceDocument lines stack below 30rem**: Qty × Unit moves under the description and the Table keeps its four columns for screen readers. The footnote icon follows the status (clock for issued and estimate).
- **PricingPlans highlights only the recommended plan** and the Current plan badge is neutral. Below 30rem the cards become a TileGroup with one button.
- **TileGroup focus uses the shared box-shadow ring**, like Button and Input.
- **The list-detail pattern follows the redesign, as Northwind's invoices.** One kit ListView (single select) replaces the AppNav and the Table. Rows show the customer, the invoice number and due date, the amount as the row `value` and the lateness in words. The list column carries the Invoices PageHeader with New invoice, a search Input and an All / Overdue / Open / Paid SegmentedControl, with a "Showing n of m" line under the list. The demo counts a 48-invoice book (14 overdue) from one constant. The open invoice is a pane beside it in `layout-split--secondary`, split by a faint rule: the id with its status Badge, the customer line, Ask on the left and Download PDF and Retry payment (the one primary) on the right, then an amount strip, Line items (Table with a total) and Payment history. With nothing open, kit Empty fills the pane and offers "Open oldest overdue".
- **One URL per record.** `#INV-1842` opens that invoice and an empty hash is the list, so links, reloads and the browser's Back work. A hash on load wins over `selectedId`, and `selectedId` left out now starts with nothing open.
- **Below 640 the list drills.** Rows get a chevron and open the invoice full page: a top bar with a ghost Invoices back button, then compact line item and payment rows, with Ask, Download PDF and a full-width Retry payment at lg in one row. Back returns focus to the row that was open. A polite live region says "INV-1842 open" when a row opens.
- **list-detail contract:** `contains` is now pageheader, listview, empty, card, badge, button, iconbutton, table, input and segmentedcontrol (appnav and section go). The "Route-level sections are links (AppNav)" must is replaced by: single selection, one URL per record, detail beside the list at 640 and up with Empty when none is open, full-page detail with a back button below 640, and status in words.
- **PageHeader keeps a single action beside the title on narrow widths.** Below 40rem (a phone, or a list column like list-detail's) actions still move under the title, except a single Button or IconButton, such as New invoice, which stays on the title's row.
- **List detail template** uses flush ListViews for the invoice rows, Payment history and the phone Line items, red "N days late" and declined-payment icons, and a full-width filter. Phone rows are lg and run to the screen edges.
- **DataGrid stacks below 30rem.** Each row becomes a line (description, other values, Amount) that opens to labelled fields; a row with an error starts open. The stacked footer shows only the total, with its `narrowLabel` ("Total incl. VAT").
- **Rows with an invalid cell are left out of DataGrid totals**, and their computed cells show an em dash.
- **Scoreboard wraps instead of scrolling.** Five or six figures sit in one row, three to a row below 64rem, and two by two on a phone; more than six wrap four to a row. Four figures stay two by two at 390 in both appearances (they no longer drop to one column), and divided strips draw rules both ways when they wrap.
- **KpiBoard uses Scoreboard `selectable`.** The KPI strip is a radiogroup (`role="radio"`, `aria-checked`, roving tabindex, arrow keys) instead of pressed toggle buttons. The picked card's badge reads "Charted" (was "In chart"). Below 40rem of block width the strip turns `divided`.
- **Conveyor docs and contract show chips and cards, not KPIs.** Conveyor is no longer a metric picker.
- **One header and footer for every overlay.** Modal, AlertDialog, Drawer and the AppShell work panel share the ModalCard header (18px h2 title, 14px description, 32px Close) and footer. AlertDialog now composes ModalCard, uses the Modal sizes (sm 352, md 448) and the 16px radius, and has sm buttons.
- **Side Drawer footers are a row.** Left and right Drawers put footerStart on the left and the actions on the right; only bottom stacks.
- **Below 480px** a left or right Drawer opens as the bottom sheet, and a large Modal fills the screen. The AppShell work panel's narrow Drawer follows, so it is a bottom sheet on phones.
- **Focus and page lock.** Modal and Drawer focus the first field in the body (not Close), or the dialog when there is none. The page behind is inert, scroll lock keeps the scrollbar gutter, and focus goes to the page heading when the opener is gone.
- **ModalCard lg padding is 24 (was 32).** A footer divider shows only while the body scrolls.
- **AppShell work panel** uses the ModalCard header with a real h2; Close is named Close. Escape closes it while focus is inside.
- **NotificationStack rows show unread as a shape and a word.** A 12px filled or hollow rail marker plus a New badge replaces the trailing dot; times sit in a mono 40px column. The bell is now an sm (32) Button, the Popover is 24rem, Mark all read and View all are ghost and outline sm Buttons (no text links), and Mark all read is announced. Below 40rem the list opens in a full-height Drawer.
- **CommentThread actions are kit Buttons and a menu.** One ghost sm Reply per thread, Edit and Delete in a More menu (DropdownMenu), and an md composer row with Comment beside a field that grows to four lines, plus a "⌘ Enter to send" hint.
- **CommentsPanel thread view.** All threads is a ghost Button, the thread says "3 comments · Open" in words, the inline header shows the open count, and Close, Back and Resolve grow to md on phones.
- **CommentsPanel inline is a complementary region named by `label`**, not a generic region. Below 40rem the back button reads "Threads".
- **NotificationStack and CommentsPanel headers are the same height (56).** The "2 open" count uses the same sans caption as "3 unread".
- **The NotificationStack bell is a kit IconButton.** It looks the same.
- **Progress bars have square ends**, like the ring caps.
- **Progress percent text is Geist Mono** with tabular figures (end, overlay and ring values).
- **Spinner `sm` is 12px** (was 14). md 16 and lg 20 stay.
- **A loading Button keeps its width.** With no leading icon, the inline padding makes room for the spinner instead of the button growing.
- **ProgressSteps shows a status word under every label:** Done, Current, Upcoming, Error or Optional. Screen readers hear the same word plus "step n of m".
- **Horizontal ProgressSteps goes compact in a narrow container.** Below 30rem it shows "Step n of m", the current label, and a kit Progress bar with the next step in words.
- **RunDetail `agents` is optional.** Leave it out for a single agent and no AgentTree renders.
- **AgentMonitor `collapsed` is now a one-row bar.** It shows the status as a Badge (icon and word) first, then the name and headline, then elapsed and cost (each value over its label). It shows Pause and Stop run while running, and Cancel run and Resume while paused. Before, the collapsed row showed the name with "elapsed · cost" under it and a dot status chip, and it had no actions. The step strip and the expand toggle stay where they were. Below 40rem the name and labels hide, time and cost read "0:04 · $0.02", and the actions take a full row. If you use `collapsed`, it now looks different, but it keeps the same props and doesn't break.
- **AgentTrail counter and current step.** A failed step with a later done step (its retry passed) now counts as finished: the counter moves past it and it no longer gets `aria-current`. A Done run with a retried step reads "5 of 5".
- **AgentTrail selected step** is a soft brand fill with a light brand edge (radius-control-md) instead of a heavy brand outline, so it no longer reads as a focus ring.
- **SetupGuide shows a status word on every row** (Done, Current, To do, Blocked, Skipped). The current task's action is now the one solid primary, or the first available provider's Connect when tiles show. To do keeps an outline Start, Undo skip is a ghost Button, and skipped tasks leave the progress total and percent, and the label says how many were skipped ("1 of 4 done · 1 skipped", 25%). The 24rem width cap and the Rocket icon are gone, so the guide fills its column. Below 30rem, a row with a button puts its status word under the task name.
- **IntegrationPicker tiles end in a status word** (Not connected, Connected, Connecting…, Coming soon) and at most one outline action. Connecting and Coming soon have no button, so there is no disabled Connect. The header drops the Plug icon and shows the connected count.
- **Onboarding pattern:** the Connect step's tasks start as To do, so the footer's Continue stays the step's one solid primary.
- **SideNav badges that are numbers render as a kit Count.** A badge such as `"3"` shows a neutral Count, brand-tinted on the active row, and the closed-rail tooltip reads the label plus the count ("Notifications, 3"). Word badges keep the old pill. The prop is still `badge`.
- **SideNav row text is bigger.** Rows use type-size-body and type-line-body (16/24 instead of 14), so rows are 40px tall.
- **SideNav parent rows no longer look selected.** Only the current leaf takes the page-active fill, even if you set `active` on the parent. Disabled rows lose their fill and keep faint text. Rows in a closed submenu are now inert, so Tab skips them.
- **app-shell: Quick actions uses a Search icon at md height (36px), and fills the row.** The icon-only search Button beside it now shows only when you pass `search.onSearch`, since without it the Button did the same as the field.
- **app-shell: the notifications panel uses the Popover header and footer.** The title is the Popover's 18px heading, Notification settings moves to the footer, tab counts use the Tabs `count`, and unread rows say "Unread" instead of showing a New badge.
- Sign in template: SSO buttons now sit above the email form under a Divider "or use email", the Card title is the page's h1, and the copy is "Work email", "Stay signed in 30 days" and an invite line ("No account? Ask your admin for an invite.") instead of a Sign up footer when `onSwitchMode` is left out. Below `--grid-breakpoint-sm` the card is size sm and Forgot password moves under Sign in.
- Sign in template: `error` also takes `{ title, detail }`, so the Alert says what happened and what to do next. A plain string still works. A new error clears the password (email kept) and focuses it.
- **Table md rows are 40px**, the same as the header (were 36px).
- **An empty Table shows a small Empty** (no-data icon and `emptyLabel`) instead of plain muted text.
- **In a flush Card, Table's first and last cells take the card padding**, so they line up with the card title.
- **Table rows may hold kit Cell values.** HeaderCell stays on DataTable. The DataTable doNot on pagination, loading and row actions now points to Table.
- **Headers share three title sizes: page 24, Section 18, Card 16, all at heading weight.** Section titles drop from 24 to 18 and Card titles from 24 to 16; the Section chevron is 16px.
- **PageHeader's eyebrow is sentence case (12/16, weight 500) instead of an uppercase overline,** and its lines are spaced with gap, so a header without an eyebrow or subtitle leaves no empty space.
- **On narrow headers (under 40rem) the breadcrumb trail shrinks to one back step** to the page before.
- **Tabs stay on one line and scroll sideways when they don't fit (the default `overflow="scroll"`)** instead of wrapping onto a second line.
- **Segmented Tabs use the SegmentedControl track:** the thumb's radius nests inside the track's and the label uses the UI line height.
- **Timeline says Now, Next or Later in every step's phase line**, so the status no longer relies on the dot colour. A phase that already says the word is not repeated.
- **Timeline hollow dots fill with `bg-surface`** instead of `transparent`, so the line no longer shows through.
- **Tooltip is portaled to `document.body` and flips and clamps like HelpPopover.** It no longer gets clipped by a parent's overflow or pushed off screen. Its `ref` is now null while it is closed.
- **Tooltip has a 100ms hide grace and tap-to-pin on touch.** The pointer can move onto the bubble without it closing; on a phone a tap shows it and a tap elsewhere hides it.
- **Tooltip, HelpPopover and Popover share one placement helper.** Popover now flips to the other side when there is no room.
- **HelpPopover uses the shared Escape stack.** Escape closes only the newest overlay, so a HelpPopover inside a Popover closes first and the Popover stays open.
- **HelpPopover corners are 8px (`--radius-surface-sm`) and HelpPopover and Popover titles are 18px at heading weight.**
- **Popover keeps Tab inside the panel** until Escape or a click outside closes it.
- **The Tooltip, HelpPopover and Popover contracts say when to use which**, and the Tooltip contract lists the tokens it really uses.

### Deprecated

- **AgentFleet is deprecated: use AgentOverview.** It is still exported and its docs page still works, but it is no longer in the docs nav, gallery, command palette or sitemap.
- **AgentLanes is deprecated: use AgentOverview with `view="timeline"`.** Still exported; the docs page stays reachable for old links.
- **LiveSession is deprecated: use RunDetail with `messages` and `onSend`, plus AgentOverview.** Still exported; `/blocks/live-session` still works, but the `/blocks` index no longer lists it.
- **AppDirectory is deprecated: use IntegrationPicker with `connectFlow="detail"` and `showConnected`.** Still exported; `/blocks/app-directory` still works, but the `/blocks` index no longer lists it.
- **AgentFleet, AgentLanes and LiveSession.** Use AgentOverview (and its Timeline view) and RunDetail with `messages` and `onSend`. AgentInbox, AgentTrail, AgentMonitor and TaskBoard stay exported for one more release, then become internal parts of AgentOverview, RunDetail and WorkBoard.
- **Card `headerAction.href` (and `linkAs`).** It still renders a link with the sm Button look. For new cards, put View all in the footer actions.
- **DatePicker `mode="range"`.** It still works and warns once in development. Use DateRangePicker, with `presets={[]}` for the months only.
- **Scoreboard `scroll`.** It has no effect: Scoreboard no longer composes Conveyor.
- **AppDirectory.** Use `<IntegrationPicker connectFlow="detail" showConnected />`. AppDirectory now renders exactly that, with Connected as a category segment instead of a FilterButton chip, and it will be removed in a later release.

### Removed

- **The Components gallery no longer has a level dropdown or a count line under the search.** Search and the group tabs stay, and each tab still shows how many components it holds, following the search. Old links with `?level=` open the full list.
- **The dashboard's MRR change strip** (`mrrSteps.ts`) and the per-tile sparkline looks (`metricLook`). The D design draws neither.
- **app-shell: the unread dot on the closed-rail Notifications icon.** The tooltip carries the count instead.

### Fixed

- **The kit README lists every block and pattern again.** Its counts and lists now come from `contracts/index.json`, so they stay current. Components, blocks and patterns are counted separately without deprecated ones (142 components, 12 blocks, 15 patterns), and one line names the deprecated ones that are still exported (4: AgentFleet, AgentLanes, LiveSession, AppDirectory).
- **CurrencyInput and NumberInput keep the symbol beside the number** on pages that load the shared control styles after theirs.
- **SideNav account avatar lines up with the nav icons.** SideNav.Account insets its 24px avatar by 4px, so its center sits on the same line as the 16px item icons, open or closed.
- **Section header actions wrap below the title when space runs short** instead of squeezing the title and description into a narrow column.
- **PermissionRequest header wraps.** In a narrow card the count and `requestedAt` line now moves under the title instead of squeezing the title to one word per line and running over it.
- Docs component pages: on the Preview tab the Controls panel no longer covers the component. It sits in its own column next to the canvas, and drops below the canvas when the preview area is narrow. On small screens a Controls toggle sits in the canvas corner, in a band kept clear above the component, and opens the controls in a kit Drawer from the bottom.
- **A chart directly in a Card no longer draws a second border.** LineChart, BarChart, ComboChart, PieChart, ScatterChart and Heatmap drop their own frame (border, radius, fill) when they sit directly in a Card body, padded or flush, the way DataTable does in a flush Card. In a flush Card the chart takes the card's inline padding, so its title lines up with the card header. Before, a chart with a title, legend, actions or the Table toggle drew its frame inside the card.
- **SideNav closed rail rounds all four corners.** The closed rail clipped the panel's trailing corners, so only the leading corners were rounded. The closed rail now carries the whole frame: one border and `--radius-surface-md` on every corner. The open rail and `radius="none"` are unchanged.
- **Focus ring on joined controls stays inside the focused piece.** ButtonGroup buttons, both SplitButton halves, SegmentedControl segments and both halves of a split FilterButton chip now draw a 2px `--border-focus` ring inside the focused piece (outline offset -2px), lifted above its neighbours so both shared edges show the focus colour and nothing bleeds over the next piece. Corners follow the piece: square where it joins, the group's radius at the ends. ButtonGroup and SplitButton also turn the focused button's border to `--border-focus` and add a thin `--focus-ring-offset` line inside the ring so it stays visible on a solid primary fill. Separate (gapped) controls such as InputOTP slots keep the outside ring on the active slot only.
- **DropdownMenu opens above its trigger when there is no room below,** so a menu near the bottom of the screen (such as an account menu at the foot of a side nav) no longer runs off-screen. Submenus do the same.
- **New types from the last releases are importable from `agentic-ds-kit`:** `ChatContext`, `ScoreboardItem`, `ScoreboardAppearance`, `ScorecardAppearance`, `ScorecardSelectionRole`, `LineChartSeries`, `LineChartReference`, `LineChartReferenceHighlight`, `ComboChartStack` and `ListViewDotTone`.
- **Charts redraw after switching from Table back to Chart.** LineChart, BarChart, ComboChart and ScatterChart measured only the first plot node, so after the table round trip the plot stayed blank until the page reloaded. The size hook now measures the remounted plot.
- **Two-column NavigationMenu dropdowns fit the page.** A `columns: 2` panel (DropdownMenu `columns={2}`) is now `--grid-width-sm` wide with two equal columns, puts each description under its title (two lines, then an ellipsis), and shifts left when it would run past the right edge of the screen. One-column menus are unchanged.
- **SetupGuide's Narrow example on the docs page renders at full width.** It had collapsed to a sliver, with "1 of 4 done" one letter per line, because its wrapper had no width and the guide, an inline-size container, has none of its own. The component itself is unchanged.
- **Tooltip arrow joins the bubble cleanly at any zoom.** The arrow is now one triangle tucked under the bubble's edge instead of a rotated square, so it keeps the same fill with no seam or step at 200–400% zoom and stays centred on the trigger on all four sides.
- **NotificationStack bell count is round.** A single-digit unread count is now a 16px circle with the number centred, instead of a slightly wider oval. Two or more digits (and 99+) still grow into a pill of the same height.
- **FailureClusters detail lines up.** The sample failing call spans the detail column, matching the chart card above, and Recent runs uses the Table's standard cell padding, so its text no longer sits on the table edge.
- **ToolCallCard head hover fits the card.** Open, the head's hover fill rounds only its top corners and joins the body square; closed, it still rounds all four.
- **Combobox, MultiSelect and TagInput list text lines up with the input at every size.** Option rows follow the field's `size`, so at sm, md and lg the option text starts exactly where the typed text does. TagInput suggestions now use the same row padding as Combobox and MultiSelect.
- **TagInput: the input keeps the normal control padding when it wraps onto its own row.** Its text no longer starts a few pixels from the border.
- ModelPicker menu items show context window and cost tier as plain text at the end of the description (for example "Deepest reasoning · 200K · High"), not as boxed key chips. Screen readers now read them with the item, instead of getting them as a keyboard shortcut.
- **TraceWaterfall bars stay readable in narrow cards.** Under 40rem of card width, each row puts the label, duration and cost on one line and draws the bar across the full width below it. Before, the bar lane shrank to nothing at phone width, the axis labels piled up and the cost column scrolled sideways. Wide cards are unchanged.
- **Scorecard no longer uses `transparent`.** The latest-point band and the dashed legend swatch mix against `surface-card`, and the plain appearance drops its border (selected draws an inset brand edge).
- **Combobox no longer swallows Escape when its list is closed.** Escape in a closed Combobox inside a Modal or Drawer now closes the Modal or Drawer.
- **Modal no longer clips a focused field's focus ring.** The scrolling body keeps 4px of room on every side, so the ring on a full-width Input, Select or Combobox shows whole.
- Escape now closes only the newest open overlay. A Combobox or MultiSelect list open inside a FilterBar chip's Popover closes on its own and leaves the Popover open; the next Escape closes the Popover. This holds when the parent re-renders with a new `onOpenChange`, as FilterBar does.
- The Field contract `passthrough` no longer says `div[role=group]`.
- **`review` pattern-fits no longer names a smaller pattern inside a bigger one.** When the parts that matched are ones the file's own pattern already brings (the dashboard or onboarding pattern and list-detail), it stays quiet, and when two patterns fit, the bigger one wins.

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
