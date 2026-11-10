/** Demo data for OnboardingPattern. Every value is an example; replace it with your product's steps and options. */
import type { SetupTask } from "../../ui/SetupGuide";

export type OnboardingStep = "welcome" | "workspace" | "connect" | "done";

export const STEPS: { id: OnboardingStep; label: string; title: string; subtitle: string }[] = [
  {
    id: "welcome",
    label: "Welcome",
    title: "Welcome to Northwind, Priya",
    subtitle: "Three short steps and your workspace is ready to send its first invoice. About 4 minutes.",
  },
  { id: "workspace", label: "Workspace", title: "Set up your workspace", subtitle: "You can change all of this later in Settings." },
  {
    id: "connect",
    label: "Connect",
    title: "Connect or choose",
    subtitle: "Connect what you use now, or skip and do it from the Setup Guide later.",
  },
  { id: "done", label: "Done", title: "is ready", subtitle: "Pick them up any time from the dashboard." },
];

export const PRODUCT = { name: "Northwind", mark: "N" };

export const WELCOME_ITEMS = [
  { id: "workspace", primary: "Name your workspace", secondary: "So your team and customers recognise it", icon: "House" },
  { id: "connect", primary: "Connect your tools", secondary: "Payments, accounting and email", icon: "Plug" },
  { id: "invoice", primary: "Send a first invoice", secondary: "From a template, in under a minute", icon: "Rocket" },
];

export interface WorkspaceValues {
  name: string;
  country: string;
  currency: string;
  teamSize: string;
}

export const WORKSPACE_DEFAULTS: WorkspaceValues = {
  name: "Northwind Studio",
  country: "gb",
  currency: "gbp",
  teamSize: "2-10",
};

export const COUNTRY_OPTIONS = [
  { value: "gb", label: "United Kingdom" },
  { value: "ie", label: "Ireland" },
  { value: "de", label: "Germany" },
  { value: "us", label: "United States" },
];

export const CURRENCY_OPTIONS = [
  { value: "gbp", label: "GBP · £" },
  { value: "eur", label: "EUR · €" },
  { value: "usd", label: "USD · $" },
];

export const TEAM_SIZE_OPTIONS = [
  { value: "1", label: "Just me" },
  { value: "2-10", label: "2–10 people" },
  { value: "11-50", label: "11–50 people" },
  { value: "51+", label: "51 or more" },
];

export const SETUP_TASKS: SetupTask[] = [
  { id: "company", label: "Add company details", description: "Name, address and tax ID", status: "done" },
  { id: "payments", label: "Connect a payment method", description: "So customers can pay online", status: "current", actionLabel: "Connect" },
  { id: "customers", label: "Import customers", description: "CSV or connect your CRM", status: "todo", actionLabel: "Import" },
];
