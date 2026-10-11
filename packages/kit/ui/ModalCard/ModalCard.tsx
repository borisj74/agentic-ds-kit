"use client";

import { useId } from "react";
import { LucideByName } from "../Button/lucideName";
import type { ModalCardProps } from "./ModalCard.types";
import { cx } from "../shared/cx";
import styles from "./ModalCard.module.css";

export type { ModalCardProps, ModalCardSize } from "./ModalCard.types";

export function ModalCard({
  title,
  description,
  size = "md",
  onClose,
  children,
  footer,
  role = "group",
  tabIndex,
  "aria-modal": ariaModal,
  className,
  ref,
  ...rest
}: ModalCardProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div
      {...rest}
      ref={ref}
      role={role}
      tabIndex={tabIndex}
      aria-modal={ariaModal}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cx(styles.card, styles[size], className)}
    >
      <header className={styles.header}>
        <div className={styles.copy}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          ) : null}
        </div>
        {onClose ? (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <LucideByName name="X" size={16} />
          </button>
        ) : null}
      </header>
      {children ? <div className={styles.body}>{children}</div> : null}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}
