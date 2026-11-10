import type { AppNavGroup, AppNavItem } from "agentic-ds-kit";

export const COMPONENT_ITEMS = [
  "accordion",
  "agentfleet",
  "agentinbox",
  "agentlanes",
  "agentmonitor",
  "agentplan",
  "agenttrail",
  "agenttree",
  "alert",
  "alertdialog",
  "anchornav",
  "appheader",
  "appnav",
  "approvalcard",
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
  "codesnippet",
  "collapsible",
  "colorpicker",
  "combobox",
  "command",
  "contextmenu",
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
  "input",
  "inputotp",
  "insightcard",
  "kbd",
  "linklist",
  "listview",
  "loadinganimation",
  "meter",
  "modal",
  "modalcard",
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
  "treeview",
  "usagelist",
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
    label: "Data",
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
  {
    label: "Agent",
    ids: ["agentfleet", "agentinbox", "agentlanes", "agentmonitor", "agentplan", "agenttrail", "agenttree", "approvalcard", "chat", "decisioncard", "insightcard", "loadinganimation", "numbertransition", "permissionrequest", "runningnow", "shimmertext", "thinkinganimation", "toolcallcard"],
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

export function buildPlaygroundNavGroups(pathname: string, hash: string): AppNavGroup[] {
  const h = hash.replace(/^#/, "").toLowerCase();
  const isActive = (href: string) => {
    const [path, fragment] = href.split("#");
    if (pathname !== path) return false;
    if (fragment) {
      const frag = fragment.toLowerCase();
      if (!h && path === "/foundations" && frag === "color") return true;
      if (!h && path === "/components" && frag === "gallery") return true;
      if (!h && path === "/patterns" && frag === "dashboard") return true;
      if (frag === "list-detail") {
        return (
          h === "list-detail" ||
          h === "launch-brief" ||
          h === "qa-checklist" ||
          h === "release-notes" ||
          h === "support-macros"
        );
      }
      if (frag === "empty") return h === "empty" || h === "research";
      return h === frag;
    }
    return !h;
  };

  const leaf = (href: string, label: string) => ({
    href,
    label,
    active: isActive(href),
  });

  return [
    {
      label: "Getting started",
      items: [
        leaf("/installation", "Installation"),
        leaf("/mcp", "MCP"),
        leaf("/theming", "Theming"),
        leaf("/theme", "Theme"),
        leaf("/studio", "Studio"),
      ],
    },
    {
      label: "Foundations",
      items: FOUNDATION_ITEMS.map((item) => leaf(`/foundations#${item.slug}`, item.label)),
    },
    {
      label: "Components",
      items: [
        {
          href: "/components",
          label: "Overview",
          active: pathname === "/components" && !h,
        },
        ...COMPONENT_GROUPS.map((group) => ({
          href: "/components",
          label: group.label,
          items: componentLeaves(group.ids, pathname),
        })),
      ],
    },
    {
      label: "Patterns",
      items: [
        leaf("/patterns", "Overview"),
        ...PATTERN_ITEMS.map((item) => leaf(`/patterns/${item.slug}`, item.label)),
      ],
    },
  ];
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
