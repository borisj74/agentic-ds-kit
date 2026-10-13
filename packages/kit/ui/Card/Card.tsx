import { useId } from "react";
import { Button } from "../Button";
import type { CardAction, CardProps } from "./Card.types";
import type { KitLinkComponent } from "../shared/link";
import { cx } from "../shared/cx";
import styles from "./Card.module.css";

export type { CardProps, CardSize, CardAction, CardActionVariant } from "./Card.types";

function HeaderAction({ action }: { action: CardAction }) {
  if (action.href) {
    const LinkTag: KitLinkComponent = action.linkAs ?? "a";
    return (
      <LinkTag href={action.href} className={styles.headerLink} onClick={action.onClick}>
        {action.label}
      </LinkTag>
    );
  }
  return (
    <Button variant={action.variant ?? "tertiary"} size="sm" onClick={action.onClick}>
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

  return (
    <article
      {...rest}
      ref={ref}
      className={cx(styles.card, styles[size], flush && styles.flush, className)}
      aria-labelledby={title ? titleId : undefined}
    >
      {imageSrc ? (
        <img className={styles.image} src={imageSrc} alt={imageAlt ?? ""} />
      ) : null}
      <div className={styles.content}>
        {title || description || headerAction ? (
          <header className={styles.header}>
            <div className={styles.copy}>
              {title ? (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              ) : null}
              {description ? <p className={styles.description}>{description}</p> : null}
            </div>
            {headerAction ? <HeaderAction action={headerAction} /> : null}
          </header>
        ) : null}
        <div className={styles.body}>{children}</div>
        {footerActions.length > 0 ? (
          <footer className={styles.footer}>
            {footerActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
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
