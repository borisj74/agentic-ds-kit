"use client";

import { FormattedNumberField } from "./FormattedNumberField";
import type { NumberInputProps } from "./NumberInput.types";
import { nisthaAttr } from "../shared/inspect";

export type { NumberInputProps, NumberInputSize } from "./NumberInput.types";

export function NumberInput(props: NumberInputProps) {
  return <FormattedNumberField {...props} {...nisthaAttr("numberinput")} />;
}
