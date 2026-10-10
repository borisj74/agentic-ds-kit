"use client";

import { useState } from "react";
import { SignInPattern, Tabs } from "agentic-ds-kit";
import type { SignInMode } from "agentic-ds-kit";
import styles from "../playground.module.css";

const PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  { id: "microsoft", label: "Continue with Microsoft" },
];

/**
 * Standalone frame for the sign-in pattern. Same playground browser chrome as
 * DashboardDemo, but the pattern fills it alone: no AppHeader, no SideNav.
 */
export function SignInDemo() {
  const [mode, setMode] = useState<SignInMode>("sign-in");
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.signInDemo}>
      <Tabs
        variant="segmented"
        size="sm"
        ariaLabel="Sign-in pattern mode"
        value={mode}
        onChange={(id) => setMode(id as SignInMode)}
        items={[
          { id: "sign-in", label: "Sign in" },
          { id: "sign-up", label: "Sign up" },
        ]}
      />
      <div className={styles.browser}>
        <div className={styles.browserChrome} aria-hidden="true">
          <div className={styles.traffic}>
            <span className={`${styles.trafficDot} ${styles.trafficClose}`} />
            <span className={`${styles.trafficDot} ${styles.trafficMin}`} />
            <span className={`${styles.trafficDot} ${styles.trafficMax}`} />
          </div>
          <div className={styles.urlBar}>{`app.operations.dev/${mode}`}</div>
        </div>
        <div className={styles.browserPage}>
          <SignInPattern
            mode={mode}
            productName="Agentix"
            providers={PROVIDERS}
            loading={loading}
            onSubmit={() => {
              // Demo only: show the loading state, then reset. No network.
              setLoading(true);
              window.setTimeout(() => setLoading(false), 1200);
            }}
            onProvider={() => {}}
            onForgotPassword={() => {}}
            onSwitchMode={setMode}
          />
        </div>
      </div>
    </div>
  );
}
