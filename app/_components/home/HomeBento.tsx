"use client";

import { AgentFleet, AgentPlan, ContextWindow, MemoryPanel, PermissionRequest, Tabs, TraceWaterfall } from "agentic-ds-kit";
import { contextSegments } from "@/lib/agent-demo.sample";
import { galleryGroups, GALLERY_ITEMS } from "@/lib/component-gallery";
import {
  HOME_FLEET,
  HOME_MEMORIES,
  HOME_PERMISSION_DESCRIPTION,
  HOME_PERMISSION_SCOPES,
  HOME_PERMISSION_WARNING,
  HOME_TRACE,
} from "@/lib/home.sample";
import { GalleryPreview } from "../../components/GalleryPreview";
import { PreviewScope } from "../ThemeScope";
import styles from "./Home.module.css";

/** The groups the bento offers, in order. */
const SHOWN = ["AI", "SaaS", "Forms", "Data display", "Navigation", "Feedback", "Overlays"];

/** How many parts each non-AI tab shows. */
const PER_TAB = 4;

const noop = () => {};

const PLAN_STEPS = [
  { id: "1", label: "Read the invoice module" },
  { id: "2", label: "Find where totals round" },
  { id: "3", label: "Switch to half-even rounding" },
  { id: "4", label: "Add tests for 0.005 cases" },
];

/** The AI tab: the parts the design shows, full size, with example data. */
function AiBento() {
  return (
    <div className={styles.bento}>
      <div className={`layout-split--primary ${styles.bentoRow}`}>
        <div className={styles.tile}>
          <PermissionRequest
            description={HOME_PERMISSION_DESCRIPTION}
            scopes={HOME_PERMISSION_SCOPES}
            warning={HOME_PERMISSION_WARNING}
            requestedAt="requested 14:02"
            onGrant={noop}
            onDeny={noop}
          />
        </div>
        <div className={styles.tile}>
          <MemoryPanel items={HOME_MEMORIES} onQueryChange={noop} onAdd={noop} onEdit={noop} onPin={noop} onDelete={noop} />
        </div>
      </div>
      <div className={`layout-split--secondary ${styles.bentoRow}`}>
        <div className={styles.tile}>
          <ContextWindow used={171_000} limit={200_000} segments={contextSegments(10_200, 16_100, 35_200, 96_400, 13_200)} onTrim={noop} />
        </div>
        <div className={styles.tile}>
          <AgentFleet totals="" agents={HOME_FLEET} expandedId="billing" onReview={noop} />
        </div>
      </div>
      <div className={`layout-split ${styles.bentoRow}`}>
        <div className={styles.tile}>
          <AgentPlan title="Fix invoice rounding" status="draft" steps={PLAN_STEPS} summary="4 steps · example data" editable={false} onAccept={noop} />
        </div>
        <div className={styles.tile}>
          <TraceWaterfall title="Run trace" spans={HOME_TRACE} />
        </div>
      </div>
    </div>
  );
}

/** Any other tab: the group's first few parts, as the component gallery shows them. */
function GroupBento({ group }: { group: string }) {
  const items = GALLERY_ITEMS.filter((item) => item.group === group).slice(0, PER_TAB);
  return (
    <div className={`layout-split ${styles.bentoGrid}`}>
      {items.map((item) => (
        <figure key={item.id} className={styles.tile}>
          <GalleryPreview id={item.id} />
          <figcaption className={styles.tileCaption}>{item.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Component categories as segmented tabs, each showing real kit parts with example data. */
export function HomeBento() {
  const counts = new Map(galleryGroups().map((group) => [group.id, group.count]));
  const items = SHOWN.map((group) => ({
    id: group,
    label: `${group} · ${counts.get(group) ?? 0}`,
    content: group === "AI" ? <AiBento /> : <GroupBento group={group} />,
  }));

  return (
    <PreviewScope className={styles.bentoScope}>
      <Tabs className={styles.tabs} variant="segmented" ariaLabel="Component categories" defaultValue="AI" items={items} />
    </PreviewScope>
  );
}
