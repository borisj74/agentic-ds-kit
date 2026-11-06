"use client";

import { FormattedNumberField } from "./FormattedNumberField";
import type { NumberInputProps } from "./NumberInput.types";

export type { NumberInputProps, NumberInputSize } from "./NumberInput.types";

export function NumberInput(props: NumberInputProps) {
  return <FormattedNumberField {...props} />;
}
