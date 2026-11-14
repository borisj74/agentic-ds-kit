"use client";

import { FormattedNumberField } from "../NumberInput/FormattedNumberField";
import type { CurrencyInputProps } from "./CurrencyInput.types";
import { nisthaAttr } from "../shared/inspect";

export type { CurrencyInputProps } from "./CurrencyInput.types";

export function CurrencyInput({ currency = "USD", step = 0.01, ...props }: CurrencyInputProps) {
  return <FormattedNumberField {...props} {...nisthaAttr("currencyinput")} currency={currency} step={step} />;
}
