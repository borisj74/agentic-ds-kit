"use client";

import { FormattedNumberField } from "../NumberInput/FormattedNumberField";
import type { CurrencyInputProps } from "./CurrencyInput.types";

export type { CurrencyInputProps } from "./CurrencyInput.types";

export function CurrencyInput({ currency = "USD", step = 0.01, ...props }: CurrencyInputProps) {
  return <FormattedNumberField {...props} currency={currency} step={step} />;
}
