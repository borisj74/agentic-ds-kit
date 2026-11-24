"use client";

import { Button } from "../Button";
import { DropdownMenu } from "../DropdownMenu";
import type { SplitButtonProps } from "./SplitButton.types";
import { cx } from "../shared/cx";
import styles from "./SplitButton.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { SplitButtonProps } from "./SplitButton.types";

/** A main action and a chevron that opens the other actions: a kit Button joined to a kit DropdownMenu. */
export function SplitButton({
  children,
  onClick,
  groups,
  onSelect,
  menuLabel,
  size = "md",
  appearance = "solid",
  mode = "primary",
  disabled = false,
  loading = false,
  iconStart,
  type = "button",
  align = "end",
  open,
  onOpenChange,
  className,
  ref,
  ...rest
}: SplitButtonProps) {
  return (
    <span {...nisthaAttr("splitbutton")} className={cx(styles.split, className)}>
      <Button
        {...rest}
        ref={ref}
        className={styles.main}
        type={type}
        size={size}
        appearance={appearance}
        mode={mode}
        disabled={disabled}
        loading={loading}
        iconStart={iconStart}
        onClick={onClick}
      >
        {children}
      </Button>
      <DropdownMenu
        className={styles.menu}
        iconStart="ChevronDown"
        ariaLabel={menuLabel ?? `${children} options`}
        size={size}
        appearance={appearance}
        mode={mode}
        disabled={disabled}
        align={align}
        groups={groups}
        onSelect={onSelect}
        open={open}
        onOpenChange={onOpenChange}
      />
    </span>
  );
}
