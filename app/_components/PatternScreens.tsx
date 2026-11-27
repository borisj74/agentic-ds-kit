"use client";

import { PATTERN_VIEWS, type ScreenSlug } from "@/lib/pattern-screens";
import { AgentActivityScreen } from "./AgentActivityScreen";
import { AgentPermissionsScreen } from "./AgentPermissionsScreen";
import { AppShellScreen } from "./AppShellDemo";
import { AssistantStartScreen } from "./AssistantStartScreen";
import { DashboardScreen, EmptyFirstRunScreen, ListDetailScreen, SettingsFormScreen } from "./DashboardDemo";
import { InsightStackScreen } from "./InsightStackDemo";
import { RunDetailScreen } from "./RunDetailScreen";
import { BillingScheduleScreen, IntegrationSettingsScreen } from "./SaasPatternDemo";
import { OnboardingScreen, SettingsScreen } from "./ScreensPatternDemo";
import { SignInScreen } from "./SignInDemo";

/** One pattern screen, full size. The frame route renders it alone, so it fills the viewport. */
export function PatternScreen({ slug, view }: { slug: ScreenSlug; view?: string }) {
  const views = PATTERN_VIEWS[slug];
  const current = views.some((item) => item.id === view) ? view : views[0].id;
  switch (slug) {
    case "dashboard":
      return <DashboardScreen view={current} />;
    case "list-detail":
      return <ListDetailScreen view={current} />;
    case "settings-form":
      return <SettingsFormScreen />;
    case "empty-first-run":
      return <EmptyFirstRunScreen />;
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
    case "run-detail":
      return <RunDetailScreen view={current} />;
    case "assistant-start":
      return <AssistantStartScreen view={current} />;
    case "agent-activity":
      return <AgentActivityScreen view={current} />;
    case "agent-permissions":
      return <AgentPermissionsScreen view={current} />;
  }
}
