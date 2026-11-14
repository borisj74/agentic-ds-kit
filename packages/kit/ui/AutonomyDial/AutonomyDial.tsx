"use client";

import { useId } from "react";
import { Gauge, LoaderCircle, Lock } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { LucideByName } from "../Button/lucideName";
import { SegmentedControl } from "../SegmentedControl";
import { cx } from "../shared/cx";
import type { AutonomyDialProps, AutonomyStop } from "./AutonomyDial.types";
import styles from "./AutonomyDial.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { AutonomyDialProps, AutonomyStop } from "./AutonomyDial.types";

export const AUTONOMY_STOPS: AutonomyStop[] = [
  { id: "ask", label: "Ask always", icon: "Hand", description: "Asks before every tool call. Nothing happens without your OK." },
  {
    id: "risk",
    label: "Ask on high risk",
    icon: "Shield",
    description: "Acts on reads and small edits. Asks before deploys, deletes, spend, or anything outside the repo.",
  },
  { id: "tell", label: "Act and tell me", icon: "Bell", description: "Acts on everything it is allowed to do, then posts a summary. Undo from the trail." },
  { id: "run", label: "Act until I stop", icon: "Play", description: "Runs to the end without pausing. Press Esc or Stop any time." },
];

/** How far an agent may go without asking: readable stops on a kit SegmentedControl, the current stop explained below. */
export function AutonomyDial({
  label = "Autonomy",
  value = "risk",
  onValueChange,
  options = AUTONOMY_STOPS,
  defaultValue = "risk",
  appliesTo,
  disabled = false,
  disabledReason,
  saving = false,
  size = "md",
  className,
  ref,
  ...rest
}: AutonomyDialProps) {
  const labelId = useId();
  const descriptionId = useId();
  const index = Math.max(0, options.findIndex((option) => option.id === value));
  const current = options[index];

  return (
    <section {...rest} {...nisthaAttr("autonomydial", rest)} ref={ref} className={cx(styles.dial, styles[size], className)} aria-labelledby={labelId}>
      <header className={styles.header}>
        <Gauge size={16} strokeWidth={ICON_STROKE} className={styles.icon} aria-hidden="true" />
        <h3 id={labelId} className={styles.label}>
          {label}
        </h3>
        {appliesTo ? <span className={styles.applies}>Applies to: {appliesTo}</span> : null}
      </header>

      <SegmentedControl
        className={styles.control}
        size={size}
        ariaLabel={label}
        value={current?.id}
        disabled={disabled}
        aria-describedby={descriptionId}
        onChange={(next) => onValueChange?.(next)}
        items={options.map((option) => ({
          value: option.id,
          label: option.label,
          icon: saving && option.id === current?.id ? "LoaderCircle" : option.icon,
        }))}
      />

      <div className={styles.ends} aria-hidden="true">
        <span>More oversight</span>
        <span>More autonomy</span>
      </div>

      {current ? (
        <div id={descriptionId} key={current.id} className={styles.panel} aria-live="polite">
          <p className={styles.panelHead}>
            <LucideByName name={current.icon} size={16} className={styles.panelIcon} />
            <span className={styles.panelTitle}>{current.label}</span>
            {current.id === defaultValue ? (
              <Badge tone="primary" size="sm">
                default
              </Badge>
            ) : null}
            {saving ? (
              <span className={styles.note}>
                <LoaderCircle size={14} strokeWidth={ICON_STROKE} className={styles.spin} aria-hidden="true" />
                Saving…
              </span>
            ) : disabled && disabledReason ? (
              <span className={styles.note}>
                <Lock size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                {disabledReason}
              </span>
            ) : null}
          </p>
          <p className={styles.description}>{current.description}</p>
        </div>
      ) : null}
    </section>
  );
}
