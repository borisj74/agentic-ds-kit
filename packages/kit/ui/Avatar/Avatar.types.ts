import type { ComponentPropsWithoutRef, Ref } from "react";

/** xs 20, sm 24, md 32, lg 40, xl 48. */
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

/** circle for people, square for organisations (customers, workspaces). */
export type AvatarShape = "circle" | "square";

/** A mark at the corner plus a word in the accessible name. Never colour alone. */
export type AvatarPresence = "online" | "away" | "offline";

/** Native span attributes the kit sets itself (or replaces with its own prop). */
type AvatarOwnedKeys = "children" | "role" | "aria-label";

/** `ref`, `className` and other native attributes land on the root `<span>`. */
export interface AvatarProps extends Omit<ComponentPropsWithoutRef<"span">, AvatarOwnedKeys> {
  name: string;
  src?: string;
  initials?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  presence?: AvatarPresence;
  ref?: Ref<HTMLSpanElement>;
}
