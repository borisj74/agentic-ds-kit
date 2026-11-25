import type { PatternSlug } from "./playground-nav";
import type { ConfirmState, OnboardingStep } from "../packages/kit/patterns/OnboardingPattern";
import type { BillingState, SettingsSection, TeamState } from "../packages/kit/patterns/SettingsPattern";

/**
 * Pattern screens: the states each pattern page can show in its preview frame
 * (/frame/patterns/<slug>?view=<id>). Plain data, so the frame route (a Server Component)
 * and the client previews share it.
 */
export interface ScreenView {
  id: string;
  label: string;
  /** Show this screen at phone width (390) in the preview and its thumbnail. */
  device?: "mobile";
}

/** The Settings screens (Paper p-9-1, 4GQH-0): each section plus its states, and the 390 index. */
export const SETTINGS_SCREENS: {
  id: string;
  label: string;
  /** null is the index page (390). */
  section: SettingsSection | null;
  billing?: BillingState;
  team?: TeamState;
  invite?: boolean;
  twoFactor?: boolean;
  device?: "mobile";
}[] = [
  { id: "general", label: "General", section: "general" },
  { id: "billing", label: "Billing", section: "billing" },
  { id: "billing-overdue", label: "Billing · overdue", section: "billing", billing: "overdue" },
  { id: "billing-loading", label: "Billing · loading", section: "billing", billing: "loading" },
  { id: "billing-error", label: "Billing · error", section: "billing", billing: "error" },
  { id: "team", label: "Team", section: "team" },
  { id: "team-invite", label: "Team · invite drawer", section: "team", invite: true },
  { id: "team-empty", label: "Team · empty", section: "team", team: "empty" },
  { id: "integrations", label: "Integrations", section: "integrations" },
  { id: "security", label: "Security", section: "security" },
  { id: "profile", label: "Profile", section: "profile" },
  { id: "notifications", label: "Notifications", section: "notifications" },
  { id: "sign-in", label: "Sign-in", section: "sign-in" },
  { id: "sign-in-2fa-off", label: "Sign-in · 2FA off", section: "sign-in", twoFactor: false },
  { id: "index", label: "390 · Settings index", section: null, twoFactor: false, device: "mobile" },
  { id: "general-390", label: "390 · General", section: "general", device: "mobile" },
  { id: "billing-390", label: "390 · Billing", section: "billing", device: "mobile" },
  { id: "team-390", label: "390 · Team", section: "team", device: "mobile" },
  { id: "security-390", label: "390 · Security", section: "security", device: "mobile" },
  { id: "sign-in-390", label: "390 · Sign-in", section: "sign-in", device: "mobile" },
];

/** The Onboarding screens (Paper p-9-1, 4H05-0): each step, plus Review's error and submitting states. */
export const ONBOARDING_SCREENS: { id: string; label: string; step: OnboardingStep; confirm?: ConfirmState }[] = [
  { id: "business", label: "01 Business", step: "business" },
  { id: "plan", label: "02 Plan", step: "plan" },
  { id: "billing", label: "03 Billing", step: "billing" },
  { id: "review", label: "04 Review", step: "review" },
  { id: "review-error", label: "04b Review · business name missing", step: "review", confirm: "error" },
  { id: "review-submitting", label: "04c Review · creating account", step: "review", confirm: "submitting" },
];

/** Pattern pages shown as a full screen in a frame. Layouts is a page of its own. */
export type ScreenSlug = Exclude<PatternSlug, "layouts">;

