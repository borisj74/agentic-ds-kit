import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import type { AlertProps, AlertVariant } from "./Alert.types";
import { cx } from "../shared/cx";
import styles from "./Alert.module.css";
import { nisthaAttr } from "../shared/inspect";
import { AlertDismiss } from "./AlertDismiss";

export type { AlertAction, AlertPlacement, AlertProps, AlertVariant } from "./Alert.types";

const ICONS: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

export function Alert({
  children,
  variant = "info",
  title,
  placement = "page",
  eyebrow,
  timestamp,
  action,
  secondaryAction,
  onDismiss,
  className,
  ref,
  ...rest
}: AlertProps) {
  const Icon = ICONS[variant];
  const role = variant === "warning" || variant === "danger" ? "alert" : "status";
  const hasMeta = Boolean(eyebrow || timestamp || onDismiss);
  const hasActions = Boolean(action || secondaryAction);

  return (
    <div
      {...rest}
      {...nisthaAttr("alert", rest)}
      ref={ref}
      className={cx(styles.alert, styles[variant], styles[placement], hasMeta && styles.withMeta, className)}
      role={role}
    >
      <Icon className={styles.icon} size={18} strokeWidth={ICON_STROKE} aria-hidden />
      <div className={styles.copy}>
        {hasMeta ? (
          <div className={styles.meta}>
            {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
            {timestamp ? <span className={styles.timestamp}>{timestamp}</span> : null}
            {onDismiss ? <AlertDismiss onDismiss={onDismiss} /> : null}
          </div>
        ) : null}
        {title ? <p className={styles.title}>{title}</p> : null}
        <p className={styles.body}>{children}</p>
        {hasActions ? (
          <div className={styles.actions}>
            {action ? (
              <Button
                appearance={placement === "page" ? "solid" : "outline"}
                mode={placement === "page" ? "primary" : "neutral"}
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button appearance="outline" mode="neutral" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
