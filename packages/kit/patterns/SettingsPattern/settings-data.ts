/** Demo data for SettingsPattern. Every value is an example; replace it with your workspace's data. */
import { Building2, ShieldCheck } from "lucide-react";
import type { KitIcon } from "../../ui/Button";
import type { Charge } from "../BillingSchedulePattern";

export type SettingsSection = "general" | "billing" | "team" | "integrations" | "profile" | "notifications" | "security";

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
  { id: "team", group: "workspace", label: "Team", icon: "Users", scope: WORKSPACE_SCOPE, editors: "owners and admins can edit", description: "12 members · 1 invited" },
  { id: "integrations", group: "workspace", label: "Integrations", icon: "Plug", scope: WORKSPACE_SCOPE, editors: "owners and admins can edit", description: "3 connected" },
  { id: "profile", group: "you", label: "Profile", icon: "User", scope: YOU_SCOPE, description: "Priya Shah · Owner" },
  { id: "notifications", group: "you", label: "Notifications", icon: "Bell", scope: YOU_SCOPE, description: "Email and in-app" },
  { id: "security", group: "you", label: "Security", icon: ShieldCheck, scope: YOU_SCOPE, description: "Two-factor on" },
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
  title: "Delete Northwind Studio",
  description: "Removes its 1,284 invoices and 12 members. A dialog asks you to confirm first.",
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
  price: "$29",
  priceNote: "per seat / month · 12 seats",
  renews: "renews 01 Dec",
  nextCharge: "$348.00 on 01 Dec",
  upgradeTo: "Business",
};

export const USAGE = [
  { id: "seats", label: "Seats", used: 12, limit: 15, unit: "seats" },
  { id: "credits", label: "AI credits", used: 7400, limit: 10000, unit: "credits" },
  { id: "invoices", label: "Invoices", used: 412, limit: 1000, unit: "invoices" },
];

/** Overdue example: credits near the limit and one unpaid invoice. */
export const USAGE_OVERDUE = USAGE.map((row) =>
  row.id === "credits" ? { ...row, used: 9300, note: "At 93%. Add a top-up or AI credits pause on 28 Nov." } : row,
);

export const OVERDUE = {
  title: "Payment overdue · INV-2026-0117 · $348.00",
  body: "12 days late. Workspace pauses on 30 Nov if unpaid.",
};

export const RECENT_CHARGES: Charge[] = [
  { id: "dec", date: "01 Dec 2026", label: "Pro plan", amount: "$348.00", status: "upcoming" },
  { id: "nov", date: "01 Nov 2026", label: "Pro plan", amount: "$348.00", status: "paid" },
  { id: "seat", date: "18 Oct 2026", label: "Seat added", amount: "$22.40", status: "invoiced" },
];

export const DOCUMENTS = [
  { id: "inv-0117", primary: "Invoice INV-2026-0117", secondary: "01 Nov · $348.00", badge: "Paid", badgeTone: "success" as const },
  { id: "cn-0042", primary: "Credit note CN-0042", secondary: "reduces INV-2026-0117 · −$86.40", badge: "Credit", badgeTone: "info" as const },
];

export type MemberStatus = "active" | "invited";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: MemberStatus;
  you?: boolean;
}

export const MEMBERS: Member[] = [
  { id: "ps", name: "Priya Shah", email: "priya@northwind.example", role: "owner", status: "active", you: true },
  { id: "ml", name: "Marco Li", email: "marco@northwind.example", role: "admin", status: "active" },
  { id: "ak", name: "Ana Kovač", email: "ana@northwind.example", role: "member", status: "active" },
  { id: "jd", name: "Jon Dale", email: "jon@northwind.example", role: "member", status: "invited" },
  { id: "rs", name: "Rita Sá", email: "rita@northwind.example", role: "billing", status: "active" },
];

export const SEATS = { used: 5, limit: 15 };

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "billing", label: "Billing" },
];

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
export const TWO_FACTOR_POLICY = "Your workspace policy asks admins to turn this on by 30 Nov.";

export const SESSIONS = [
  { id: "this", primary: "Chrome on macOS", secondary: "London · active now", icon: "Monitor", badge: "This device", badgeTone: "info" as const },
  { id: "iphone", primary: "Safari on iPhone", secondary: "London · 2 h ago", icon: "Smartphone" },
  { id: "windows", primary: "Firefox on Windows", secondary: "Leeds · 6 d ago", icon: "Monitor" },
];

export const WORKSPACE_NAME = WORKSPACE.name;
