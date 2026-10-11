import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type CarouselOrientation = "horizontal" | "vertical";
export type CarouselAlign = "start" | "center";
export type CarouselSlidesPerView = 1 | 2 | 3 | 4;

/** Root attributes the kit sets itself (`aria-label` comes from `ariaLabel`; arrow keys from `onKeyDown`). */
type CarouselOwnedKeys =
  | "children"
  | "role"
  | "tabIndex"
  | "onKeyDown"
  | "aria-roledescription"
  | "aria-label";

/** `ref`, `className` and other attributes land on the root carousel region `<div>`. */
export interface CarouselProps extends Omit<ComponentPropsWithoutRef<"div">, CarouselOwnedKeys> {
  items: ReactNode[];
  orientation?: CarouselOrientation;
  loop?: boolean;
  align?: CarouselAlign;
  slidesPerView?: CarouselSlidesPerView;
  showControls?: boolean;
  showIndex?: boolean;
  onIndexChange?: (index: number) => void;
  ariaLabel?: string;
  ref?: Ref<HTMLDivElement>;
}
