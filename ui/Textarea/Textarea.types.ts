export type TextareaSize = "lg" | "md" | "sm";

export interface TextareaProps {
  id: string;
  size?: TextareaSize;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  defaultValue?: string;
  name?: string;
  demo?: "hover" | "focus";
  describedBy?: string;
}
