import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type SectionSize = "sm" | "md" | "lg";

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type SectionOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface SectionProps extends Omit<ComponentPropsWithoutRef<"section">, SectionOwnedKeys> {
  title?: string;
  description?: string;
  size?: SectionSize;
  actions?: ReactNode;
  children: ReactNode;
  /** When true, a chevron before the title toggles the body. Default false. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  ref?: Ref<HTMLElement>;
}
