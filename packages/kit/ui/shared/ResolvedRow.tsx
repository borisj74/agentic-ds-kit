import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { CircleCheck, CircleMinus, CircleX, Clock } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { cx } from "./cx";
import styles from "./review.module.css";

/** yes: approved, granted, chose, accepted. no: denied, rejected. expired: timed out. skipped: no answer given. */
export type ResolvedOutcome = "yes" | "no" | "expired" | "skipped";

const ICON = { yes: CircleCheck, no: CircleX, expired: Clock, skipped: CircleMinus } as const;

interface ResolvedRowProps extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  as?: "section" | "article";
  outcome: ResolvedOutcome;
  /** The verb, e.g. "Approved". */
  label: string;
  /** The thing, e.g. "INV-1857 reminder". */
  text?: ReactNode;
  /** Who and when, e.g. "you · 08:50". */
  meta?: string;
  ref?: Ref<HTMLElement>;
}

/**
 * The one-line row a review card (ApprovalCard, PermissionRequest, DecisionCard, InlineDiff)
 * collapses to once decided: a circle icon, the verb, the thing, then who and when. Internal.
 */
export function ResolvedRow({ as: Tag = "section", outcome, label, text, meta, className, ref, ...rest }: ResolvedRowProps) {
  const Icon = ICON[outcome];
  return (
    <Tag {...rest} ref={ref as Ref<HTMLElement & HTMLElement>} tabIndex={-1} className={cx(styles.resolved, styles[outcome], className)}>
      <Icon size={16} strokeWidth={ICON_STROKE} className={styles.resolvedIcon} aria-hidden="true" />
      <span className={styles.resolvedLabel}>{label}</span>
      {text ? <span className={styles.resolvedText}>{text}</span> : null}
      {meta ? <span className={styles.resolvedMeta}>{meta}</span> : null}
    </Tag>
  );
}

/** The footer line that spells out the keys, e.g. "⌘⏎ approve · Esc deny". Hidden on touch screens. */
export function KeyHint({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <p id={id} className={cx(styles.hint, className)} aria-hidden={id ? undefined : true}>
      {children}
    </p>
  );
}

export { styles as reviewStyles };
