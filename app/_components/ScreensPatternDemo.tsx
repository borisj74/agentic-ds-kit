"use client";

import { useState } from "react";
import { ONBOARDING_SCREENS, SETTINGS_SCREENS } from "@/lib/pattern-screens";
import { OnboardingPattern } from "../../packages/kit/patterns/OnboardingPattern";
import { Button } from "agentic-ds-kit";
import { SettingsPattern, type SettingsSection } from "../../packages/kit/patterns/SettingsPattern";

/**
 * The settings pattern as a full screen: it renders its own settings SideNav and inset panel when
 * wide, and the index page below --grid-breakpoint-md. `view` is one of the screens (section +
 * state); the nav also switches sections.
 */
export function SettingsScreen({ view }: { view?: string }) {
  const [screenId, setScreenId] = useState(SETTINGS_SCREENS.some((item) => item.id === view) ? view! : "general");
  const screen = SETTINGS_SCREENS.find((item) => item.id === screenId) ?? SETTINGS_SCREENS[0];

  function pickSection(section: SettingsSection | null) {
    setScreenId(section === null ? "index" : (SETTINGS_SCREENS.find((item) => item.section === section)?.id ?? "general"));
  }

  return (
    <SettingsPattern
      headerActions={
        <Button appearance="outline" mode="neutral" size="sm" iconStart="MessageCircle">
          Ask
        </Button>
      }
      appHref="#"
      section={screen.section}
      onSectionChange={pickSection}
      billing={screen.billing ?? "ready"}
      team={screen.team ?? "ready"}
      inviteOpen={screen.invite ?? false}
      onInviteOpenChange={(open) => setScreenId(open ? "team-invite" : "team")}
      twoFactor={screen.twoFactor ?? true}
    />
  );
}


/**
 * The onboarding pattern as a full screen. `view` is one of Paper's screens; the pattern's own
 * buttons also move between steps (creating the account waits a moment).
 */
export function OnboardingScreen({ view }: { view?: string }) {
  const [screenId, setScreenId] = useState(ONBOARDING_SCREENS.some((item) => item.id === view) ? view! : "business");
  const screen = ONBOARDING_SCREENS.find((item) => item.id === screenId) ?? ONBOARDING_SCREENS[0];

  return (
    <OnboardingPattern
      step={screen.step}
      onStepChange={(step) => setScreenId(step)}
      confirmState={screen.confirm}
      onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1200))}
    />
  );
}
