import type { ButtonProps } from "./Button.types";
import styles from "./Button.module.css";

export type { ButtonProps, ButtonSize, ButtonVariant, ButtonType } from "./Button.types";

export function Button({
  children,
  size = "md",
  variant = "primary",
  disabled = false,
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={onClick}
      className={`${styles.button} ${styles[size]} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
