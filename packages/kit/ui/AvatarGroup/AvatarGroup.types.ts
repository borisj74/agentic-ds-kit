import type { ComponentPropsWithoutRef, Ref } from "react";
import type { AvatarSize } from "../Avatar/Avatar.types";

export type AvatarGroupSize = AvatarSize;

export interface AvatarGroupItem {
  name: string;
  src?: string;
  initials?: string;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type AvatarGroupOwnedKeys = "children" | "role" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface AvatarGroupProps extends Omit<ComponentPropsWithoutRef<"div">, AvatarGroupOwnedKeys> {
  items: AvatarGroupItem[];
  size?: AvatarGroupSize;
  max?: number;
  ariaLabel?: string;
  ref?: Ref<HTMLDivElement>;
}
