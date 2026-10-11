import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from "react";

export type SideNavSide = "left" | "right";

export type SideNavRadius = "md" | "none";

export interface SideNavItem {
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
  items?: SideNavItem[];
}

export interface SideNavGroup {
  label: string;
  items: SideNavItem[];
}

/**
 * Customise one row. `defaultNode` is the kit row control (link or button) with its
 * a11y attributes (`aria-current`, `aria-expanded`/`aria-controls` on disclosures).
 * Return it wrapped, beside other content, or cloned with new children — keep it in the
 * tree so the row stays accessible. Nested submenus still render below parent rows.
 */
export type SideNavRenderItem = (item: SideNavItem, defaultNode: ReactElement) => ReactNode;

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
  items?: SideNavItem[];
  /** Footer rows (one or many items), or any ReactNode (e.g. an account card). */
  footer?: SideNavItem | SideNavItem[] | ReactNode;
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
