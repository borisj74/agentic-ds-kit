"use client";

import { AgentFleet, ContextWindow, MemoryPanel, PermissionRequest, Tabs } from "agentic-ds-kit";
import { contextSegments } from "@/lib/agent-demo.sample";
import { galleryGroups, GALLERY_ITEMS } from "@/lib/component-gallery";
import {
  HOME_FLEET,
  HOME_MEMORIES,
  HOME_PERMISSION_DESCRIPTION,
  HOME_PERMISSION_SCOPES,
  HOME_PERMISSION_WARNING,
} from "@/lib/home.sample";
import { GalleryPreview } from "../../components/GalleryPreview";
import { PreviewScope } from "../ThemeScope";
import styles from "./Home.module.css";

/** The groups the bento offers, in order. */
const SHOWN = ["AI", "SaaS", "Forms", "Data display", "Navigation", "Feedback", "Overlays"];

/** How many parts each non-AI tab shows. */
const PER_TAB = 4;

const noop = () => {};

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
        {/* Narrow enough for AgentFleet's one-column layout: with one agent its list column is empty. */}
        <div className={`${styles.tile} ${styles.tileCentered}`}>
          <AgentFleet totals="" agents={HOME_FLEET} expandedId="billing" onReview={noop} />
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
