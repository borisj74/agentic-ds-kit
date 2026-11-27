"use client";

import { useId, type ReactNode } from "react";
import { Button, Switch } from "agentic-ds-kit";
import styles from "./ComponentDoc.module.css";

/**
 * The one Controls panel every component preview uses, built to match the Button preview:
 * a labelled group per option, Size as the small sm / md / lg toggle, every other choice as a
 * radio list, on/off options as Switches, and Reset (when a preview has one) as the last row.
 * Compose these pieces instead of hand-writing panel markup, so the panels cannot drift apart.
 */

export interface ControlAction {
  label: string;
  onClick: () => void;
  /** Lucide export name for the leading icon. */
  icon?: string;
}

function ActionButtons({ actions }: { actions: ControlAction[] }) {
  return (
    <>
      {actions.map((action) => (
        <Button
          key={action.label}
          size="sm"
          appearance="outline"
          mode="neutral"
          iconStart={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </>
  );
}

export function ControlsPanel({
  children,
  onReset,
  actions = [],
}: {
  children?: ReactNode;
  /** Shows a Reset button as the last row of the panel. */
  onReset?: () => void;
  /** More buttons for the last row, after Reset (for example Clear). */
  actions?: ControlAction[];
}) {
  const footer: ControlAction[] = [
    ...(onReset ? [{ label: "Reset", icon: "RotateCcw", onClick: onReset }] : []),
    ...actions,
  ];
  return (
    <aside className={styles.panel} aria-label="Controls">
      {children}
      {footer.length > 0 ? (
        <div className={styles.panelGroup}>
          <ActionButtons actions={footer} />
        </div>
      ) : null}
    </aside>
  );
}

function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.panelGroup}>
      <span className={styles.panelLabel}>{label}</span>
      {children}
    </div>
  );
}

/** Size, as the small toggle row. Only for size steps (sm / md / lg and the like). */
export function SizeControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ControlGroup label="Size">
      <div className={styles.sizeGroup} role="group" aria-label="Size">
        {options.map((step) => (
          <button
            key={step}
            type="button"
            className={`${styles.sizeTab} ${value === step ? styles.sizeTabActive : ""}`}
            aria-pressed={value === step}
            onClick={() => onChange(step)}
          >
            {step}
          </button>
        ))}
      </div>
    </ControlGroup>
  );
}

/** Any choice other than size, as a radio list. */
export function RadioControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
  optionLabel,
  disabled,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Text shown for an option; defaults to the option itself. */
  optionLabel?: (option: T) => string;
  /** Greys out every option, for a choice that only applies in some states. */
  disabled?: boolean;
}) {
  const name = useId();
  return (
    <ControlGroup label={label}>
      <div className={styles.radioList} role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <label key={String(option)} className={styles.radio}>
            <input
              type="radio"
              name={name}
              value={String(option)}
              checked={value === option}
              disabled={disabled}
              onChange={() => onChange(option)}
            />
            {optionLabel ? optionLabel(option) : String(option)}
          </label>
        ))}
      </div>
    </ControlGroup>
  );
}

export interface SwitchItem {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** On/off options, as small Switches under one label (Button calls its group "States"). */
export function SwitchControl({ label, items }: { label: string; items: SwitchItem[] }) {
  return (
    <ControlGroup label={label}>
      {items.map((item) => (
        <Switch
          key={item.label}
          label={item.label}
          size="sm"
          checked={item.checked}
          disabled={item.disabled}
          onChange={item.onChange}
        />
      ))}
    </ControlGroup>
  );
}

/** One-shot actions that are not choices (for example Increase / Decrease). */
export function ActionControl({ label, actions }: { label: string; actions: ControlAction[] }) {
  return (
    <ControlGroup label={label}>
      <ActionButtons actions={actions} />
    </ControlGroup>
  );
}
