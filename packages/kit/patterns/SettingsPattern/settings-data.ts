/** Demo data for SettingsPattern. Every value is an example; replace it with your workspace's data. */
import { Building2, KeyRound, Monitor, ShieldCheck, Smartphone } from "lucide-react";
import type { KitIcon } from "../../ui/Button";
import type { Charge } from "../BillingSchedulePattern";

export type SettingsSection = "general" | "billing" | "team" | "integrations" | "security" | "profile" | "notifications" | "sign-in";

/** workspace: settings for everyone in the workspace. you: settings that only change it for the signed-in person. */
export type SettingsGroupId = "workspace" | "you";

export interface SettingsSectionMeta {
  id: SettingsSection;
  group: SettingsGroupId;
  label: string;
  icon: KitIcon;
  /** The scope line under the page title: who a change reaches. */
  scope: string;
  /** Who can edit, added to the scope line when wide. */
  editors?: string;
  /** The row's second line on the narrow index page: what's inside. */
  description: string;
}

export const WORKSPACE = {
  name: "Northwind Studio",
  mark: "N",
  plan: "Pro · 12 of 15 seats",
  members: 12,
};

const WORKSPACE_SCOPE = `Workspace setting · applies to all ${WORKSPACE.members} members`;
const YOU_SCOPE = "Personal setting · only changes it for you";

/** Settings sections in nav order: the workspace group, then the you group. API waits for its own board. */
export const SECTIONS: SettingsSectionMeta[] = [
  { id: "general", group: "workspace", label: "General", icon: Building2, scope: WORKSPACE_SCOPE, editors: "owners and admins can edit", description: "Northwind Studio Ltd · USD" },
  { id: "billing", group: "workspace", label: "Billing", icon: "CreditCard", scope: WORKSPACE_SCOPE, editors: "owners and billing can edit", description: "Next charge $348.00 on 1 Dec" },
  { id: "team", group: "workspace", label: "Team", icon: "Users", scope: WORKSPACE_SCOPE, editors: "owners and admins can edit", description: "11 members · 1 invite" },
  { id: "integrations", group: "workspace", label: "Integrations", icon: "Plug", scope: WORKSPACE_SCOPE, editors: "owners and admins can edit", description: "3 connected" },
  { id: "security", group: "workspace", label: "Security", icon: ShieldCheck, scope: WORKSPACE_SCOPE, editors: "owners can change it", description: "Okta SSO · two-step required" },
  { id: "profile", group: "you", label: "Profile", icon: "User", scope: YOU_SCOPE, description: "Priya Shah · Owner" },
  { id: "notifications", group: "you", label: "Notifications", icon: "Bell", scope: YOU_SCOPE, description: "Email and in-app" },
  { id: "sign-in", group: "you", label: "Sign-in", icon: KeyRound, scope: YOU_SCOPE, description: "Password · two-factor on" },
];

/** The two nav groups and the narrow index lists, with the heading shown above each list. */
export const SETTINGS_GROUPS: { id: SettingsGroupId; label: string; heading: string }[] = [
  { id: "workspace", label: "Workspace", heading: `Workspace · applies to all ${WORKSPACE.members} members` },
  { id: "you", label: "You", heading: "You · only changes it for you" },
];

/** General: what Northwind Studio shows on invoices and links. SAVED is what the server has. */
export const GENERAL_SAVED = {
  name: "Northwind Studio",
  slug: "northwind",
  currency: "usd",
  prefix: "INV-",
  timezone: "europe-london",
};

/** The demo opens with one unsaved edit so the save bar has something to say. */
export const GENERAL_DRAFT = { ...GENERAL_SAVED, name: "Northwind Studio Ltd" };

export const GENERAL_LABELS: Record<keyof typeof GENERAL_SAVED, string> = {
  name: "Workspace name",
  slug: "Workspace URL",
  currency: "Default currency",
  prefix: "Invoice prefix",
  timezone: "Time zone",
};

export const URL_BASE = "app.nistha.example/";
export const NEXT_INVOICE_NUMBER = 1843;

export const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD · US dollar" },
  { value: "gbp", label: "GBP · Pound sterling" },
  { value: "eur", label: "EUR · Euro" },
];

