"use client";

import { useState } from "react";
import { Avatar, Badge, Card, Scorecard, SegmentedControl, Tabs } from "agentic-ds-kit";
import { presetState } from "@/lib/theme-playground";
import { ThemeScope } from "../ThemeScope";
import styles from "./Home.module.css";

type SetId = "ink" | "blue" | "teal" | "violet";

const SETS: { value: SetId; label: string }[] = [
  { value: "ink", label: "Ink" },
  { value: "blue", label: "Blue" },
  { value: "teal", label: "Teal" },
  { value: "violet", label: "Violet" },
];

/** The same small fleet screen in every card: kit parts only, so the theme does all the work. */
function FleetScreen() {
  return (
    <div className={styles.fleet}>
      <div className={styles.fleetBar}>
        <Avatar name="Fleetwise" size="sm" />
        <span className={styles.fleetName}>Fleetwise</span>
        <Tabs size="sm" ariaLabel="Fleetwise sections" defaultValue="live" items={[{ id: "live", label: "Live" }, { id: "schedule", label: "Schedule" }, { id: "reports", label: "Reports" }]} />
      </div>
      <div className={styles.fleetBody}>
        <div>
          <p className={styles.fleetTitle}>Live operations</p>
          <p className={styles.fleetMeta}>40 vans · updated 10:42 AM</p>
        </div>
        <div className={styles.fleetScores}>
          <Scorecard size="sm" label="On time" value="34" />
          <Scorecard size="sm" label="Delayed" value="4" badge="late" badgeTone="warning" />
        </div>
        <Card size="sm" title="Stops completed">
          <Badge size="sm" tone="neutral">196 today</Badge>
        </Card>
      </div>
    </div>
  );
}

/** One screen in light, in dark, and in the colour set the reader picks. */
export function HomeThemes() {
  const [set, setSet] = useState<SetId>("teal");

  return (
    <div className={`layout-split--thirds ${styles.themes}`}>
      <figure className={styles.themeCard}>
        <ThemeScope theme={presetState("nistha", "light")} className={styles.themeStage}>
          <FleetScreen />
        </ThemeScope>
        <figcaption className={styles.themeCaption}>
          <span className={styles.themeName}>Light by default</span>
          <span className={styles.themeNote}>Every token has a light value. Nothing to set up.</span>
        </figcaption>
      </figure>
      <figure className={styles.themeCard}>
        <ThemeScope theme={presetState("nistha", "dark")} className={styles.themeStage}>
          <FleetScreen />
        </ThemeScope>
        <figcaption className={styles.themeCaption}>
          <span className={styles.themeName}>Dark with one attribute</span>
          <span className={styles.themeNote}>
            Add <code className={styles.inlineCode}>data-theme=&quot;dark&quot;</code> and every part follows.
          </span>
        </figcaption>
      </figure>
      <figure className={styles.themeCard}>
        <ThemeScope theme={presetState(set, "light")} className={styles.themeStage}>
          <FleetScreen />
        </ThemeScope>
        <figcaption className={styles.themeCaption}>
          <span className={styles.themeName}>Four colour sets</span>
          <span className={styles.themeNote}>Ink, blue, teal or violet swap the brand and action colours together.</span>
          <SegmentedControl
            size="sm"
            ariaLabel="Colour set"
            items={SETS}
            value={set}
            onChange={(value) => setSet(value as SetId)}
          />
        </figcaption>
      </figure>
    </div>
  );
}
