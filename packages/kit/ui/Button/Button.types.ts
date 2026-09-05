export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonType = "button" | "submit" | "reset";
export type ButtonShape = "default" | "pill";

interface ButtonBase {
  size?: ButtonSize;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  block?: boolean;
  disabled?: boolean;
  type?: ButtonType;
  onClick?: () => void;
  iconStart?: string;
  iconEnd?: string;
}

export type ButtonProps =
  | (ButtonBase & {
      children: string;
      ariaLabel?: string;
    })
  | (ButtonBase & {
      children?: undefined;
      ariaLabel: string;
    });
