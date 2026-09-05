import type { ButtonProps } from "./Button.types";
import { LucideByName } from "./lucideName";
import styles from "./Button.module.css";

export type { ButtonProps, ButtonSize, ButtonVariant, ButtonType, ButtonShape } from "./Button.types";

const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

export function Button({
  children,
  size = "md",
  variant = "primary",
  shape = "default",
  block = false,
  disabled = false,
  type = "button",
  onClick,
  iconStart,
  iconEnd,
  ariaLabel,
}: ButtonProps) {
  const hasLabel = Boolean(children && children.trim());
  const iconOnly = !hasLabel && Boolean(iconStart || iconEnd);
  const iconPx = ICON_SIZE[size];

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-label={hasLabel ? undefined : ariaLabel}
      onClick={onClick}
      className={[
        styles.button,
        styles[size],
        styles[variant],
        shape === "pill" ? styles.pill : "",
        block ? styles.block : "",
        iconOnly ? styles.iconOnly : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <LucideByName name={iconStart} size={iconPx} className={styles.icon} />
      {hasLabel ? <span>{children}</span> : null}
      <LucideByName name={iconEnd} size={iconPx} className={styles.icon} />
    </button>
  );
}
