import type { PatternSlug } from "./playground-nav";
import type { OnboardingStep, WorkspaceState } from "../packages/kit/patterns/OnboardingPattern";
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

/** The screens on Paper p-6-0 (Settings set). Each one is a section plus that section's state. */
export const SETTINGS_SCREENS: {
  id: string;
  label: string;
  section: SettingsSection;
  billing?: BillingState;
  team?: TeamState;
  invite?: boolean;
  twoFactor?: boolean;
}[] = [
  { id: "billing", label: "Billing", section: "billing" },
  { id: "billing-overdue", label: "Billing · overdue", section: "billing", billing: "overdue" },
  { id: "billing-loading", label: "Billing · loading", section: "billing", billing: "loading" },
  { id: "billing-error", label: "Billing · error", section: "billing", billing: "error" },
  { id: "profile", label: "Profile", section: "profile" },
  { id: "team", label: "Team", section: "team" },
  { id: "team-invite", label: "Team · invite drawer", section: "team", invite: true },
  { id: "team-empty", label: "Team · empty", section: "team", team: "empty" },
  { id: "notifications", label: "Notifications", section: "notifications" },
  { id: "security", label: "Security", section: "security" },
  { id: "security-2fa-off", label: "Security · 2FA off", section: "security", twoFactor: false },
];

/** The screens on Paper p-6-0 (Onboarding): each step, plus the workspace step's error and submitting states. */
export const ONBOARDING_SCREENS: { id: string; label: string; step: OnboardingStep; workspace?: WorkspaceState }[] = [
  { id: "welcome", label: "01 Welcome", step: "welcome" },
  { id: "workspace", label: "02 Workspace", step: "workspace" },
  { id: "workspace-error", label: "02b Workspace · validation error", step: "workspace", workspace: "error" },
  { id: "workspace-submitting", label: "02c Workspace · submitting", step: "workspace", workspace: "submitting" },
  { id: "connect", label: "03 Connect or choose", step: "connect" },
  { id: "done", label: "04 Done", step: "done" },
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
  "list-detail": [{ id: "default", label: "List detail" }],
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
    { id: "history", label: "History" },
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
  settings: SETTINGS_SCREENS.map(({ id, label }) => ({ id, label })),
  onboarding: ONBOARDING_SCREENS.map(({ id, label }) => ({ id, label })),
  "insight-stack": [
    { id: "specimens", label: "Ranked, loading, all clear" },
    { id: "ranked", label: "Ranked · sm, md, lg" },
    { id: "loading", label: "Loading · sm, md, lg" },
    { id: "all-clear", label: "All clear · sm, md, lg" },
    { id: "mobile", label: "Mobile 390", device: "mobile" },
  ],
};

export function isScreenSlug(slug: string): slug is ScreenSlug {
  return Object.prototype.hasOwnProperty.call(PATTERN_VIEWS, slug);
}

/** One line per pattern page: the index card description and the page lead. */
export const PATTERN_BLURBS: Record<PatternSlug, string> = {
  dashboard: "Billing home: four KPIs that drive the revenue chart, Needs attention, overdue invoices, a Revenue tab of analysis charts, and an Ask panel.",
  "settings-form": "Grouped settings fields with save and cancel.",
  "list-detail": "A list of records beside the one you selected.",
  "empty-first-run": "A new billing workspace with no invoices: one Create invoice, opt-in sample data and a one-line setup status.",
  "sign-in": "Centered sign-in card: SSO, email and password, then a one-time code step.",
  "app-shell": "Side nav with a workspace switcher, quick actions and a Notifications panel around the page, inset or flat, with a narrow drawer.",
  layouts: "Top bar and side nav, composed from kit components.",
  "billing-schedule": "Next charge, a failed-payment notice, and every charge with its status.",
  "integration-settings": "One integration's status and last sync, the sync error with Retry, sync settings, and Disconnect kept away from Save.",
  settings: "Settings nav beside Profile, Billing, Team, Notifications and Security pages, with their states.",
  onboarding: "Four guided setup steps with progress, a validation error and a submitting state.",
  "insight-stack": "A ranked AI summary card: findings with a change and a Why? panel, a loading state and an all-clear state.",
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
};
