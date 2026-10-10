"use client";

import { useEffect, useState } from "react";
import { DashboardDemo } from "../_components/DashboardDemo";
import { SignInDemo } from "../_components/SignInDemo";
import styles from "./patterns.module.css";
import playground from "../playground.module.css";

/** Patterns that render as a whole page, outside the DashboardDemo app shell. */
const STANDALONE = new Set(["sign-in"]);

function readStandalone() {
  const hash = window.location.hash.replace(/^#/, "");
  return STANDALONE.has(hash) ? hash : null;
}

export default function PatternsPage() {
  const [standalone, setStandalone] = useState<string | null>(null);

  useEffect(() => {
    const apply = () => setStandalone(readStandalone());
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  return (
    <div className={playground.page}>
      <div className={playground.opsShell}>
        <h1 className={playground.pageTitle}>Patterns</h1>
        <p className={playground.pageLead}>
          Code is the contract. Agents install the kit, then compose these screens instead of
          inventing layouts.
        </p>

        <div className={styles.anchor}>
          <div id="dashboard" />
          <div id="activity" />
          <div id="inbox" />
          <div id="settings" />
          <div id="list-detail" />
          <div id="invite" />
          <div id="insights" />
          <div id="empty" />
          <div id="sign-in" />
          {standalone === "sign-in" ? <SignInDemo /> : <DashboardDemo />}
        </div>
      </div>
    </div>
  );
}
