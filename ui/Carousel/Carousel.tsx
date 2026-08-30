"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/ui/Button";
import type { CarouselProps } from "./Carousel.types";
import styles from "./Carousel.module.css";

export type {
  CarouselProps,
  CarouselOrientation,
  CarouselAlign,
  CarouselSlidesPerView,
} from "./Carousel.types";

export function Carousel({
  items,
  orientation = "horizontal",
  loop = false,
  align = "start",
  slidesPerView = 1,
  showControls = true,
  showIndex = false,
  onIndexChange,
  ariaLabel = "Carousel",
}: CarouselProps) {
  const [viewportRef, emblaApi] = useEmblaCarousel({
    axis: orientation === "vertical" ? "y" : "x",
    loop,
    align,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [index, setIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(Math.max(items.length, 1));
  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

  const sync = useCallback(() => {
    if (!emblaApi) return;
    const nextIndex = emblaApi.selectedScrollSnap();
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setIndex(nextIndex);
    setSnapCount(emblaApi.scrollSnapList().length);
    onIndexChangeRef.current?.(nextIndex);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    sync();
    emblaApi.on("select", sync);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("select", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi, sync]);

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, items.length, slidesPerView]);

  function scrollPrev() {
    emblaApi?.scrollPrev();
  }

  function scrollNext() {
    emblaApi?.scrollNext();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    if (event.key === prevKey) {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === nextKey) {
      event.preventDefault();
      scrollNext();
    }
  }

  const count = snapCount || Math.max(items.length, 1);
  const prevIcon = orientation === "vertical" ? "ChevronUp" : "ChevronLeft";
  const nextIcon = orientation === "vertical" ? "ChevronDown" : "ChevronRight";
  const perClass =
    slidesPerView === 2 ? styles.per2 : slidesPerView === 3 ? styles.per3 : slidesPerView === 4 ? styles.per4 : "";

  return (
    <div
      className={`${styles.root} ${styles[orientation]} ${perClass}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage}>
        <div className={styles.viewport} ref={viewportRef}>
          <div className={styles.track}>
            {items.map((item, i) => (
              <div
                key={i}
                className={styles.slide}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${i + 1} of ${items.length}`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        {showControls ? (
          <>
            <div className={styles.prev}>
              <Button
                variant="secondary"
                size="sm"
                iconStart={prevIcon}
                ariaLabel="Previous slide"
                disabled={!canScrollPrev}
                onClick={scrollPrev}
              />
            </div>
            <div className={styles.next}>
              <Button
                variant="secondary"
                size="sm"
                iconStart={nextIcon}
                ariaLabel="Next slide"
                disabled={!canScrollNext}
                onClick={scrollNext}
              />
            </div>
          </>
        ) : null}
      </div>
      {showIndex ? (
        <p className={styles.index} aria-live="polite">
          {`Slide ${index + 1} of ${count}`}
        </p>
      ) : null}
    </div>
  );
}
