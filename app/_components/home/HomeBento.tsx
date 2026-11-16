"use client";

import { useEffect, useRef, useState } from "react";
import {
  AgentFleet,
  Button,
  ContextWindow,
  MemoryPanel,
  PermissionRequest,
  Tabs,
  type AgentFleetAgent,
  type MemoryItem,
  type PermissionRequestStatus,
} from "agentic-ds-kit";
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


/** Grant or deny, with the in-flight state in between; once resolved, it can be asked again. */
function PermissionTile() {
  const [status, setStatus] = useState<PermissionRequestStatus>("pending");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function grant() {
    setStatus("granting");
    timer.current = window.setTimeout(() => setStatus("granted"), 900);
  }

  const resolved = status === "granted" || status === "denied";
  return (
    <div className={styles.tileStack}>
      <PermissionRequest
        description={HOME_PERMISSION_DESCRIPTION}
        scopes={HOME_PERMISSION_SCOPES}
        warning={HOME_PERMISSION_WARNING}
        requestedAt="requested 14:02"
        status={status}
        resolvedNote={status === "granted" ? "until revoked" : undefined}
        onGrant={grant}
        onDeny={() => setStatus("denied")}
      />
      {resolved ? (
        <Button size="sm" appearance="ghost" mode="neutral" iconStart="RotateCcw" onClick={() => setStatus("pending")}>
          Ask again
        </Button>
      ) : null}
    </div>
  );
}

/** Search, add, edit, pin and forget, as in the MemoryPanel docs. */
function MemoryTile() {
  const [items, setItems] = useState<MemoryItem[]>(HOME_MEMORIES);
  const [query, setQuery] = useState("");
  return (
    <MemoryPanel
      items={items}
      query={query}
      onQueryChange={setQuery}
      onAdd={(content) => setItems((list) => [{ id: String(Date.now()), content, source: "from you", age: "now" }, ...list])}
      onEdit={(id, content) => setItems((list) => list.map((item) => (item.id === id ? { ...item, content } : item)))}
      onPin={(id, pinned) => setItems((list) => list.map((item) => (item.id === id ? { ...item, pinned } : item)))}
      onDelete={(id) => setItems((list) => list.filter((item) => item.id !== id))}
    />
  );
}

/** Trim oldest drops older messages, so the window falls back under the warning line. */
function ContextTile() {
  const [messages, setMessages] = useState(96_400);
  const used = 10_200 + 16_100 + 35_200 + messages + 13_200;
  return (
    <ContextWindow
      used={used}
      limit={200_000}
      segments={contextSegments(10_200, 16_100, 35_200, messages, 13_200)}
      onTrim={() => setMessages((value) => Math.max(24_000, value - 40_000))}
    />
  );
}

/** Open or close the orchestrator; Review on the waiting sub-agent sets it running. */
function FleetTile() {
  const [agents, setAgents] = useState<AgentFleetAgent[]>(HOME_FLEET);
  const [expandedId, setExpandedId] = useState<string | null>("billing");
  return (
    <AgentFleet
      totals=""
      agents={agents}
      expandedId={expandedId}
      onExpandedChange={setExpandedId}
      onReview={(agentId, subId) =>
        setAgents((list) =>
          list.map((agent) =>
            agent.id === agentId
              ? { ...agent, subAgents: agent.subAgents.map((sub) => (sub.id === subId ? { ...sub, status: "running" as const } : sub)) }
              : agent,
          ),
        )
      }
    />
  );
}

/** The AI tab: the parts the design shows, full size, with example data. Every one works. */
function AiBento() {
  return (
    <div className={styles.bento}>
      <div className={`layout-split--primary ${styles.bentoRow}`}>
        <div className={styles.tile}>
          <PermissionTile />
        </div>
        <div className={styles.tile}>
          <MemoryTile />
        </div>
      </div>
      <div className={`layout-split--secondary ${styles.bentoRow}`}>
        <div className={styles.tile}>
          <ContextTile />
        </div>
        {/* Narrow enough for AgentFleet's one-column layout: with one agent its list column is empty. */}
        <div className={`${styles.tile} ${styles.tileCentered}`}>
          <FleetTile />
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
