import { useId } from "react";
import { Button } from "@/ui/Button";
import type { CardProps } from "./Card.types";
import styles from "./Card.module.css";

export type { CardProps, CardSize, CardAction, CardActionVariant } from "./Card.types";

export function Card({
  title,
  description,
  children,
  size = "md",
  actions,
  headerAction,
  imageSrc,
  imageAlt,
}: CardProps) {
  const titleId = useId();
  const footerActions = (actions ?? []).slice(0, 2);

  return (
    <article
      className={[styles.card, styles[size]].filter(Boolean).join(" ")}
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
            {headerAction ? (
              <Button
                variant={headerAction.variant ?? "tertiary"}
                size="sm"
                onClick={headerAction.onClick}
              >
                {headerAction.label}
              </Button>
            ) : null}
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
