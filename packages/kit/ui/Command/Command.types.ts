import type { KitIcon } from "../Button/lucideName";
import type { ComponentPropsWithoutRef, Ref } from "react";

export interface CommandItem {
  id: string;
  label: string;
  icon?: KitIcon;
  /** Short subtle text after the label, one line with an ellipsis. Also matched by search. */
  description?: string;
  /** Extra words search matches (not shown), e.g. ["bill", "payment"] for Invoices. */
  keywords?: string[];
  shortcut?: string;
  disabled?: boolean;
}

export interface CommandGroup {
  heading?: string;
  items: CommandItem[];
}

/** Native div attributes the kit sets itself on the root (or replaces with its own prop). */
type CommandOwnedKeys = "children" | "onSelect";

/** `ref`, `className` and other native attributes go to the root `<div>`; the combobox input and listbox stay kit-owned. */
export interface CommandProps extends Omit<ComponentPropsWithoutRef<"div">, CommandOwnedKeys> {
  placeholder?: string;
  empty?: string;
  groups: CommandGroup[];
  onSelect?: (id: string) => void;
  label?: string;
  /** Async results on the way: shows a kit Spinner row and sets aria-busy on the list. Items already passed stay visible. */
  loading?: boolean;
  /** Adds an "Ask Chat" row at the foot of the list (and in the empty state). Called with the current query. */
  onAsk?: (query: string) => void;
  ref?: Ref<HTMLDivElement>;
}
