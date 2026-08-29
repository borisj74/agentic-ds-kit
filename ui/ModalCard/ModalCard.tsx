"use client";

import { forwardRef, useId } from "react";
import { LucideByName } from "@/ui/Button/lucideName";
import type { ModalCardProps } from "./ModalCard.types";
import styles from "./ModalCard.module.css";

export type { ModalCardProps, ModalCardSize } from "./ModalCard.types";

export const ModalCard = forwardRef<HTMLDivElement, ModalCardProps>(function ModalCard(
  {
    title,
    description,
    size = "md",
    onClose,
    children,
    footer,
    role = "group",
    tabIndex,
    "aria-modal": ariaModal,
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div
      ref={ref}
      role={role}
      tabIndex={tabIndex}
      aria-modal={ariaModal}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={`${styles.card} ${styles[size]}`}
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
});