export const DELETE_COPY = {
  title: "Delete workspace",
  description: "Removes 1,284 invoices and 12 members. You type the name to confirm.",
};

export const PROFILE = {
  fullName: "Priya Shah",
  displayName: "Priya",
  initials: "PS",
  email: "priya@northwind.example",
  language: "en-GB",
  timezone: "europe-london",
};

export const LANGUAGE_OPTIONS = [
  { value: "en-GB", label: "English (UK)" },
  { value: "en-US", label: "English (US)" },
  { value: "de-DE", label: "Deutsch" },
];

export const TIMEZONE_OPTIONS = [
  { value: "europe-london", label: "Europe/London (GMT+0)" },
  { value: "europe-berlin", label: "Europe/Berlin (GMT+1)" },
  { value: "america-new-york", label: "America/New_York (GMT−5)" },
];

/** Billing overview. Money arrives pre-formatted from your app. */
export const PLAN = {
  name: "Pro",
  priceNote: "$29 per seat / month · 12 seats",
  short: "Pro · 12 seats",
  nextCharge: "$348.00 on 01 Dec",
  upgradeTo: "Business",
};

export const PAYMENT_METHOD = {
  card: "Visa ending 4242",
  expires: "Expires 08/28",
  receipts: "billing@northwind.example",
};

/** AI credits this period, for the kit UsageMeter. */
export const CREDITS = {
  used: 9300,
  limit: 10000,
  resetLabel: "resets 01 Dec",
  paceNote: "At this pace you run out on 28 Nov.",
  categories: [
    { id: "drafting", label: "Invoice drafting", value: 5100 },
    { id: "reminders", label: "Payment reminders", value: 2700 },
    { id: "reconciliation", label: "Reconciliation", value: 1500 },
  ],
};

export const OVERDUE = {
  title: "Payment overdue · INV-1803 · $22.40",
  body: "The charge on 18 Sep failed. Workspace pauses on 30 Nov if unpaid.",
};

export type InvoiceStatus = "paid" | "failed";

export interface Invoice {
  id: string;
  number: string;
  date: string;
  short: string;
  item: string;
  status: InvoiceStatus;
  amount: string;
}

export const INVOICES: Invoice[] = [
  { id: "inv-1842", number: "INV-1842", date: "01 Nov 2026", short: "01 Nov", item: "Pro · 12 seats", status: "paid", amount: "$348.00" },
  { id: "inv-1817", number: "INV-1817", date: "01 Oct 2026", short: "01 Oct", item: "Pro · 11 seats", status: "paid", amount: "$319.00" },
  { id: "inv-1803", number: "INV-1803", date: "18 Sep 2026", short: "18 Sep", item: "Seat added, prorated", status: "failed", amount: "$22.40" },
];

export const INVOICES_SUMMARY = "Last 12 months · 14 invoices";
export const INVOICES_NOTE = "INV-1803 failed on 18 Sep. We retry on 25 Nov with the card above.";

export const PRICING_PLANS = [
  { id: "starter", name: "Starter", tagline: "For one person sending invoices", price: 12, yearlyPrice: 10, features: ["1 seat", "1,000 AI credits", "Email reminders"] },
  { id: "pro", name: "Pro", tagline: "For small finance teams", fit: "You use 93% of its AI credits", price: 29, yearlyPrice: 24, features: ["Up to 15 seats", "10,000 AI credits", "Approvals and agents"], current: true },
  { id: "business", name: "Business", tagline: "For teams that run billing with agents", fit: "Fits your usage with room to grow", price: 49, yearlyPrice: 41, features: ["Unlimited seats", "50,000 AI credits", "SSO and audit log"], recommended: true },
];

export const RECENT_CHARGES: Charge[] = [
  { id: "dec", date: "2026-12-01", label: "Pro plan", amount: "$348.00", status: "scheduled" },
  { id: "nov", date: "2026-11-01", label: "Pro plan", amount: "$348.00", status: "paid" },
  { id: "seat", date: "2026-10-18", label: "Seat added", amount: "$22.40", status: "invoiced" },
];

export type MemberStatus = "active" | "invited";

