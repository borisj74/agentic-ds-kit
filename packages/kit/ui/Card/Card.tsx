import { useId } from "react";
import { Button } from "../Button";
import { CardDismiss } from "./CardLabels";
import { LucideByName } from "../Button/lucideName";
import { buttonClassName, buttonIconClassName } from "../Button/buttonClass";
import type { CardAction, CardProps } from "./Card.types";
import type { KitLinkComponent } from "../shared/link";
import { cx } from "../shared/cx";
import styles from "./Card.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { CardProps, CardSize, CardAction } from "./Card.types";

function HeaderAction({ action }: { action: CardAction }) {
  if (action.href) {
    // A real link (it navigates, opens in a new tab, shows the URL) that looks like the other header Buttons.
    const LinkTag: KitLinkComponent = action.linkAs ?? "a";
    const iconOnly = Boolean(action.iconOnly && action.iconStart);
    return (
      <LinkTag
        href={action.href}
        className={cx(
          buttonClassName({ size: "sm", appearance: action.appearance ?? "ghost", mode: action.mode ?? "neutral", iconOnly }),
          styles.headerLinkAction,
        )}
        onClick={action.onClick}
        aria-label={iconOnly ? action.label : undefined}
        title={iconOnly ? action.label : undefined}
      >
        <LucideByName name={action.iconStart} size={14} className={buttonIconClassName} />
        {iconOnly ? null : <span>{action.label}</span>}
      </LinkTag>
    );
  }
  if (action.iconOnly && action.iconStart) {
    return (
      <Button
        appearance={action.appearance ?? "ghost"}
        mode={action.mode ?? "neutral"}
        size="sm"
        iconStart={action.iconStart}
        ariaLabel={action.label}
        title={action.label}
        onClick={action.onClick}
      />
    );
  }
  return (
    <Button appearance={action.appearance ?? "ghost"} mode={action.mode ?? "neutral"} size="sm" iconStart={action.iconStart} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export function Card({
  title,
  description,
  children,
  size = "md",
  actions,
  headerAction,
  flush = false,
  icon,
  eyebrow,
  meta,
  onDismiss,
  source,
  onAsk,
  askLabel,
  imageSrc,
  imageAlt,
  className,
  ref,
  ...rest
}: CardProps) {
  const titleId = useId();
  const sourceId = useId();
  const footerActions = (actions ?? []).slice(0, 2);
  const allHeaderActions = Array.isArray(headerAction) ? headerAction : headerAction ? [headerAction] : [];
  if (process.env.NODE_ENV !== "production" && allHeaderActions.length > 2) {
    console.warn(
      `[agentic-ds-kit] Card "${title ?? "untitled"}": headerAction takes at most two actions; ${allHeaderActions.length - 2} more ignored. Move the rest to the footer or a DropdownMenu.`,
    );
  }
  const headerActions = allHeaderActions.slice(0, 2);
  const askText = onAsk && askLabel ? askLabel : null;
  const hasTopRow = Boolean(icon || eyebrow || meta || onDismiss);
  const actionNodes =
    headerActions.length === 1 ? (
      <HeaderAction action={headerActions[0]} />
    ) : headerActions.length > 1 ? (
      <div className={styles.headerActions}>
        {headerActions.map((action) => (
          <HeaderAction key={action.label} action={action} />
        ))}
      </div>
    ) : null;
  const copy =
    title || description ? (
      <div className={styles.copy}>
        {title ? (
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        ) : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
    ) : null;

  return (
    <article
      {...rest} {...nisthaAttr("card", rest)}
      ref={ref}
      className={cx(styles.card, styles[size], flush && styles.flush, className)}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={source ? sourceId : undefined}
    >
      {imageSrc ? (
        <img className={styles.image} src={imageSrc} alt={imageAlt ?? ""} />
      ) : null}
      <div className={cx(styles.content, (footerActions.length > 0 || askText) && styles.withFooter)}>
        {hasTopRow ? (
          <div className={styles.head}>
            <header className={styles.topRow}>
              <div className={styles.lead}>
                {icon ? (
                  <span className={styles.iconTile} aria-hidden="true">
                    <LucideByName name={icon} size={14} className={styles.glyph} />
                  </span>
                ) : null}
                {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
              </div>
              {meta || actionNodes || onDismiss ? (
                <div className={styles.trail}>
                  {meta ? <span className={styles.meta}>{meta}</span> : null}
                  {actionNodes}
                  {onDismiss ? (
                    <CardDismiss onDismiss={onDismiss} />
                  ) : null}
                </div>
              ) : null}
            </header>
            {copy}
          </div>
        ) : title || description || headerActions.length > 0 ? (
          <header className={styles.header}>
            {copy ?? <div className={styles.copy} />}
            {actionNodes}
          </header>
        ) : null}
        <div className={styles.body}>{children}</div>
        {source ? (
          <p id={sourceId} className={styles.source}>
            {source}
          </p>
        ) : null}
      </div>
      {footerActions.length > 0 || askText ? (
        <footer className={styles.footer}>
          {askText ? (
            <Button appearance="ghost" mode="neutral" size="sm" iconStart="MessageCircle" onClick={onAsk}>
              {askText}
            </Button>
          ) : null}
          {footerActions.length > 0 ? (
            <div className={styles.footerActions}>
              {footerActions.map((action) => (
                <Button
                  key={action.label}
                  appearance={action.appearance ?? "outline"}
                  mode={action.mode ?? "neutral"}
                  size="md"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
