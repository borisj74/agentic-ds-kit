export interface ColorPickerSwatch {
  /** Hex colour, e.g. "#1A73E8". */
  value: string;
  /** Accessible name, e.g. "Brand blue". Defaults to the hex. */
  label?: string;
}

export interface ColorPickerProps {
  /** Controlled hex: #RRGGBB, or #RRGGBBAA when showAlpha and opacity is below 100%. */
  value?: string;
  /** Uncontrolled starting hex. */
  defaultValue?: string;
  /** Called with the next hex (uppercase). */
  onChange?: (hex: string) => void;
  /** Preset colours as a radio group. Strings are hex; objects add a label. */
  swatches?: (string | ColorPickerSwatch)[];
  /** Adds an opacity slider. The hex gains two alpha digits below 100%. */
  showAlpha?: boolean;
  disabled?: boolean;
  /** Hex input id. Pass the same value as Field htmlFor. */
  id?: string;
  /** Set by Field. */
  describedBy?: string;
  /** Set by Field when it has an error. */
  error?: boolean;
  /** Names the group and prefixes the slider names. Default "Colour". */
  ariaLabel?: string;
  /** Shown under the hex input while the typed text is not a valid hex. */
  invalidMessage?: string;
}
