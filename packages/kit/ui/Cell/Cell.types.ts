import type { KitIcon } from "../Button/lucideName";
import type { ComponentPropsWithoutRef, Ref } from "react";
import type { BadgeTone } from "../Badge/Badge.types";
import type { ButtonVariant } from "../Button/Button.types";

export type CellType =
  | "text"
  | "avatar"
  | "file"
  | "payment"
  | "badge"
  | "badges"
  | "trendPositive"
  | "trendNegative"
  | "avatarGroup"
  | "select"
  | "progress"
  | "rating"
  | "actions"
  | "actionIcons"
  | "actionMenu";

export type CellSize = "sm" | "md";

export interface CellPerson {
  name: string;
  src?: string;
  initials?: string;
}

export interface CellBadgeItem {
  label: string;
  tone?: BadgeTone;
}

export interface CellOption {
  value: string;
  label: string;
}

export interface CellAction {
  label?: string;
  icon?: KitIcon;
  ariaLabel?: string;
  variant?: ButtonVariant;
  onClick?: () => void;
}

/** Root attributes the kit sets itself. `id` is the kit's prop for the row checkbox. */
type CellOwnedKeys = "children" | "id" | "aria-label";

/** `ref`, `className` and other attributes land on the root `<span>`; `id` goes to the checkbox. */
export interface CellProps extends Omit<ComponentPropsWithoutRef<"span">, CellOwnedKeys> {
  type?: CellType;
  size?: CellSize;
  text?: boolean;
  checkbox?: boolean;
  label?: string;
  name?: string;
  src?: string;
  initials?: string;
  people?: CellPerson[];
  icon?: KitIcon;
  tone?: BadgeTone;
  badges?: CellBadgeItem[];
  value?: string | number;
  options?: CellOption[];
  actions?: CellAction[];
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  ref?: Ref<HTMLSpanElement>;
}

export type CellValue = CellProps;
