export type InputOTPSize = "sm" | "md" | "lg";
export type InputOTPPattern = "digits" | "alphanumeric";

export interface InputOTPProps {
  id: string;
  length?: number;
  groups?: number[];
  size?: InputOTPSize;
  disabled?: boolean;
  error?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  pattern?: InputOTPPattern;
  name?: string;
  autoComplete?: string;
  ariaLabel?: string;
}
