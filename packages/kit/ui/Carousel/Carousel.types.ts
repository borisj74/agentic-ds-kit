import type { ReactNode } from "react";

export type CarouselOrientation = "horizontal" | "vertical";
export type CarouselAlign = "start" | "center";
export type CarouselSlidesPerView = 1 | 2 | 3 | 4;

export interface CarouselProps {
  items: ReactNode[];
  orientation?: CarouselOrientation;
  loop?: boolean;
  align?: CarouselAlign;
  slidesPerView?: CarouselSlidesPerView;
  showControls?: boolean;
  showIndex?: boolean;
  onIndexChange?: (index: number) => void;
  ariaLabel?: string;
}
