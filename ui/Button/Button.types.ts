export type ButtonSize = "lg" | "md" | "sm";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonType = "button" | "submit" | "reset";

export interface ButtonProps {
  children: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: ButtonType;
  onClick?: () => void;
}
