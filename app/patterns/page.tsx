"use client";

import { DashboardPattern } from "@/ui/patterns/DashboardPattern";
import { Section } from "@/ui/Section";
import styles from "./patterns.module.css";
import playground from "../playground.module.css";

export default function PatternsPage() {
  return (
    <div className={playground.page}>
      <div className={playground.wideShell}>
        <h1 className={playground.pageTitle}>Patterns</h1>
        <p className={playground.pageLead}>
          Blueprint compositions that only import kit components. Use these before inventing layouts.
        </p>

        <div id="dashboard" className={styles.anchor}>
          <Section
            title="dashboard"
            description="PageHeader + LineChart + Section + DataTable + Buttons"
            collapsible={false}
          >
            <div className={styles.preview}>
              <DashboardPattern />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
