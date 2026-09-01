"use client";

import { DashboardDemo } from "../_components/DashboardDemo";
import styles from "./patterns.module.css";
import playground from "../playground.module.css";

export default function PatternsPage() {
  return (
    <div className={playground.page}>
      <div className={playground.opsShell}>
        <h1 className={playground.pageTitle}>Patterns</h1>
        <p className={playground.pageLead}>
          Blueprint compositions that only import kit components. Use these before inventing layouts.
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
          <DashboardDemo />
        </div>
      </div>
    </div>
  );
}
