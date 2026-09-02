export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonType = "button" | "submit" | "reset";
export type ButtonShape = "default" | "pill";

export interface ButtonProps {
  children?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  block?: boolean;
  disabled?: boolean;
  type?: ButtonType;
  onClick?: () => void;
  iconStart?: string;
  iconEnd?: string;
  ariaLabel?: string;
}
