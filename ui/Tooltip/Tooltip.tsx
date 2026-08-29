"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: string;
  placement?: TooltipPlacement;
  children: ReactNode;
}

export function Tooltip({ content, placement = "top", children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className={styles.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span tabIndex={0} aria-describedby={visible ? tooltipId : undefined} className={styles.trigger}>
        {children}
      </span>
      {visible ? (
        <span id={tooltipId} role="tooltip" className={`${styles.tooltip} ${styles[placement]}`}>
          {content}
        </span>
      ) : null}
    </span>
  );
}
