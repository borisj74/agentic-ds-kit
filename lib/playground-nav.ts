import type { AppNavGroup, AppNavItem } from "agentic-ds-kit";

export const COMPONENT_ITEMS = [
  "accordion",
  "agentfleet",
  "agentinbox",
  "agentlanes",
  "agentmonitor",
  "agentplan",
  "agentsteering",
  "agenttrail",
  "agenttree",
  "alert",
  "alertdialog",
  "anchornav",
  "appheader",
  "appnav",
  "approvalcard",
  "autonomydial",
  "avatar",
  "avatargroup",
  "badge",
  "breadcrumb",
  "button",
  "buttongroup",
  "calendar",
  "card",
  "carousel",
  "cell",
  "chat",
  "checkbox",
  "citedanswer",
  "codesnippet",
  "collapsible",
  "colorpicker",
  "combobox",
  "command",
  "contextmenu",
  "contextwindow",
  "conveyor",
  "count",
  "currencyinput",
  "datagrid",
  "datatable",
  "datepicker",
  "daterangepicker",
  "datetimepicker",
  "decisioncard",
  "divider",
  "drawer",
  "dropdownmenu",
  "empty",
  "field",
  "fieldset",
  "filterbar",
  "filterbutton",
  "fileupload",
  "headercell",
  "helppopover",
  "inlinediff",
  "input",
  "inputotp",
  "insightcard",
  "kbd",
  "linklist",
  "listview",
  "loadinganimation",
  "memorypanel",
  "messageactions",
  "meter",
  "modal",
  "modalcard",
  "modelpicker",
  "multiselect",
  "navigationmenu",
  "numberinput",
  "numbertransition",
  "pageheader",
  "pagination",
  "permissionrequest",
  "popover",
  "progress",
  "progresssteps",
  "radiogroup",
  "resizable",
  "runningnow",
  "scorecard",
  "scoreboard",
  "section",
  "segmentedcontrol",
  "select",
  "shimmertext",
  "slider",
  "spinner",
  "sidenav",
  "skeleton",
  "switch",
  "table",
  "tabs",
  "tag",
  "taginput",
  "textarea",
  "timepicker",
  "tilegroup",
  "thinkinganimation",
  "timeline",
  "toast",
  "toolcallcard",
  "tooltip",
  "tracewaterfall",
  "treeview",
  "usagelist",
  "usagemeter",
] as const;

