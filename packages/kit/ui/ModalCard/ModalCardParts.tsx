"use client";

import type { ReactNode } from "react";
import { LucideByName } from "../Button/lucideName";
import { IconButton } from "../IconButton";
import { cx } from "../shared/cx";
import { useKitLabels } from "../shared/labels";
import type { ModalCardTone } from "./ModalCard.types";
import styles from "./ModalCard.module.css";

/*
 * The one overlay header and footer. ModalCard, AlertDialog (through ModalCard), Drawer and the
 * AppShell work panel (through ModalCard) render these, so every overlay reads the same. Internal:
 * not exported from the package.
 */

const TONE_ICON: Record<Exclude<ModalCardTone, "neutral">, string> = {
  info: "Info",
  success: "CircleCheck",
  warning: "TriangleAlert",
  danger: "CircleX",
};

export interface OverlayHeaderProps {
  title: string;
  titleId: string;
  description?: string;
  descriptionId: string;
  eyebrow?: string;
  tone?: ModalCardTone;
  onClose?: () => void;
  className?: string;
}

/** Tone icon + eyebrow and Close on top, then the h2 title and the one-sentence description. */
export function OverlayHeader({ title, titleId, description, descriptionId, eyebrow, tone = "neutral", onClose, className }: OverlayHeaderProps) {
  const labels = useKitLabels();
  const status = tone === "neutral" ? null : tone;
  const hasTop = Boolean(eyebrow || status);
  const close = onClose ? (
    <IconButton appearance="ghost" mode="neutral" size="sm" icon="X" ariaLabel={labels.close} onClick={onClose} />
  ) : null;

  return (
    <header className={cx(styles.header, className)}>
      {hasTop ? (
        <div className={styles.top}>
          <p className={styles.eyebrow} data-tone={status ?? undefined}>
            {status ? <LucideByName name={TONE_ICON[status]} size={16} className={styles.toneIcon} /> : null}
            <span>{[status ? labels[status] : null, eyebrow].filter(Boolean).join(" · ")}</span>
          </p>
          {close}
        </div>
      ) : null}
      <div className={styles.titleRow}>
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
        {hasTop ? null : close}
      </div>
    </header>
  );
}

/** footerStart (Ask or a count) on the left, the actions on the right. */
export function OverlayFooter({ footer, footerStart, className }: { footer?: ReactNode; footerStart?: ReactNode; className?: string }) {
  if (!footer && !footerStart) return null;
  return (
    <div className={cx(styles.footer, className)} data-part="footer">
      {footerStart ? (
        <div className={styles.footerStart} data-part="footer-start">
          {footerStart}
        </div>
      ) : null}
      {footer ? (
        <div className={styles.footerEnd} data-part="footer-end">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
