export type AnchorNavVariant = "rail" | "menu";

export interface AnchorNavItem {
  /** Must match the id of a section on the page. */
  id: string;
  label: string;
}

export interface AnchorNavProps {
  items: AnchorNavItem[];
  /** rail is the list beside the page. menu is the same list in a popover. */
  variant?: AnchorNavVariant;
  /** Follow the section in view. Default true. */
  spy?: boolean;
  /** Pixels to keep clear of a sticky header when jumping. Default 0. */
  offset?: number;
  ariaLabel?: string;
  /** Menu trigger label before a section is current. Default "On this page". */
  menuLabel?: string;
  className?: string;
}
