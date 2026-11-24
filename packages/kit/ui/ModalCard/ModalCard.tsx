"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ModalCardProps } from "./ModalCard.types";
import { OverlayFooter, OverlayHeader } from "./ModalCardParts";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import styles from "./ModalCard.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ModalCardProps, ModalCardSize, ModalCardTone } from "./ModalCard.types";

export function ModalCard({
  title,
  description,
  eyebrow,
  tone,
  size = "md",
  onClose,
  children,
  footer,
  footerStart,
  role = "group",
  tabIndex,
  "aria-modal": ariaModal,
  className,
  ref,
  ...rest
}: ModalCardProps) {
  const titleId = useId();
  const descriptionId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const setCardRef = useMemo(() => mergeRefs(cardRef, ref), [ref]);
  // A footer divider shows only while the body scrolls.
  const [scrolls, setScrolls] = useState(false);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || typeof ResizeObserver === "undefined") return undefined;
    const update = () => setScrolls(body.scrollHeight > body.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(body);
    if (body.firstElementChild) observer.observe(body.firstElementChild);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div
      {...rest} {...nisthaAttr("modalcard", rest)}
      ref={setCardRef}
      role={role}
      tabIndex={tabIndex}
      aria-modal={ariaModal}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-scrolls={scrolls ? "" : undefined}
      className={cx(styles.card, styles[size], className)}
    >
      <OverlayHeader
        title={title}
        titleId={titleId}
        description={description}
        descriptionId={descriptionId}
        eyebrow={eyebrow}
        tone={tone}
        onClose={onClose}
      />
      {children ? (
        <div ref={bodyRef} className={styles.body} data-part="body">
          {children}
        </div>
      ) : null}
      <OverlayFooter footer={footer} footerStart={footerStart} />
    </div>
  );
}