/** Each screen's states; the first is the default. One entry: no state picker. */
export const PATTERN_VIEWS: Record<ScreenSlug, ScreenView[]> = {
  dashboard: [
    { id: "overview", label: "Overview" },
    { id: "compare", label: "Compare on" },
    { id: "metric", label: "Different metric selected" },
    { id: "chat", label: "Chat open" },
    { id: "empty", label: "No data yet" },
    { id: "loading", label: "Loading" },
    { id: "mobile", label: "Mobile 390", device: "mobile" },
  ],
  "settings-form": [{ id: "default", label: "Settings form" }],
  "list-detail": [
    { id: "default", label: "INV-1842 open" },
    { id: "none", label: "Nothing open" },
    { id: "mobile", label: "Mobile 390 list", device: "mobile" },
    { id: "mobile-detail", label: "Mobile 390 detail", device: "mobile" },
  ],
  "empty-first-run": [
    { id: "default", label: "First run" },
    { id: "mobile", label: "Mobile 390", device: "mobile" },
  ],
  "sign-in": [
    { id: "sign-in", label: "Sign in" },
    { id: "error", label: "Wrong password" },
    { id: "code", label: "Code step" },
    { id: "sign-up", label: "Sign up" },
  ],
  "app-shell": [
    { id: "inset", label: "Inset" },
    { id: "flat", label: "Flat" },
    { id: "collapsed", label: "Collapsed rail" },
    { id: "panel", label: "Work panel" },
    { id: "drawer", label: "Mobile drawer" },
    { id: "custom", label: "Custom chrome" },
    { id: "built-nav", label: "Built nav, no header" },
  ],
  "billing-schedule": [
    { id: "history", label: "Schedule" },
    { id: "next", label: "Next charge" },
    { id: "summary", label: "Summary" },
    { id: "empty", label: "Empty" },
    { id: "loading", label: "Loading" },
  ],
  "integration-settings": [
    { id: "connected", label: "Connected" },
    { id: "syncing", label: "Syncing" },
    { id: "error", label: "Error" },
    { id: "needsReauth", label: "Needs reauth" },
    { id: "disconnected", label: "Not connected" },
  ],
  settings: SETTINGS_SCREENS.map(({ id, label, device }) => (device ? { id, label, device } : { id, label })),
  onboarding: ONBOARDING_SCREENS.map(({ id, label }) => ({ id, label })),
  "insight-stack": [
    { id: "specimens", label: "Ranked, loading, all clear" },
    { id: "ranked", label: "Ranked · sm, md, lg" },
    { id: "loading", label: "Loading · sm, md, lg" },
    { id: "all-clear", label: "All clear · sm, md, lg" },
    { id: "mobile", label: "Mobile 390", device: "mobile" },
  ],
  "run-detail": [
    { id: "failed", label: "Failed on step 2" },
    { id: "running", label: "Running" },
    { id: "done", label: "Done" },
    { id: "mobile", label: "Mobile 390 · failed", device: "mobile" },
    { id: "mobile-running", label: "Mobile 390 · running", device: "mobile" },
  ],
  "agent-permissions": [
    { id: "default", label: "Request waiting" },
    { id: "edit-drawer", label: "Edit level" },
    { id: "granted", label: "Granted" },
    { id: "denied", label: "Denied" },
    { id: "error", label: "Not saved" },
    { id: "390", label: "Mobile 390", device: "mobile" },
  ],
};

export function isScreenSlug(slug: string): slug is ScreenSlug {
  return Object.prototype.hasOwnProperty.call(PATTERN_VIEWS, slug);
}

/** One line per pattern page: the index card description and the page lead. */
export const PATTERN_BLURBS: Record<PatternSlug, string> = {
  dashboard: "Billing home: four KPIs that drive the revenue chart, Needs attention, overdue invoices, a Revenue tab of analysis charts, and an Ask panel.",
  "settings-form": "Company billing details in grouped fields, with a sticky save bar.",
  "list-detail": "A list of invoices beside the one you opened.",
  "empty-first-run": "A new billing workspace with no invoices: one Create invoice, opt-in sample data and a one-line setup status.",
  "sign-in": "Centered sign-in card: SSO, email and password, then a one-time code step.",
  "app-shell": "Side nav with a workspace switcher, quick actions and a Notifications panel around the page, inset or flat, with a narrow drawer.",
  layouts: "Top bar and side nav, composed from kit components.",
  "billing-schedule": "Next charge, a failed-payment notice, and every charge with its status.",
  "integration-settings": "One integration's status and last sync, the sync error with Retry, sync settings, and Disconnect kept away from Save.",
  settings: "A settings nav in two groups (Workspace, You) beside each section, with a scope line under the title; an index page of two lists at 390.",
  onboarding: "Four setup steps (business, plan, billing, review) with progress, a validation error and a creating state.",
  "insight-stack": "A ranked AI summary card: findings with a change and a Why? panel, a loading state and an all-clear state.",
  "agent-permissions": "What each agent may do on its own: a waiting request to Grant or Deny, a table of actions and levels with Edit, a switch to stop all agents, and the default for new actions.",
  "run-detail": "One agent run: a status bar with time and cost, the step trail and trace, and every tool call with Retry on the failed one.",
};

/** Each screen pattern's add command. Docs slugs are the pattern ids. */
export const PATTERN_ADD: Record<ScreenSlug, string> = {
  dashboard: "npx agentic-ds-kit add dashboard",
  "settings-form": "npx agentic-ds-kit add settings-form",
  "list-detail": "npx agentic-ds-kit add list-detail",
  "empty-first-run": "npx agentic-ds-kit add empty-first-run",
  "sign-in": "npx agentic-ds-kit add sign-in",
  "app-shell": "npx agentic-ds-kit add app-shell",
  "billing-schedule": "npx agentic-ds-kit add billing-schedule",
  "integration-settings": "npx agentic-ds-kit add integration-settings",
  settings: "npx agentic-ds-kit add settings",
  onboarding: "npx agentic-ds-kit add onboarding",
  "insight-stack": "npx agentic-ds-kit add insight-stack",
  "run-detail": "npx agentic-ds-kit add run-detail",
  "agent-permissions": "npx agentic-ds-kit add agent-permissions",
};
