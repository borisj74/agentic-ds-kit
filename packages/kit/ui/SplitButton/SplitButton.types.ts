import type { ComponentPropsWithoutRef, MouseEventHandler, Ref } from "react";
import type { ButtonAppearance, ButtonMode, ButtonSize, ButtonType } from "../Button/Button.types";
import type { KitIcon } from "../Button/lucideName";
import type { DropdownMenuAlign, DropdownMenuGroup } from "../DropdownMenu/DropdownMenu.types";

/** Native button attributes the kit sets itself (or replaces with its own prop). */
type SplitButtonOwnedKeys =
  | "children"
  | "className"
  | "type"
  | "onClick"
  | "onSelect"
  | "draggable"
  | "aria-label"
  | "aria-disabled";

/**
 * `ref` and other native attributes go to the main action button. `className` goes to the root
 * wrapper. The chevron button and the menu stay kit-owned.
 */
export interface SplitButtonProps extends Omit<ComponentPropsWithoutRef<"button">, SplitButtonOwnedKeys> {
  /** Label of the main action, like "Save invoice". */
  children: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** The other actions, in kit DropdownMenu groups. */
  groups: DropdownMenuGroup[];
  onSelect?: (id: string) => void;
  /** Accessible name of the chevron button. Default: "{children} options". */
  menuLabel?: string;
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  mode?: ButtonMode;
  disabled?: boolean;
  /** The main action is running. See Button `loading`. The menu stays open to use. */
  loading?: boolean;
  iconStart?: KitIcon;
  type?: ButtonType;
  align?: DropdownMenuAlign;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}
