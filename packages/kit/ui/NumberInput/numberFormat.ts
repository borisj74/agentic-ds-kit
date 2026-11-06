function separators(locale?: string): { group: string; decimal: string } {
  const parts = new Intl.NumberFormat(locale).formatToParts(1000.1);
  return {
    group: parts.find((part) => part.type === "group")?.value ?? ",",
    decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
  };
}

function decimalPlaces(step: number): number {
  const text = step.toString();
  if (text.includes("e-")) {
    const exp = Number(text.split("e-")[1]);
    return Number.isFinite(exp) ? exp : 0;
  }
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

export function clampNumber(value: number, min?: number, max?: number): number {
  let next = value;
  if (min !== undefined && next < min) next = min;
  if (max !== undefined && next > max) next = max;
  return next;
}

export function bumpNumber(
  current: number | null,
  direction: 1 | -1,
  step: number,
  min?: number,
  max?: number,
): number {
  const base =
    current ??
    (direction > 0 ? (min ?? 0) - step : (max ?? 0) + step);
  const factor = 10 ** decimalPlaces(step);
  const next = Math.round((base + direction * step) * factor) / factor;
  return clampNumber(next, min, max);
}

export function formatNumber(value: number, locale?: string, currency?: string): string {
  if (currency) {
    const digits =
      new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 20 }).format(value);
}

/** Editable text: locale decimal mark, no grouping, no currency symbol. */
export function editNumber(value: number, locale?: string): string {
  const { decimal } = separators(locale);
  const raw = String(value);
  return decimal === "." ? raw : raw.replace(".", decimal);
}

export function parseNumber(text: string, locale?: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "+") return null;
  const { group, decimal } = separators(locale);
  let normalized = group ? trimmed.split(group).join("") : trimmed;
  if (decimal !== ".") normalized = normalized.replace(decimal, ".");
  normalized = normalized.replace(/[^\d.+-]/g, "");
  if (normalized === "" || normalized === "-" || normalized === "." || normalized === "-." || normalized === "+.") {
    return null;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function currencyAffix(locale: string | undefined, currency: string): { start?: string; end?: string } {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0);
  const symbol = parts
    .filter((part) => part.type === "currency")
    .map((part) => part.value)
    .join("")
    .trim();
  if (!symbol) return {};
  const symbolIndex = parts.findIndex((part) => part.type === "currency");
  const numberIndex = parts.findIndex((part) => part.type === "integer" || part.type === "fraction");
  return symbolIndex < numberIndex ? { start: symbol } : { end: symbol };
}
