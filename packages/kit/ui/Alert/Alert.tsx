import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { AlertProps, AlertVariant } from "./Alert.types";
import styles from "./Alert.module.css";

export type { AlertProps, AlertVariant } from "./Alert.types";

const ICONS: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

export function Alert({ children, variant = "info", title }: AlertProps) {
  const Icon = ICONS[variant];
  const role = variant === "warning" || variant === "danger" ? "alert" : "status";

  return (
    <div className={`${styles.alert} ${styles[variant]}`} role={role}>
      <Icon className={styles.icon} size={18} strokeWidth={2} aria-hidden />
      <div className={styles.copy}>
        {title ? <p className={styles.title}>{title}</p> : null}
        <p className={styles.body}>{children}</p>
      </div>
    </div>
  );
}
