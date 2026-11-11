"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Card } from "agentic-ds-kit";
import { PATTERN_ITEMS, type PatternSlug } from "@/lib/playground-nav";
import { AppShellDemo } from "../_components/AppShellDemo";
import { DashboardDemo } from "../_components/DashboardDemo";
import { LayoutsPreview } from "../_components/LayoutsDemo";
import { SaasPatternDemo } from "../_components/SaasPatternDemo";
import { SettingsAreaDemo } from "../_components/ScreensPatternDemo";
import { SignInDemo } from "../_components/SignInDemo";
import playground from "../playground.module.css";
import styles from "./patterns.module.css";

const SCENE_WIDTH = 1200;
const SCENE_HEIGHT = 760;

const BLURB: Record<PatternSlug, string> = {
  dashboard: "Overview with a KPI strip, chart, and task table.",
  settings: "Grouped settings fields with save and cancel.",
  "list-detail": "A list of records beside the one you selected.",
  empty: "First-run empty state with one primary action.",
  "sign-in": "Centered sign-in card with email, password, and SSO.",
  "app-shell": "Header and side nav around the page, including a narrow drawer.",
  layouts: "Top bar and side nav, composed from kit components.",
  "billing-schedule": "Next charge, a failed-payment notice, and every charge with its status.",
  "integration-settings": "One integration's status, sync settings, scopes, and a confirmed disconnect.",
  "settings-area": "Settings nav beside Profile, Billing, Team, Notifications and Security pages, with their states.",
};

function PatternPreview({ slug }: { slug: PatternSlug }) {
  if (slug === "sign-in") return <SignInDemo />;
  if (slug === "billing-schedule" || slug === "integration-settings") return <SaasPatternDemo pattern={slug} />;
  if (slug === "settings-area") return <SettingsAreaDemo />;
  if (slug === "layouts") return <LayoutsPreview />;
  if (slug === "app-shell") return <AppShellDemo />;
  if (slug === "dashboard" || slug === "settings" || slug === "list-detail" || slug === "empty") {
    return <DashboardDemo pattern={slug} />;
  }
  return null;
}

function Thumb({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const fit = () => {
      if (frame.clientWidth < 8) return;
      const next = frame.clientWidth / SCENE_WIDTH;
      setScale((current) => (Math.abs(current - next) < 0.005 ? current : next));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={styles.thumb} inert aria-hidden="true">
      <div
        className={styles.scene}
        style={{ width: SCENE_WIDTH, height: SCENE_HEIGHT, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

export function PatternsIndex() {
  return (
    <div className={styles.index}>
      <h1 className={playground.pageTitle}>Patterns</h1>
      <p className={playground.pageLead}>
        Examples of what you can build from kit components. Open a thumbnail to use it, borrow from it, or ignore it.
      </p>
      <div className={styles.grid}>
        {PATTERN_ITEMS.map((item) => (
          <div key={item.slug} className={styles.cardLink}>
            <Card title={item.label} description={BLURB[item.slug]}>
              <Thumb>
                <PatternPreview slug={item.slug} />
              </Thumb>
            </Card>
            <Link href={`/patterns/${item.slug}`} className={styles.cardHit} aria-label={`Open ${item.label}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