export function componentLabel(id: string): string {
  if (id === "agentfleet") return "AgentFleet";
  if (id === "agentplan") return "AgentPlan";
  if (id === "agenttrail") return "AgentTrail";
  if (id === "approvalcard") return "ApprovalCard";
  if (id === "agentmonitor") return "AgentMonitor";
  if (id === "permissionrequest") return "PermissionRequest";
  if (id === "runningnow") return "RunningNow";
  if (id === "toolcallcard") return "ToolCallCard";
  if (id === "agenttree") return "AgentTree";
  if (id === "agentlanes") return "AgentLanes";
  if (id === "agentinbox") return "AgentInbox";
  if (id === "decisioncard") return "DecisionCard";
  if (id === "autonomydial") return "AutonomyDial";
  if (id === "agentsteering") return "AgentSteering";
  if (id === "modelpicker") return "ModelPicker";
  if (id === "contextwindow") return "ContextWindow";
  if (id === "citedanswer") return "CitedAnswer";
  if (id === "messageactions") return "MessageActions";
  if (id === "inlinediff") return "InlineDiff";
  if (id === "memorypanel") return "MemoryPanel";
  if (id === "tracewaterfall") return "TraceWaterfall";
  if (id === "usagemeter") return "UsageMeter";
  if (id === "anchornav") return "AnchorNav";
  if (id === "appnav") return "AppNav";
  if (id === "appheader") return "AppHeader";
  if (id === "pageheader") return "PageHeader";
  if (id === "radiogroup") return "RadioGroup";
  if (id === "buttongroup") return "ButtonGroup";
  if (id === "alertdialog") return "AlertDialog";
  if (id === "avatar") return "Avatar";
  if (id === "avatargroup") return "AvatarGroup";
  if (id === "barchart") return "Bar";
  if (id === "datagrid") return "DataGrid";
  if (id === "datatable") return "DataTable";
  if (id === "headercell") return "HeaderCell";
  if (id === "helppopover") return "HelpPopover";
  if (id === "combobox") return "Combobox";
  if (id === "contextmenu") return "ContextMenu";
  if (id === "currencyinput") return "CurrencyInput";
  if (id === "datetimepicker") return "DateTimePicker";
  if (id === "datepicker") return "DatePicker";
  if (id === "daterangepicker") return "DateRangePicker";
  if (id === "insightcard") return "InsightCard";
  if (id === "kbd") return "Kbd";
  if (id === "segmentedcontrol") return "SegmentedControl";
  if (id === "tilegroup") return "TileGroup";
  if (id === "linechart") return "Line";
  if (id === "listview") return "ListView";
  if (id === "modalcard") return "ModalCard";
  if (id === "multiselect") return "MultiSelect";
  if (id === "navigationmenu") return "NavigationMenu";
  if (id === "piechart") return "Pie";
  if (id === "progresssteps") return "ProgressSteps";
  if (id === "scorecard") return "Scorecard";
  if (id === "scoreboard") return "Scoreboard";
  if (id === "sidenav") return "SideNav";
  if (id === "inputotp") return "InputOTP";
  if (id === "dropdownmenu") return "DropdownMenu";
  if (id === "fieldset") return "FieldSet";
  if (id === "filterbutton") return "FilterButton";
  if (id === "fileupload") return "FileUpload";
  if (id === "filterbar") return "FilterBar";
  if (id === "codesnippet") return "CodeSnippet";
  if (id === "colorpicker") return "ColorPicker";
  if (id === "linklist") return "LinkList";
  if (id === "loadinganimation") return "LoadingAnimation";
  if (id === "numberinput") return "NumberInput";
  if (id === "numbertransition") return "NumberTransition";
  if (id === "shimmertext") return "ShimmerText";
  if (id === "thinkinganimation") return "ThinkingAnimation";
  if (id === "timeline") return "Timeline";
  if (id === "toast") return "Toast";
  if (id === "treeview") return "TreeView";
  if (id === "usagelist") return "UsageList";
  if (id === "taginput") return "TagInput";
  if (id === "timepicker") return "TimePicker";
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/** Docs sidebar groups. Charts are their own group, not a nest under Cell. */
export const COMPONENT_GROUPS = [
  {
    label: "AI",
    ids: ["agentfleet", "agentinbox", "agentlanes", "agentmonitor", "agentplan", "agentsteering", "agenttrail", "agenttree", "approvalcard", "autonomydial", "chat", "citedanswer", "contextwindow", "decisioncard", "inlinediff", "insightcard", "loadinganimation", "memorypanel", "messageactions", "modelpicker", "numbertransition", "permissionrequest", "runningnow", "shimmertext", "thinkinganimation", "toolcallcard", "tracewaterfall", "usagemeter"],
  },
  {
    label: "Forms",
    ids: [
      "button",
      "buttongroup",
      "checkbox",
      "colorpicker",
      "combobox",
      "currencyinput",
      "datepicker",
      "daterangepicker",
      "datetimepicker",
      "field",
      "fieldset",
      "fileupload",
      "filterbar",
      "filterbutton",
      "input",
      "inputotp",
      "multiselect",
      "numberinput",
      "radiogroup",
      "select",
      "segmentedcontrol",
      "taginput",
      "slider",
      "switch",
      "textarea",
      "tilegroup",
      "timepicker",
    ],
  },
  {
    label: "Data display",
    ids: [
      "accordion",
      "avatar",
      "avatargroup",
      "calendar",
      "card",
      "carousel",
      "cell",
      "codesnippet",
      "collapsible",
      "conveyor",
      "datagrid",
      "datatable",
      "divider",
      "headercell",
      "listview",
      "meter",
      "scorecard",
      "scoreboard",
      "section",
      "resizable",
      "table",
      "timeline",
      "treeview",
      "usagelist",
    ],
  },
  {
    label: "Overlays",
    ids: ["alertdialog", "command", "contextmenu", "drawer", "dropdownmenu", "helppopover", "modal", "modalcard", "popover"],
  },
  {
    label: "Navigation",
    ids: [
      "anchornav",
      "appheader",
      "appnav",
      "breadcrumb",
      "linklist",
      "navigationmenu",
      "pageheader",
      "pagination",
      "sidenav",
      "tabs",
    ],
  },
  {
    label: "Feedback",
    ids: [
      "alert",
      "badge",
      "count",
      "kbd",
      "empty",
      "progress",
      "progresssteps",
      "skeleton",
      "spinner",
      "tag",
      "toast",
      "tooltip",
    ],
  },
  {
    label: "Charts",
    ids: ["barchart", "linechart", "piechart"],
  },
] as const;

export const FOUNDATION_ITEMS = [
  { slug: "color", label: "Color" },
  { slug: "typography", label: "Typography" },
  { slug: "spacing", label: "Spacing" },
  { slug: "icons", label: "Icons" },
  { slug: "grid", label: "Grid systems" },
  { slug: "radius", label: "Radius" },
  { slug: "border", label: "Border" },
  { slug: "shadow", label: "Shadow" },
  { slug: "motion", label: "Motion" },
  { slug: "opacity", label: "Opacity" },
] as const;

export const PATTERN_ITEMS = [
  { slug: "dashboard", label: "Dashboard" },
  { slug: "settings", label: "Settings" },
  { slug: "list-detail", label: "List detail" },
  { slug: "empty", label: "Empty" },
  { slug: "sign-in", label: "Sign in" },
  { slug: "app-shell", label: "App shell" },
  { slug: "layouts", label: "Layouts" },
] as const;

export type PatternSlug = (typeof PATTERN_ITEMS)[number]["slug"];

const PATTERN_HASH_ALIASES: Record<string, PatternSlug> = {
  research: "empty",
  projects: "list-detail",
  "launch-brief": "list-detail",
  "qa-checklist": "list-detail",
  "release-notes": "list-detail",
  "support-macros": "list-detail",
  activity: "dashboard",
  inbox: "dashboard",
  invite: "dashboard",
  delivery: "dashboard",
  insights: "dashboard",
};

export function isPatternSlug(value: string): value is PatternSlug {
  return PATTERN_ITEMS.some((item) => item.slug === value);
}

/** Old `/patterns#…` links land on the matching route. Unknown hashes open Dashboard. */
export function patternSlugFromHash(hash: string): PatternSlug {
  const key = hash.replace(/^#/, "").toLowerCase();
  if (isPatternSlug(key)) return key;
  return PATTERN_HASH_ALIASES[key] ?? "dashboard";
}

export interface ComponentNavLink {
  id: string;
  href: string;
  label: string;
}

export interface PlaygroundCommandLink {
  id: string;
  label: string;
  href: string;
}

export interface PlaygroundCommandSection {
  heading: "Foundations" | "Components" | "Patterns";
  items: PlaygroundCommandLink[];
}

/** Pages the command palette can open: foundations, every component, every pattern. */
export function playgroundCommandSections(): PlaygroundCommandSection[] {
  return [
    {
      heading: "Foundations",
      items: FOUNDATION_ITEMS.map((item) => ({
        id: `foundation:${item.slug}`,
        label: item.label,
        href: `/foundations#${item.slug}`,
      })),
    },
    {
      heading: "Components",
      items: componentNavLinks().map((link) => ({
        id: `component:${link.id}`,
        label: link.label,
        href: link.href,
      })),
    },
    {
      heading: "Patterns",
      items: PATTERN_ITEMS.map((item) => ({
        id: `pattern:${item.slug}`,
        label: item.label,
        href: `/patterns/${item.slug}`,
      })),
    },
  ];
}

export function componentNavLinks(): ComponentNavLink[] {
  return COMPONENT_GROUPS.flatMap((group) =>
    group.ids.map((id) => ({
      id,
      href: `/components/${id}`,
      label: componentLabel(id),
    })),
  );
}

export function componentNeighbors(id: string): {
  prev: ComponentNavLink | null;
  next: ComponentNavLink | null;
} {
  const links = componentNavLinks();
  const index = links.findIndex((link) => link.id === id);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? links[index - 1] : null,
    next: index < links.length - 1 ? links[index + 1] : null,
  };
}

function componentLeaves(ids: readonly string[], pathname: string) {
  return ids
    .map((id) => ({
      href: `/components/${id}`,
      label: componentLabel(id),
      active: pathname === `/components/${id}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));
}

/** Top-level pages in the site nav, in order. */
export const SITE_PAGES = [
  { href: "/get-started", label: "Get started", match: ["/get-started", "/installation"] },
  { href: "/mcp", label: "MCP server", match: ["/mcp"] },
  { href: "/theming", label: "Theming", match: ["/theming", "/theme"] },
  { href: "/foundations", label: "Foundations", match: ["/foundations"] },
  { href: "/components", label: "Components", match: ["/components"] },
  { href: "/patterns", label: "Patterns", match: ["/patterns", "/studio"] },
] as const;

function pageActive(pathname: string, match: readonly string[]): boolean {
  return match.some((path) => pathname === path || (path !== "/components" && pathname.startsWith(`${path}/`)));
}

/**
 * The site nav: the top-level pages, with every component group as a subgroup (with its count)
 * directly under Components.
 * The group that holds the current component opens on its own (AppNav subgroup behaviour).
 */
export function buildSiteNavItems(pathname: string): AppNavItem[] {
  const groups: AppNavItem[] = COMPONENT_GROUPS.map((group) => ({
    href: `/components?group=${encodeURIComponent(group.label)}`,
    label: `${group.label} · ${group.ids.length}`,
    items: componentLeaves(group.ids, pathname),
  }));
  // The groups sit right under Components, as its subtree (AppNav nests one level, so the
  // shell indents them).
  return SITE_PAGES.flatMap((page) => {
    const item = { href: page.href, label: page.label, active: pageActive(pathname, page.match) };
    return page.href === "/components" ? [item, ...groups] : [item];
  });
}

/** Search keeps only matching links, flat, so every hit is visible. */
export function filterSiteNavItems(items: AppNavItem[], query: string): AppNavItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.flatMap((item) =>
    item.items && item.items.length > 0
      ? item.items.filter((child) => itemMatches(child, normalized))
      : itemMatches(item, normalized)
        ? [item]
        : [],
  );
}

function itemMatches(item: AppNavItem, query: string): boolean {
  const href = item.href.toLowerCase();
  const label = item.label.toLowerCase();
  return label.includes(query) || href.includes(query);
}

/** Keep groups that match the query, and the leaves inside them that match. */
export function filterPlaygroundNavGroups(groups: AppNavGroup[], query: string): AppNavGroup[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return groups;

  return groups.flatMap((group) => {
    if (group.label.toLowerCase().includes(normalized)) return [group];
    const items = group.items.flatMap((item) => {
      if (item.items && item.items.length > 0) {
        if (itemMatches(item, normalized)) return [item];
        const children = item.items.filter((child) => itemMatches(child, normalized));
        return children.length > 0 ? [{ ...item, items: children }] : [];
      }
      return itemMatches(item, normalized) ? [item] : [];
    });
    return items.length > 0 ? [{ ...group, items }] : [];
  });
}

/** Search results skip the accordion so every match is visible. */
export function flattenPlaygroundNav(groups: AppNavGroup[]): AppNavItem[] {
  return groups.flatMap((group) =>
    group.items.flatMap((item) => (item.items && item.items.length > 0 ? item.items : [item])),
  );
}

export const PLAYGROUND_APPNAV_DEMO_GROUPS: AppNavGroup[] = [
  {
    label: "Getting started",
    items: [
      { href: "/installation", label: "Installation", active: false },
      { href: "/theming", label: "Theming", active: false },
    ],
  },
  {
    label: "Patterns",
    items: [
      { href: "/patterns/dashboard", label: "Dashboard", active: true },
      { href: "/patterns/settings", label: "Settings", active: false },
    ],
  },
];
