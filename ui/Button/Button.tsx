import type { ButtonProps } from "./Button.types";
import { LucideByName } from "./lucideName";
import styles from "./Button.module.css";

export type { ButtonProps, ButtonSize, ButtonVariant, ButtonType } from "./Button.types";

const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

export function Button({
  children,
  size = "md",
  variant = "primary",
  disabled = false,
  type = "button",
  onClick,
  iconStart,
  iconEnd,
  ariaLabel,
}: ButtonProps) {
  const hasLabel = Boolean(children && children.trim());
  const iconOnly = !hasLabel && Boolean(iconStart);
  const iconPx = ICON_SIZE[size];

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-label={iconOnly ? ariaLabel : undefined}
      onClick={onClick}
      className={`${styles.button} ${styles[size]} ${styles[variant]}${iconOnly ? ` ${styles.iconOnly}` : ""}`}
    >
      <LucideByName name={iconStart} size={iconPx} className={styles.icon} />
      {hasLabel ? <span>{children}</span> : null}
      <LucideByName name={iconEnd} size={iconPx} className={styles.icon} />
    </button>
  );
}
