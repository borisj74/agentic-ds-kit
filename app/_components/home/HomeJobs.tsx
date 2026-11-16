"use client";

import type { ComponentType } from "react";
import { Tabs } from "agentic-ds-kit";
import { FailureClustersDemo } from "../blocks/FailureClustersDemo";
import { LiveSessionDemo } from "../blocks/LiveSessionDemo";
import { PlanReviewDemo } from "../blocks/PlanReviewDemo";
import { RunDetailDemo } from "../blocks/RunDetailDemo";
import { PreviewScope } from "../ThemeScope";
import styles from "./Home.module.css";

/** One job per tab, each shown as one whole scene: a kit block with the docs' example data. */
const JOBS: { id: string; label: string; block: string; note: string; Scene: ComponentType }[] = [
  {
    id: "approve",
    label: "Approve",
    block: "PlanReview",
    note: "Read the plan, see what it will change, choose how far the agent may go.",
    Scene: PlanReviewDemo,
  },
  {
    id: "monitor",
    label: "Monitor",
    block: "RunDetail",
    note: "Follow one run: clock, cost, each step and the approval it is waiting on.",
    Scene: RunDetailDemo,
  },
  {
    id: "debug",
    label: "Debug",
    block: "FailureClusters",
    note: "Failed runs grouped by likely cause, so you fix the reason once.",
    Scene: FailureClustersDemo,
  },
  {
    id: "chat",
    label: "Chat",
    block: "LiveSession",
    note: "The conversation beside the agents working on it.",
    Scene: LiveSessionDemo,
  },
];

/**
 * Components grouped by the job they do. Each tab is one composed scene, not a grid of parts.
 * The scenes are inert here: they play their own data but open nothing on the landing page.
 */
export function HomeJobs() {
  const items = JOBS.map(({ id, label, block, note, Scene }) => ({
    id,
    label,
    content: (
      <figure className={styles.scene}>
        <figcaption className={styles.sceneCaption}>
          <code className={styles.sceneName}>{block}</code>
          <span>{note}</span>
        </figcaption>
        <PreviewScope className={styles.sceneStage}>
          <div inert>
            <Scene />
          </div>
        </PreviewScope>
      </figure>
    ),
  }));

  return <Tabs className={styles.tabs} variant="line" ariaLabel="Jobs" defaultValue="approve" items={items} />;
}
