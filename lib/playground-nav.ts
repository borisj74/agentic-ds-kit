import type { AppNavGroup } from "@/ui/AppNav";

const COMPONENT_ITEMS = [
  "button",
  "scorecard",
  "scoreboard",
  "input",
  "textarea",
  "select",
  "checkbox",
  "radiogroup",
  "field",
  "tag",
  "tooltip",
  "tabs",
  "modal",
  "pageheader",
  "section",
  "appnav",
  "table",
] as const;

function componentLabel(id: string): string {
  if (id === "radiogroup") return "RadioGroup";
  if (id === "pageheader") return "PageHeader";
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
        leaf("/foundations#radius", "Radius"),
        leaf("/foundations#border", "Border"),
        leaf("/foundations#shadow", "Shadow"),
        leaf("/foundations#motion", "Motion"),
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
