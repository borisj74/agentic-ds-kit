"use client";

import { useState } from "react";
import { SignInPattern, type SignInMode } from "../../packages/kit/patterns/SignInPattern";
import styles from "../playground.module.css";

const PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  { id: "microsoft", label: "Continue with Microsoft" },
];

/** The sign-in pattern as a full screen: no AppHeader, no SideNav. `view` is sign-in or sign-up. */
export function SignInScreen({ view }: { view?: string }) {
  const [mode, setMode] = useState<SignInMode>(view === "sign-up" ? "sign-up" : "sign-in");
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.screenPage}>
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
  );
}
