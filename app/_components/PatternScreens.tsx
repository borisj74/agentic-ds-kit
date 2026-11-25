"use client";

import { PATTERN_VIEWS, type ScreenSlug } from "@/lib/pattern-screens";
import { AppShellScreen } from "./AppShellDemo";
import { DashboardScreen, ListDetailScreen } from "./DashboardDemo";
import { InsightStackScreen } from "./InsightStackDemo";
import { BillingScheduleScreen, IntegrationSettingsScreen } from "./SaasPatternDemo";
import { OnboardingScreen, SettingsScreen } from "./ScreensPatternDemo";
import { SignInScreen } from "./SignInDemo";

/** One pattern screen, full size. The frame route renders it alone, so it fills the viewport. */
export function PatternScreen({ slug, view }: { slug: ScreenSlug; view?: string }) {
  const views = PATTERN_VIEWS[slug];
  const current = views.some((item) => item.id === view) ? view : views[0].id;
  switch (slug) {
    case "dashboard":
      return <DashboardScreen pattern={slug} view={current} />;
    case "list-detail":
      return <ListDetailScreen view={current} />;
    case "settings-form":
      return <DashboardScreen pattern="settings" />;
    case "empty-first-run":
      return <DashboardScreen pattern="empty" />;
    case "sign-in":
      return <SignInScreen view={current} />;
    case "app-shell":
      return <AppShellScreen view={current} />;
    case "billing-schedule":
      return <BillingScheduleScreen view={current} />;
    case "integration-settings":
      return <IntegrationSettingsScreen view={current} />;
    case "settings":
      return <SettingsScreen view={current} />;
    case "onboarding":
      return <OnboardingScreen view={current} />;
    case "insight-stack":
      return <InsightStackScreen view={current} />;
  }
}
