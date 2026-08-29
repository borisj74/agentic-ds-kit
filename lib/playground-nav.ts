import type { AppNavGroup } from "@/ui/AppNav";

const COMPONENT_ITEMS = [
  "accordion",
  "alert",
  "alertdialog",
  "appnav",
  "avatar",
  "avatargroup",
  "badge",
  "breadcrumb",
  "button",
  "buttongroup",
  "calendar",
  "card",
  "cell",
  "checkbox",
  "collapsible",
  "command",
  "datatable",
  "datepicker",
  "dialog",
  "drawer",
  "field",
  "headercell",
  "input",
  "pageheader",
  "radiogroup",
  "scorecard",
  "scoreboard",
  "section",
  "select",
  "table",
  "tabs",
  "textarea",
  "tooltip",
] as const;

function componentLabel(id: string): string {
  if (id === "appnav") return "AppNav";
  if (id === "pageheader") return "PageHeader";
  if (id === "radiogroup") return "RadioGroup";
  if (id === "buttongroup") return "ButtonGroup";
  if (id === "alertdialog") return "AlertDialog";
  if (id === "avatar") return "Avatar";
  if (id === "avatargroup") return "AvatarGroup";
  if (id === "datatable") return "DataTable";
  if (id === "headercell") return "HeaderCell";
  if (id === "datepicker") return "DatePicker";
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
      if (!h && path === "/components" && frag === "button") return true;
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
      items: [leaf("/", "Home")],
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
      items: COMPONENT_ITEMS.map((id) => leaf(`/components#${id}`, componentLabel(id))),
    },
    {
      label: "Patterns",
      items: [
        leaf("/patterns#dashboard", "dashboard"),
        leaf("/patterns#settings-form", "settings-form"),
        leaf("/patterns#list-detail", "list-detail"),
      ],
    },
  ];
}

export const PLAYGROUND_APPNAV_DEMO_GROUPS: AppNavGroup[] = [
  {
    label: "Getting started",
    items: [{ href: "/", label: "Home", active: false }],
  },
  {
    label: "Components",
    items: [
      { href: "/components#button", label: "Button", active: true },
      { href: "/components#input", label: "Input", active: false },
    ],
  },
];
