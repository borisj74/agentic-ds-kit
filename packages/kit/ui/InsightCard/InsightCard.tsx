import { useId } from "react";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import type { InsightCardAction, InsightCardProps, InsightCardTone } from "./InsightCard.types";
import { cx } from "../shared/cx";
import styles from "./InsightCard.module.css";

export type {
  InsightCardProps,
  InsightCardTone,
  InsightCardSize,
  InsightCardAction,
  InsightCardActionStyle,
} from "./InsightCard.types";

const TONE_ICON: Record<InsightCardTone, string> = {
  opportunity: "Sparkles",
  success: "CircleCheck",
  warning: "TriangleAlert",
  danger: "CircleX",
  info: "Info",
  neutral: "Sparkles",
};

const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

/** Text-link action: a real link with `href`, otherwise a button that looks like one. */
function ActionLink({ action, iconSize }: { action: InsightCardAction; iconSize: number }) {
  const body = (
    <>
      <span className={styles.linkLabel}>{action.label}</span>
      <LucideByName name="ArrowRight" size={iconSize} className={styles.linkIcon} />
    </>
  );
  if (action.href) {
    return (
      <a className={styles.link} href={action.href} onClick={action.onClick}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" className={styles.link} onClick={action.onClick}>
      {body}
    </button>
  );
}

export function InsightCard({
  title,
  description,
  eyebrow = "Insight",
  tone = "opportunity",
  size = "md",
  confidence,
  source,
  primaryAction,
  secondaryAction,
  actionStyle = "button",
  onDismiss,
  className,
  ref,
  ...rest
}: InsightCardProps) {
  const titleId = useId();
  const descriptionId = useId();
  const showFooter = Boolean(primaryAction || secondaryAction || onDismiss);
  const buttonSize = size === "lg" ? "md" : "sm";
  const asLink = (action: InsightCardAction) => actionStyle === "link" || Boolean(action.href);

  return (
    <article
      {...rest}
      ref={ref}
      className={cx(styles.card, styles[size], styles[tone], className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <header className={styles.header}>
        <div className={styles.lead}>
          <LucideByName name={TONE_ICON[tone]} size={ICON_SIZE[size]} className={styles.icon} />
          <span className={styles.eyebrow}>{eyebrow}</span>
        </div>
        {confidence ? <span className={styles.confidence}>{confidence}</span> : null}
      </header>
      <div className={styles.body}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {description ? (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}
        {source ? <p className={styles.source}>{source}</p> : null}
      </div>
      {showFooter ? (
        <footer className={styles.footer}>
          {primaryAction || secondaryAction ? (
            <div className={styles.actions}>
              {primaryAction ? (
                asLink(primaryAction) ? (
                  <ActionLink action={primaryAction} iconSize={ICON_SIZE[size]} />
                ) : (
                  <Button variant="primary" size={buttonSize} onClick={primaryAction.onClick}>
                    {primaryAction.label}
                  </Button>
                )
              ) : null}
              {secondaryAction ? (
                asLink(secondaryAction) ? (
                  <ActionLink action={secondaryAction} iconSize={ICON_SIZE[size]} />
                ) : (
                  <Button variant="secondary" size={buttonSize} onClick={secondaryAction.onClick}>
                    {secondaryAction.label}
                  </Button>
                )
              ) : null}
            </div>
          ) : null}
          {onDismiss ? (
            <button type="button" className={styles.dismiss} onClick={onDismiss}>
              Dismiss
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
