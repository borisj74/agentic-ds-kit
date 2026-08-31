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

        <div id="dashboard" className={styles.anchor}>
          <DashboardDemo />
        </div>
      </div>
    </div>
  );
}
