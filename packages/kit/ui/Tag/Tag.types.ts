import type { MouseEvent } from "react";

export type TagSize = "sm" | "md" | "lg";
export type TagDotTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface TagAvatar {
  name: string;
  src?: string;
}

export interface TagProps {
  children: string;
  size?: TagSize;
  /** Show a trailing remove (X) button. */
  removable?: boolean;
  /** Receives the click event so a parent control (e.g. a Select trigger) can stop propagation. */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Leading kit Checkbox, labelled by the Tag text. */
  selectable?: boolean;
  /** Controlled selected state (selectable only). */
  selected?: boolean;
  /** Uncontrolled initial selected state (selectable only). */
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Trailing kit Count (neutral, subtle). */
  count?: number;
  /** Leading status dot. */
  dot?: TagDotTone;
  /** Leading kit Avatar. */
  avatar?: TagAvatar;
  disabled?: boolean;
  /** Checkbox id when selectable; generated when omitted. */
  id?: string;
}
