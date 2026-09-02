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
  icon?: string;
  ariaLabel?: string;
  variant?: ButtonVariant;
  onClick?: () => void;
}

export interface CellProps {
  type?: CellType;
  size?: CellSize;
  text?: boolean;
  checkbox?: boolean;
  label?: string;
  name?: string;
  src?: string;
  initials?: string;
  people?: CellPerson[];
  icon?: string;
  tone?: BadgeTone;
  badges?: CellBadgeItem[];
  value?: string | number;
  options?: CellOption[];
  actions?: CellAction[];
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
}

export type CellValue = CellProps;
