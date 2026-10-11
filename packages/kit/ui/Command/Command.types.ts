import type { KitIcon } from "../Button/lucideName";
import type { ComponentPropsWithoutRef, Ref } from "react";

export interface CommandItem {
  id: string;
  label: string;
  icon?: KitIcon;
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
  ref?: Ref<HTMLDivElement>;
}
