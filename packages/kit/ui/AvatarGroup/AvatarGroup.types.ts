import type { AvatarSize } from "../Avatar/Avatar.types";

export type AvatarGroupSize = AvatarSize;

export interface AvatarGroupItem {
  name: string;
  src?: string;
  initials?: string;
}

export interface AvatarGroupProps {
  items: AvatarGroupItem[];
  size?: AvatarGroupSize;
  max?: number;
  ariaLabel?: string;
}
