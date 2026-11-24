"use client";

import { ArrowDown, ArrowRight, ArrowUp, CircleCheck, TriangleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import type { DeltaDirection, DeltaGoodWhen, DeltaProps, DeltaTone } from "./Delta.types";
import { cx } from "../shared/cx";
import styles from "./Delta.module.css";
import { nisthaAttr } from "../shared/inspect";
import { useKitLabels } from "../shared/labels";

export type { DeltaProps, DeltaDirection, DeltaTone, DeltaSize, DeltaGoodWhen } from "./Delta.types";

const ICON_PX = { sm: 12, md: 14 } as const;

const ARROW = { up: ArrowUp, down: ArrowDown, flat: ArrowRight } as const;

const DEFAULT_TONE: Record<DeltaDirection, DeltaTone> = {
  up: "success",
  down: "danger",
  flat: "neutral",
};

/**
 * With `goodWhen`, an up or down move is judged Better or Worse. Flat (and a Scorecard's neutral)
 * moves are not judged.
 */
export function judgeDelta(direction: string, goodWhen: DeltaGoodWhen | undefined): "better" | "worse" | null {
  if (!goodWhen || (direction !== "up" && direction !== "down")) return null;
  return direction === goodWhen ? "better" : "worse";
}

export function Delta({ value, direction, tone, goodWhen, size = "md", className, ref, ...rest }: DeltaProps) {
  const labels = useKitLabels();
  const judged = judgeDelta(direction, goodWhen);
  // A judged move shows its word and status icon; only Worse carries colour.
  const Icon = judged === "better" ? CircleCheck : judged === "worse" ? TriangleAlert : ARROW[direction];
  const resolvedTone = tone ?? (judged === "worse" ? "danger" : judged === "better" ? "neutral" : DEFAULT_TONE[direction]);
  const text = judged ? `${labels[judged]} · ${value}` : value;
  return (
    <span
      {...rest} {...nisthaAttr("delta", rest)}
      ref={ref}
      className={cx(styles.delta, styles[size], styles[resolvedTone], className)}
    >
      <Icon size={ICON_PX[size]} strokeWidth={ICON_STROKE} aria-hidden className={styles.icon} />
      <span className={styles.value}>{text}</span>
    </span>
  );
}
