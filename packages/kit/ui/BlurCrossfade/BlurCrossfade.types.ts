import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

/** `fast` = `--motion-duration-200` (Paper's motion.fast); `normal` = `--motion-duration-300`. */
export type BlurCrossfadeDuration = "fast" | "normal";

/** Root attributes the kit sets itself. */
type BlurCrossfadeOwnedKeys = "children";

/** `ref`, `className` and other attributes land on the root `<span>`. */
export interface BlurCrossfadeProps extends Omit<ComponentPropsWithoutRef<"span">, BlurCrossfadeOwnedKeys> {
  /** The current value: a status chip, a thumbnail, a chart. */
  children: ReactNode;
  /** Changing it swaps the content: the old child fades out while the new one fades in. */
  contentKey: string | number;
  duration?: BlurCrossfadeDuration;
  /** Announced through a polite live region when the content swaps, e.g. "Status: Done". */
  label?: string;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}
