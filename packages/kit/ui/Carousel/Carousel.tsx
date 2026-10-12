"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "../Button";
import type { CarouselProps } from "./Carousel.types";
import { cx } from "../shared/cx";
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
  className,
  ref,
  ...rest
}: CarouselProps) {
  const emblaOptions = useMemo(
    () => ({
      axis: (orientation === "vertical" ? "y" : "x") as "x" | "y",
      loop,
      align,
    }),
    [orientation, loop, align],
  );
  const [viewportRef, emblaApi] = useEmblaCarousel(emblaOptions);

  const fallbackCount = Math.max(items.length, 1);
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", onChange);
      emblaApi.on("reInit", onChange);
      return () => {
        emblaApi.off("select", onChange);
        emblaApi.off("reInit", onChange);
      };
    },
    [emblaApi],
  );
  const canScrollPrev = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollPrev() ?? false,
    () => false,
  );
  const canScrollNext = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollNext() ?? false,
    () => false,
  );
  const index = useSyncExternalStore(
    subscribe,
    () => emblaApi?.selectedScrollSnap() ?? 0,
    () => 0,
  );
  const snapCount = useSyncExternalStore(
    subscribe,
    () => (emblaApi ? emblaApi.scrollSnapList().length : fallbackCount),
    () => fallbackCount,
  );
  const onIndexChangeRef = useRef(onIndexChange);

  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  });

  useEffect(() => {
    if (!emblaApi) return;
    const notify = () => onIndexChangeRef.current?.(emblaApi.selectedScrollSnap());
    notify();
    emblaApi.on("select", notify);
    emblaApi.on("reInit", notify);
    return () => {
      emblaApi.off("select", notify);
      emblaApi.off("reInit", notify);
    };
  }, [emblaApi]);

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
      {...rest}
      ref={ref}
      className={cx(styles.root, styles[orientation], perClass, className)}
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