export interface Member {
  id: string;
  name: string;
  /** Second line: the email, or who invited them and when the invite ends. */
  detail: string;
  role: string;
  status: MemberStatus;
  lastActive: string;
  you?: boolean;
}

export const MEMBERS: Member[] = [
  { id: "ps", name: "Priya Shah", detail: "priya@northwind.example", role: "owner", status: "active", lastActive: "Now", you: true },
  { id: "ml", name: "Marco Li", detail: "marco@northwind.example", role: "admin", status: "active", lastActive: "2 h ago" },
  { id: "rs", name: "Rita Sá", detail: "rita@northwind.example", role: "billing", status: "active", lastActive: "Yesterday" },
  { id: "ak", name: "Ana Kovač", detail: "ana@northwind.example", role: "member", status: "active", lastActive: "3 d ago" },
  { id: "jd", name: "Jon Dale", detail: "Invited by Marco Li · expires in 5 days", role: "member", status: "invited", lastActive: "Sent 2 d ago" },
];

/** Seats count pending invites: 11 members and 1 invite hold 12 of 15. */
export const SEATS = { used: 12, limit: 15, members: 11, invites: 1, total: 12, extra: "Extra seats $29 / month" };

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "billing", label: "Billing" },
];

export const ROLE_FILTER_OPTIONS = [{ value: "all", label: "All roles" }, { value: "owner", label: "Owner" }, ...ROLE_OPTIONS];

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(ROLE_FILTER_OPTIONS.map((option) => [option.value, option.label]));

export interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  { id: "payments", label: "Payments", description: "Received, failed and refunded", email: true, inApp: true },
  { id: "invoices", label: "Invoices", description: "Sent, viewed and overdue", email: true, inApp: false },
  { id: "agents", label: "Agent activity", description: "Approvals and finished runs", email: true, inApp: true },
  { id: "security", label: "Security", description: "New sign-ins and password changes", email: true, inApp: true },
  { id: "news", label: "Product news", description: "New features, monthly", email: false, inApp: false },
];

export const DIGEST_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "daily-0800", label: "Daily at 08:00" },
  { value: "weekly-mon", label: "Weekly on Monday" },
];

export const INBOX = [
  { id: "n1", title: "Payment received", body: "INV-2026-0121 · $1,240.00", createdAt: "2 h ago", read: false, tone: "success" as const },
  { id: "n2", title: "Approval needed", body: "Agent wants to send 4 reminders", createdAt: "5 h ago", read: false, tone: "info" as const },
  { id: "n3", title: "Invoice viewed", body: "Acme Ltd opened INV-2026-0118", createdAt: "Yesterday", read: true },
];

export const PASSWORD_CHANGED = "Last changed 3 months ago";
export const TWO_FACTOR_ADDED = "Authenticator app · added 12 Mar";
export const TWO_FACTOR_POLICY = "Your workspace requires two-step sign-in. Turn it on before your next sign-in.";

/** Security: how people get into the workspace. SAVED is what the server has. */
export const SSO = {
  provider: "Okta · northwind.okta.example",
  short: "Okta SSO",
  domain: "northwind.okta.example",
  detail: "Last sign-in through Okta 4 min ago · certificate expires 14 Mar 2027",
};

export const SIGN_IN_RULES_SAVED = { requireSso: false, twoStep: true };
/** The demo opens with one unsaved edit so the footer has something to say. */
export const SIGN_IN_RULES_DRAFT = { requireSso: true, twoStep: true };
export const SIGN_IN_RULE_LABELS: Record<keyof typeof SIGN_IN_RULES_SAVED, string> = {
  requireSso: "Require SSO",
  twoStep: "Two-step verification",
};
export const TWO_STEP_SETUP = { short: "10 of 12 set up", long: "10 of 12 have it set up. The other 2 set it up at their next sign-in." };

export const SESSIONS = [
  { id: "this", primary: "Chrome on macOS", secondary: "London · active now", icon: Monitor, badge: "This device", badgeTone: "info" as const },
  { id: "iphone", primary: "Safari on iPhone", secondary: "London · 2 h ago", icon: Smartphone },
  { id: "windows", primary: "Firefox on Windows", secondary: "Leeds · 6 d ago", icon: Monitor },
];

export const WORKSPACE_NAME = WORKSPACE.name;
