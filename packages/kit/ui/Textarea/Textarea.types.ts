export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps {
  id: string;
  size?: TextareaSize;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  demo?: "hover" | "focus";
  describedBy?: string;
}
