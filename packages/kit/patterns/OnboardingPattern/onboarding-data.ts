/** Demo data for OnboardingPattern. Every value is an example; replace it with your product's steps and options. */
import type { TileGroupItem } from "../../ui/TileGroup";

export type OnboardingStep = "business" | "plan" | "billing" | "review";

export const STEPS: { id: OnboardingStep; label: string; title: string; subtitle: string }[] = [
  { id: "business", label: "Business", title: "Tell us about your business", subtitle: "Shown on every invoice you send" },
  { id: "plan", label: "Plan", title: "Choose a plan", subtitle: "Billed monthly in GBP" },
  { id: "billing", label: "Billing", title: "Set up billing", subtitle: "Where invoices come from and when they are due" },
  { id: "review", label: "Review", title: "Review and confirm", subtitle: "Nothing is created until you confirm" },
];

export const PRODUCT = { name: "Northwind", mark: "N" };

export interface BusinessValues {
  name: string;
  country: string;
  currency: string;
  vat?: string;
}

export interface BillingValues {
  email: string;
  terms: string;
  prefix: string;
}

/** What onConfirm receives. */
export interface OnboardingValues {
  business: BusinessValues;
  plan: string;
  billing: BillingValues;
}

export const DEFAULT_VALUES: OnboardingValues = {
  business: { name: "Northwind Traders Ltd", country: "gb", currency: "gbp", vat: "GB 284 1937 62" },
  plan: "growth",
  billing: { email: "finance@northwind.co.uk", terms: "net30", prefix: "INV-" },
};

export const COUNTRY_OPTIONS = [
  { value: "gb", label: "United Kingdom", short: "UK" },
  { value: "ie", label: "Ireland", short: "IE" },
  { value: "de", label: "Germany", short: "DE" },
  { value: "us", label: "United States", short: "US" },
];

export const CURRENCY_OPTIONS = [
  { value: "gbp", label: "GBP · £", code: "GBP" },
  { value: "eur", label: "EUR · €", code: "EUR" },
  { value: "usd", label: "USD · $", code: "USD" },
];

export const TERMS_OPTIONS = [
  { value: "receipt", label: "Due on receipt" },
  { value: "net14", label: "Net 14" },
  { value: "net30", label: "Net 30" },
  { value: "net60", label: "Net 60" },
];

export const PLANS: (TileGroupItem & { price: string; seats: string })[] = [
  { value: "starter", title: "Starter", description: "Up to 50 invoices a month, one user", meta: "£19.00 a month", price: "£19.00", seats: "1 user" },
  { value: "growth", title: "Growth", description: "Unlimited invoices, 5 users, dunning", meta: "£48.00 a month", price: "£48.00", seats: "5 users" },
  { value: "scale", title: "Scale", description: "Usage billing, 20 users, SSO", meta: "£120.00 a month", price: "£120.00", seats: "20 users" },
];

/** The first invoice the account will send, shown on Review. */
export const FIRST_INVOICE = { number: "1842", date: "21 Dec 2026" };
