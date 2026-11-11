"use client";

import { PATTERN_VIEWS, type ScreenSlug } from "@/lib/pattern-screens";
import { AppShellScreen } from "./AppShellDemo";
import { DashboardScreen } from "./DashboardDemo";
import { BillingScheduleScreen, IntegrationSettingsScreen } from "./SaasPatternDemo";
import { OnboardingScreen, SettingsScreen } from "./ScreensPatternDemo";
import { SignInScreen } from "./SignInDemo";

/** One pattern screen, full size. The frame route renders it alone, so it fills the viewport. */
export function PatternScreen({ slug, view }: { slug: ScreenSlug; view?: string }) {
  const views = PATTERN_VIEWS[slug];
  const current = views.some((item) => item.id === view) ? view : views[0].id;
  switch (slug) {
    case "dashboard":
    case "settings":
    case "list-detail":
    case "empty":
      return <DashboardScreen pattern={slug} view={slug === "dashboard" ? current : undefined} />;
    case "sign-in":
      return <SignInScreen view={current} />;
    case "app-shell":
      return <AppShellScreen view={current} />;
    case "billing-schedule":
      return <BillingScheduleScreen view={current} />;
    case "integration-settings":
      return <IntegrationSettingsScreen view={current} />;
    case "settings-area":
      return <SettingsScreen view={current} />;
    case "onboarding":
      return <OnboardingScreen view={current} />;
  }
}
