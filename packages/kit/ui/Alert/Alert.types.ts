export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  children: string;
  variant?: AlertVariant;
  title?: string;
}
