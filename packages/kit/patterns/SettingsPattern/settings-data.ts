/** Demo data for SettingsPattern. Every value is an example; replace it with your workspace's data. */
import type { Charge } from "../BillingSchedulePattern";

export type SettingsSection = "profile" | "billing" | "team" | "notifications" | "security";

export const SECTIONS: { id: SettingsSection; label: string; icon: string; subtitle: string }[] = [
  { id: "profile", label: "Profile", icon: "User", subtitle: "How you appear to your team." },
  { id: "billing", label: "Billing", icon: "CreditCard", subtitle: "Plan, usage, charges and documents. Example data." },
  { id: "team", label: "Team", icon: "Users", subtitle: "People in this workspace and what they can do." },
  { id: "notifications", label: "Notifications", icon: "Bell", subtitle: "What you hear about and where." },
  { id: "security", label: "Security", icon: "ShieldCheck", subtitle: "Sign-in, sessions and the danger zone." },
];

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

export const WORKSPACE_NAME = "Northwind Studio";
