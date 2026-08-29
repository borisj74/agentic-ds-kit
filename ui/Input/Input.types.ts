export type InputSize = "lg" | "md" | "sm";
export type InputType = "text" | "email" | "password" | "search";

export interface InputProps {
  id: string;
  type?: InputType;
  size?: InputSize;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  defaultValue?: string;
  name?: string;
  start?: string;
  end?: string;
  iconStart?: string;
  iconEnd?: string;
  demo?: "hover" | "focus";
}
