import type { AppNavGroup } from "agentic-ds-kit";

export const COMPONENT_ITEMS = [
  "accordion",
  "alert",
  "alertdialog",
  "appheader",
  "appnav",
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
  "collapsible",
  "command",
  "datatable",
  "datepicker",
  "drawer",
  "dropdownmenu",
  "empty",
  "field",
  "fieldset",
  "headercell",
  "input",
  "inputotp",
  "insightcard",
  "listview",
  "loadinganimation",
  "modal",
  "modalcard",
  "navigationmenu",
  "numbertransition",
  "pageheader",
  "pagination",
  "progress",
  "progresssteps",
  "radiogroup",
  "scorecard",
  "scoreboard",
  "section",
  "select",
  "shimmertext",
  "slider",
  "spinner",
  "sidenav",
  "switch",
  "table",
  "tabs",
  "textarea",
  "thinkinganimation",
  "timeline",
  "toast",
  "tooltip",
] as const;

export function componentLabel(id: string): string {
  if (id === "appnav") return "AppNav";
  if (id === "appheader") return "AppHeader";
  if (id === "pageheader") return "PageHeader";
  if (id === "radiogroup") return "RadioGroup";
  if (id === "buttongroup") return "ButtonGroup";
  if (id === "alertdialog") return "AlertDialog";
  if (id === "avatar") return "Avatar";
  if (id === "avatargroup") return "AvatarGroup";
  if (id === "barchart") return "Bar";
  if (id === "datatable") return "DataTable";
  if (id === "headercell") return "HeaderCell";
  if (id === "datepicker") return "DatePicker";
  if (id === "insightcard") return "InsightCard";
  if (id === "linechart") return "Line";
  if (id === "listview") return "ListView";
  if (id === "modalcard") return "ModalCard";
  if (id === "navigationmenu") return "NavigationMenu";
  if (id === "piechart") return "Pie";
  if (id === "progresssteps") return "ProgressSteps";
  if (id === "scorecard") return "Scorecard";
  if (id === "scoreboard") return "Scoreboard";
  if (id === "sidenav") return "SideNav";
  if (id === "inputotp") return "InputOTP";
  if (id === "dropdownmenu") return "DropdownMenu";
  if (id === "fieldset") return "FieldSet";
  if (id === "loadinganimation") return "LoadingAnimation";
  if (id === "numbertransition") return "NumberTransition";
  if (id === "shimmertext") return "ShimmerText";
  if (id === "thinkinganimation") return "ThinkingAnimation";
  if (id === "timeline") return "Timeline";
  if (id === "toast") return "Toast";
  return id.charAt(0).toUpperCase() + id.slice(1);
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
        leaf("/theming", "Theming"),
      ],
    },
    {
      label: "Foundations",
      items: [
        leaf("/foundations#color", "Color"),
        leaf("/foundations#typography", "Typography"),
        leaf("/foundations#spacing", "Spacing"),
        leaf("/foundations#icons", "Icons"),
        leaf("/foundations#grid", "Grid systems"),
        leaf("/foundations#radius", "Radius"),
        leaf("/foundations#border", "Border"),
        leaf("/foundations#shadow", "Shadow"),
        leaf("/foundations#motion", "Motion"),
        leaf("/foundations#opacity", "Opacity"),
      ],
    },
    {
      label: "Components",
      items: [
        leaf("/components#gallery", "Gallery"),
        ...COMPONENT_ITEMS.flatMap((id) => {
          const item = leaf(`/components#${id}`, componentLabel(id));
          if (id !== "cell") return [item];
          return [
            item,
            {
              href: "/components#chart",
              label: "Chart",
              items: [
                leaf("/components#barchart", "Bar"),
                leaf("/components#linechart", "Line"),
                leaf("/components#piechart", "Pie"),
              ],
            },
          ];
        }),
      ],
    },
    {
      label: "Patterns",
      items: [
        leaf("/patterns#dashboard", "Dashboard"),
        leaf("/patterns#activity", "Activity"),
        leaf("/patterns#inbox", "Inbox"),
        leaf("/patterns#settings", "Settings"),
        leaf("/patterns#list-detail", "List detail"),
        leaf("/patterns#invite", "Invite"),
        leaf("/patterns#insights", "Assistant"),
        leaf("/patterns#empty", "Empty"),
      ],
    },
  ];
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
      { href: "/patterns#inbox", label: "Inbox", active: true },
      { href: "/patterns#activity", label: "Activity", active: false },
    ],
  },
];
