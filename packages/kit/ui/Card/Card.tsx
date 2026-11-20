import { useId } from "react";
import { Button } from "../Button";
import type { CardAction, CardProps } from "./Card.types";
import type { KitLinkComponent } from "../shared/link";
import { cx } from "../shared/cx";
import styles from "./Card.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { CardProps, CardSize, CardAction } from "./Card.types";

function HeaderAction({ action }: { action: CardAction }) {
  if (action.href) {
    const LinkTag: KitLinkComponent = action.linkAs ?? "a";
    return (
      <LinkTag href={action.href} className={styles.headerLink} onClick={action.onClick}>
        {action.label}
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
  imageSrc,
  imageAlt,
  className,
  ref,
  ...rest
}: CardProps) {
  const titleId = useId();
  const footerActions = (actions ?? []).slice(0, 2);
  const headerActions = (Array.isArray(headerAction) ? headerAction : headerAction ? [headerAction] : []).slice(0, 2);

  return (
    <article
      {...rest} {...nisthaAttr("card", rest)}
      ref={ref}
      className={cx(styles.card, styles[size], flush && styles.flush, className)}
      aria-labelledby={title ? titleId : undefined}
    >
      {imageSrc ? (
        <img className={styles.image} src={imageSrc} alt={imageAlt ?? ""} />
      ) : null}
      <div className={styles.content}>
        {title || description || headerActions.length > 0 ? (
          <header className={styles.header}>
            <div className={styles.copy}>
              {title ? (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              ) : null}
              {description ? <p className={styles.description}>{description}</p> : null}
            </div>
            {headerActions.length === 1 ? <HeaderAction action={headerActions[0]} /> : null}
            {headerActions.length > 1 ? (
              <div className={styles.headerActions}>
                {headerActions.map((action) => (
                  <HeaderAction key={action.label} action={action} />
                ))}
              </div>
            ) : null}
          </header>
        ) : null}
        <div className={styles.body}>{children}</div>
        {footerActions.length > 0 ? (
          <footer className={styles.footer}>
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
          </footer>
        ) : null}
      </div>
    </article>
  );
}
