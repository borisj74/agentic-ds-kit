import type { NumberInputProps } from "../NumberInput";

export interface CurrencyInputProps extends NumberInputProps {
  /** ISO 4217 code. Default USD. */
  currency?: string;
}
