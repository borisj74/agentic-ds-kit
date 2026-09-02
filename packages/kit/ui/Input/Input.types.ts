export type InputSize = "sm" | "md" | "lg";
export type InputType = "text" | "email" | "password" | "search";

export interface InputProps {
  id: string;
  type?: InputType;
  size?: InputSize;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  start?: string;
  end?: string;
  iconStart?: string;
  iconEnd?: string;
  demo?: "hover" | "focus";
  describedBy?: string;
  ariaLabel?: string;
}
