import { LucideByName } from "@/ui/Button/lucideName";
import type { InputProps } from "./Input.types";
import controlStyles from "../shared/controls.module.css";
import styles from "./Input.module.css";

export type { InputProps, InputSize, InputType } from "./Input.types";

const ICON_PX = { sm: 14, md: 16, lg: 18 } as const;

export function Input({
  id,
  type = "text",
  size = "md",
  placeholder,
  disabled = false,
  error = false,
  defaultValue,
  name,
  start,
  end,
  iconStart,
  iconEnd,
  demo,
}: InputProps) {
  const iconPx = ICON_PX[size];

  return (
    <div
      className={`${controlStyles.control} ${size === "sm" ? controlStyles.controlSm : size === "lg" ? controlStyles.controlLg : controlStyles.controlMd} ${error ? controlStyles.controlError : ""} ${styles.shell}`}
      data-disabled={disabled || undefined}
      data-demo={disabled ? undefined : demo}
    >
      <LucideByName name={iconStart} size={iconPx} className={styles.icon} />
      {start ? (
        <span className={styles.slot} aria-hidden>
          {start}
        </span>
      ) : null}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        defaultValue={defaultValue}
        aria-invalid={error || undefined}
        className={styles.native}
      />
      {end ? (
        <span className={styles.slot} aria-hidden>
          {end}
        </span>
      ) : null}
      <LucideByName name={iconEnd} size={iconPx} className={styles.icon} />
    </div>
  );
}
