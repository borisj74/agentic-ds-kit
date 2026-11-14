"use client";

import { useId } from "react";
import { CircleX, Cpu, LoaderCircle } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { DropdownMenu } from "../DropdownMenu";
import type { DropdownMenuGroup } from "../DropdownMenu/DropdownMenu.types";
import { cx } from "../shared/cx";
import type { ModelPickerProps, PickerModel } from "./ModelPicker.types";
import styles from "./ModelPicker.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ModelPickerProps, PickerModel } from "./ModelPicker.types";

function groupsOf(models: PickerModel[], value: string | undefined): DropdownMenuGroup[] {
  const order: string[] = [];
  const byVendor = new Map<string, PickerModel[]>();
  for (const model of models) {
    const key = model.vendor ?? "";
    if (!byVendor.has(key)) {
      byVendor.set(key, []);
      order.push(key);
    }
    byVendor.get(key)?.push(model);
  }
  return order.map((vendor) => ({
    heading: vendor || undefined,
    items: (byVendor.get(vendor) ?? []).map((model) => {
      const description = [model.recommended ? "Recommended" : "", model.disabled ? model.disabledReason : model.description]
        .filter(Boolean)
        .join(" · ");
      return {
        id: model.id,
        label: model.name,
        description: description || undefined,
        shortcut: [model.contextWindow, model.costTier].filter(Boolean).join(" · ") || undefined,
        selected: model.id === value,
        disabled: model.disabled,
        icon: model.disabled ? "Lock" : undefined,
      };
    }),
  }));
}

/** Choose which model an agent or chat uses: grouped by vendor, with context window, cost tier and kept-visible disabled models. Built on kit DropdownMenu. */
export function ModelPicker({
  models,
  value,
  onValueChange,
  label = "Model",
  hideLabel = false,
  size = "md",
  loading = false,
  error,
  onRetry,
  emptyText = "Your workspace has no models enabled. Ask an admin to turn one on.",
  className,
  ref,
  ...rest
}: ModelPickerProps) {
  const id = useId();
  const noteId = useId();
  const current = models.find((model) => model.id === value);
  const empty = !loading && models.length === 0;
  const trigger = loading
    ? "Loading models…"
    : empty
      ? "No model"
      : current
        ? [current.name, current.costTier, current.tagline].filter(Boolean).join(" · ")
        : "Choose a model";

  return (
    <div {...rest} {...nisthaAttr("modelpicker", rest)} ref={ref} className={cx(styles.picker, styles[size], className)}>
      <label htmlFor={id} className={cx(styles.label, hideLabel && styles.srOnly)}>
        {label}
      </label>
      <DropdownMenu
        id={id}
        className={styles.menu}
        triggerStyle="field"
        size={size}
        trigger={trigger}
        iconStart={loading ? <LoaderCircle size={16} strokeWidth={ICON_STROKE} className={styles.spin} aria-hidden="true" /> : <Cpu size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />}
        disabled={loading || empty}
        describedBy={error || empty ? noteId : undefined}
        groups={groupsOf(models, value)}
        onSelect={(next) => onValueChange?.(next)}
      />
      {error ? (
        <p id={noteId} className={styles.error} role="alert">
          <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className={styles.errorText}>{error}</span>
          {onRetry ? (
            <button type="button" className={styles.retry} onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </p>
      ) : empty ? (
        <p id={noteId} className={styles.hint}>
          {emptyText}
        </p>
      ) : null}
    </div>
  );
}
