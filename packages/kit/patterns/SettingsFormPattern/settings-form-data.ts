/**
 * Demo data for SettingsFormPattern: Northwind's company billing details.
 * Replace SAVED with the values you load, DRAFT with what the form opens with (usually SAVED),
 * and the options with yours.
 */
export interface BillingDetails {
  legalName: string;
  tradingName: string;
  companyNumber: string;
  vatNumber: string;
  street: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
  currency: string;
  billingEmail: string;
}

export type BillingField = keyof BillingDetails;

/** What the server has. */
export const SAVED: BillingDetails = {
  legalName: "Northwind Traders Ltd",
  tradingName: "Northwind",
  companyNumber: "08214573",
  vatNumber: "GB123456789",
  street: "18 Hatton Garden",
  line2: "Floor 3",
  city: "London",
  postcode: "EC1N 8JY",
  country: "gb",
  currency: "usd",
  billingEmail: "ap@northwind.co.uk",
};

/** The demo opens with two unsaved edits so the save bar has something to say. */
export const DRAFT: BillingDetails = {
  ...SAVED,
  legalName: "Northwind Traders Limited",
  currency: "gbp",
};

/** When SAVED was last saved, pre-formatted. */
export const LAST_SAVED = "Nov 14 by Maya Chen";

export const CURRENCY_OPTIONS = [
  { value: "gbp", label: "GBP · Pound sterling" },
  { value: "usd", label: "USD · US dollar" },
  { value: "eur", label: "EUR · Euro" },
];

export const COUNTRY_OPTIONS = [
  { value: "gb", label: "United Kingdom" },
  { value: "ie", label: "Ireland" },
  { value: "us", label: "United States" },
  { value: "de", label: "Germany" },
];

/** Field labels, in form order. The save bar lists changed fields by these names. */
export const LABELS: Record<BillingField, string> = {
  legalName: "Legal name",
  tradingName: "Trading name",
  companyNumber: "Company number",
  vatNumber: "VAT number",
  street: "Street address",
  line2: "Address line 2",
  city: "City",
  postcode: "Postcode",
  country: "Country",
  currency: "Invoice currency",
  billingEmail: "Billing email",
};

/** The value as the user saw it: the option label for Selects. */
export function displayValue(field: BillingField, value: string): string {
  const options = field === "currency" ? CURRENCY_OPTIONS : field === "country" ? COUNTRY_OPTIONS : null;
  if (!options) return value;
  const label = options.find((option) => option.value === value)?.label ?? value;
  // "USD · US dollar" reads as "USD" in a hint.
  return field === "currency" ? label.split(" · ")[0] : label;
}

/**
 * The hint under a field. A changed field leads with its saved value ("Was USD."), so the old value is
 * in words, not only in the Edited marker. Short captions have no period; two-sentence hints do.
 */
export function hintFor(field: BillingField, saved: BillingDetails, changed: boolean): string | undefined {
  const old = displayValue(field, saved[field]);
  const was = field === "currency" || field === "country" ? `Was ${old}.` : `Was “${old}”.`;
  switch (field) {
    case "legalName":
      return changed ? `${was} Use the name on your Companies House record.` : "Use the name on your Companies House record";
    case "vatNumber":
      return changed ? `${was} GB and 9 digits. We check it with HMRC when you save.` : "GB and 9 digits. We check it with HMRC when you save.";
    case "currency":
      return changed ? `${was} Applies from INV-1843; INV-1842 and earlier stay in ${old}.` : "Applies from the next invoice";
    case "billingEmail":
      return changed ? `${was} Every invoice and receipt goes here.` : "Every invoice and receipt goes here";
    default:
      return changed ? (old === "" ? "Was empty." : was) : undefined;
  }
}

/** The two checks this demo runs on Save. Returns the fix in words, or undefined. */
export function validate(field: BillingField, value: string): string | undefined {
  if (field === "legalName" && value.trim() === "") return "Enter the legal name. It goes on every invoice.";
  if (field === "vatNumber") {
    const compact = value.replace(/\s+/g, "").toUpperCase();
    if (compact === "") return undefined;
    const match = /^GB(\d*)$/.exec(compact);
    if (!match) return "Start with GB, then the 9 digits, like GB123456789.";
    const digits = match[1].length;
    if (digits < 9) {
      const more = 9 - digits;
      return `Add ${more === 1 ? "one more digit" : `${more} more digits`}. UK VAT numbers have 9 after GB.`;
    }
    if (digits > 9) return "Remove the extra digits. UK VAT numbers have 9 after GB.";
  }
  return undefined;
}

/** Fields that validate() checks, in form order. At most two, so the summary Alert has one Button each. */
export const CHECKED_FIELDS: BillingField[] = ["legalName", "vatNumber"];
