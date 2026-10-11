import type {
  ComponentPropsWithoutRef,
  HTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
} from "react";

export type SideNavSide = "left" | "right";

export type SideNavRadius = "md" | "none";

/** One preset row (the data shape of `groups` / `items` / `footer`). The component is `SideNavItem`. */
export interface SideNavItemData {
  id: string;
  label: string;
  href?: string;
  /** In-app select. When set, the leaf is a button and href is not used. */
  onClick?: () => void;
  /** Lucide name, via LucideByName from @/ui/Button/lucideName */
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  /** One nested submenu level. */
  items?: SideNavItemData[];
}

export interface SideNavGroup {
  label: string;
  items: SideNavItemData[];
}

/**
 * Customise one row. `defaultNode` is the kit row control (link or button) with its
 * a11y attributes (`aria-current`, `aria-expanded`/`aria-controls` on disclosures).
 * Return it wrapped, beside other content, or cloned with new children — keep it in the
 * tree so the row stays accessible. Nested submenus still render below parent rows.
 */
export type SideNavRenderItem = (item: SideNavItemData, defaultNode: ReactElement) => ReactNode;

/** Native aside attributes the kit sets itself (or replaces with its own prop). */
type SideNavOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes go to the root `<aside>`. `aria-label` defaults to `title`. */
export interface SideNavProps extends Omit<ComponentPropsWithoutRef<"aside">, SideNavOwnedKeys> {
  title: string;
  /** Brand letter; default first char of title. */
  mark?: string;
  /** Brand header and close. Default true. Set false when AppHeader already provides brand. */
  showHeader?: boolean;
  /** Rail corners. Default md. Use none when SideNav is flush in an app shell. */
  radius?: SideNavRadius;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SideNavSide;
  groups?: SideNavGroup[];
  /** Flat list if no groups. */
  items?: SideNavItemData[];
  /** Footer rows (one or many items), or any ReactNode (e.g. an account card). */
  footer?: SideNavItemData | SideNavItemData[] | ReactNode;
  /**
   * Slot: replaces the brand (mark + title) in the header. The Close button stays.
   * The mark is what reopens a closed rail, so with a custom header control `open` yourself.
   */
  header?: ReactNode;
  /** Slot: pinned above the scrolling groups (e.g. a workspace switcher). Hidden on the closed rail. */
  beforeGroups?: ReactNode;
  /** Slot: pinned below the scrolling groups, above the footer (e.g. a promo card). Hidden on the closed rail. */
  afterGroups?: ReactNode;
  /** Customise individual rows; see SideNavRenderItem. */
  renderItem?: SideNavRenderItem;
  ref?: Ref<HTMLElement>;
}

/* ---------- Building blocks (SideNav.Root, .Header, .Nav, .Section, .Item, .Slot, .Footer, .Toggle) ---------- */

/** Native aside attributes the kit sets itself on `SideNav.Root`. */
type SideNavRootOwnedKeys = "data-side";

/** `SideNav.Root`: the `<aside>` and its panel. Holds open/closed state for every block inside. */
export interface SideNavRootProps extends Omit<ComponentPropsWithoutRef<"aside">, SideNavRootOwnedKeys> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SideNavSide;
  /** Rail corners. Default md. Use none when flush in an app shell. */
  radius?: SideNavRadius;
  /** Header, Slot, Nav, Footer. */
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}

/** `SideNav.Header`: the top bar. Put brand, a switcher, and `SideNav.Toggle` (as a direct child) in it. */
export interface SideNavHeaderProps extends ComponentPropsWithoutRef<"header"> {
  ref?: Ref<HTMLElement>;
}

/** `SideNav.Nav`: the scrolling `<nav>` landmark. `aria-label` defaults to the root's `aria-label`. */
export interface SideNavNavProps extends ComponentPropsWithoutRef<"nav"> {
  ref?: Ref<HTMLElement>;
}

/** `SideNav.Section`: optional label plus the list of `SideNav.Item` rows. */
export interface SideNavSectionProps extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  /** Small caption above the rows. Fades on the closed rail. */
  label?: ReactNode;
  /** `SideNav.Item` rows only. */
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/** Row attributes the kit sets itself (or replaces with its own prop). */
type SideNavItemOwnedKeys =
  | "children"
  | "onClick"
  | "aria-current"
  | "aria-expanded"
  | "aria-controls"
  | "aria-describedby";

/**
 * `SideNav.Item`: one row. `ref`, `className` and other attributes go to the row control
 * (`<a>` when `href` is set, otherwise `<button>`); the `<li>` around it is structural.
 */
export interface SideNavItemProps extends Omit<HTMLAttributes<HTMLElement>, SideNavItemOwnedKeys> {
  label: string;
  /** Lucide name (e.g. "House") or your own icon node. */
  icon?: ReactNode;
  badge?: ReactNode;
  /** Current page: `aria-current="page"` and the active fill. */
  active?: boolean;
  disabled?: boolean;
  /** Link row. Ignored when `onClick` is set or the row has nested items. */
  href?: string;
  /** In-app select. The row is a button. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Nested `SideNav.Item` rows: the row becomes a disclosure (aria-expanded/controls). One level. */
  children?: ReactNode;
  /** Disclosure starts open. Default true. */
  defaultExpanded?: boolean;
  ref?: Ref<HTMLElement>;
}

/** `SideNav.Slot`: pinned content above or below the scrolling nav (switcher, promo, pinned items). */
export interface SideNavSlotProps extends ComponentPropsWithoutRef<"div"> {
  /** Spacing for above (`before`, default) or below (`after`) the nav. */
  placement?: "before" | "after";
  /** Keep the slot visible and focusable on the closed rail (e.g. pinned `SideNav.Item` rows). Default false: faded and inert. */
  keepOnRail?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/** `SideNav.Footer`: bottom bar. Put a `SideNav.Section` of rows or any node (account card) in it. */
export interface SideNavFooterProps extends ComponentPropsWithoutRef<"div"> {
  ref?: Ref<HTMLDivElement>;
}

/** Native button attributes the kit sets itself on `SideNav.Toggle`. */
type SideNavToggleOwnedKeys = "children" | "type" | "aria-label" | "draggable";

/**
 * `SideNav.Toggle`: kit Button that closes the open rail and reopens the closed one.
 * Stays at the rail's start edge when closed. `ref` and attributes go to the button.
 */
export interface SideNavToggleProps extends Omit<ComponentPropsWithoutRef<"button">, SideNavToggleOwnedKeys> {
  /** Accessible name while open. Default "Close". */
  closeLabel?: string;
  /** Accessible name while closed. Default "Open". */
  openLabel?: string;
  ref?: Ref<HTMLButtonElement>;
}
