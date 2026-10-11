import type { ComponentPropsWithoutRef, Ref } from "react";

export interface LinkListItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
  description?: string;
  external?: boolean;
}

/** Native ul attributes the kit sets itself (or replaces with its own prop). */
type LinkListOwnedKeys = "children" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<ul>`. */
export interface LinkListProps extends Omit<ComponentPropsWithoutRef<"ul">, LinkListOwnedKeys> {
  items: LinkListItem[];
  label?: string;
  ref?: Ref<HTMLUListElement>;
}
