"use client";

import { useState } from "react";
import { CodeSnippet, Tabs } from "agentic-ds-kit";
import type { ScreenSlug } from "@/lib/pattern-screens";
import { ScaledFrame, frameUrl } from "../PatternPreview";
import { usePreviewMode } from "../ThemeScope";
import styles from "./Home.module.css";

/** The screens the deck flips through: four settings pages, then onboarding. */
const SCREENS: { id: string; label: string; slug: ScreenSlug; view: string; url: string }[] = [
  { id: "team", label: "Team", slug: "settings", view: "team", url: "northwind.example/settings/team" },
  { id: "billing", label: "Billing", slug: "settings", view: "billing", url: "northwind.example/settings/billing" },
  { id: "notifications", label: "Notifications", slug: "settings", view: "notifications", url: "northwind.example/settings/notifications" },
  { id: "security", label: "Security", slug: "settings", view: "security", url: "northwind.example/settings/security" },
  { id: "onboarding", label: "Onboarding", slug: "onboarding", view: "welcome", url: "northwind.example/onboarding/welcome" },
];

/** Thumbnail scale: a readable piece of the screen rather than all of it. */
const SCALE = 0.72;

/**
 * Pattern screens in a browser window, with the next two peeking behind it. The tabs pick the
 * screen; the frame is the real pattern, rendered in an iframe at desktop width.
 */
export function HomeScreens() {
  const mode = usePreviewMode();
  const [active, setActive] = useState(SCREENS[0].id);
  const index = SCREENS.findIndex((screen) => screen.id === active);
  const screen = SCREENS[index];
  const peeks = [SCREENS[(index + 2) % SCREENS.length], SCREENS[(index + 1) % SCREENS.length]];

  return (
    <div className={styles.screens}>
      <div className={styles.snippet}>
        <CodeSnippet code={`npx agentic-ds-kit add ${screen.slug}`} ariaLabel="Command to copy this pattern" wrap />
      </div>
      <Tabs
        className={styles.screenTabs}
        size="sm"
        ariaLabel="Pattern screens"
        value={active}
        onChange={setActive}
        items={SCREENS.map(({ id, label }) => ({ id, label }))}
      />
      <div className={styles.deck}>
        {peeks.map((peek, position) => (
          <div key={peek.id} className={styles.peek} data-depth={position} aria-hidden="true">
            {peek.url}
          </div>
        ))}
        <div className={styles.browser}>
          <div className={styles.browserBar} aria-hidden="true">
            <span className={styles.browserDots}>
              <span />
              <span />
              <span />
            </span>
            <span className={styles.browserUrl}>{screen.url}</span>
          </div>
          <ScaledFrame
            key={`${screen.slug}-${screen.view}-${mode}`}
            src={frameUrl(screen.slug, screen.view, mode)}
            title={`${screen.label} screen from the ${screen.slug} pattern`}
            interactive={false}
            crop={SCALE}
            deferUntilVisible
          />
        </div>
      </div>
    </div>
  );
}
