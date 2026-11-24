import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type SectionSize = "sm" | "md" | "lg";
export type SectionHeadingLevel = 2 | 3 | 4;

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type SectionOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface SectionProps extends Omit<ComponentPropsWithoutRef<"section">, SectionOwnedKeys> {
  title?: string;
  description?: string;
  /** Short sentence-case line above the title, such as the area it belongs to. */
  eyebrow?: string;
  /** A number beside the title, shown as a neutral kit Count. */
  count?: number;
  /** Heading element for the title. Default 2; use 3 or 4 when the Section sits under another heading. */
  headingLevel?: SectionHeadingLevel;
  /** A hairline under the header. */
  divider?: boolean;
  /** The header sticks to the top of its scroll container while the body scrolls under it. */
  sticky?: boolean;
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
