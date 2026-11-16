"use client";

import {
  AgentFleet,
  ContextWindow,
  MemoryPanel,
  PermissionRequest,
  Tabs,
  type AgentFleetAgent,
  type AgentFleetSubAgentStatus,
  type MemoryItem,
  type PermissionRequestStatus,
} from "agentic-ds-kit";
import { contextSegments } from "@/lib/agent-demo.sample";
import { galleryGroups } from "@/lib/component-gallery";
import {
  HOME_FLEET,
  HOME_MEMORIES,
  HOME_PERMISSION_DESCRIPTION,
  HOME_PERMISSION_SCOPES,
  HOME_PERMISSION_WARNING,
} from "@/lib/home.sample";
import { PreviewScope } from "../ThemeScope";
import { CATEGORY_BENTOS } from "./HomeCategoryBentos";
import { useDemoLoop } from "./useDemoLoop";
import styles from "./Home.module.css";

/** The groups the bento offers, in order. */
const SHOWN = ["AI", "SaaS", "Forms", "Data display", "Navigation", "Feedback", "Overlays"];



/** Plays the request: it waits, Grant goes in flight, it is granted, then it asks again. */
const PERMISSION_FRAMES: PermissionRequestStatus[] = ["pending", "pending", "pending", "granting", "granted", "granted"];

function PermissionTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(1300);
  const status = PERMISSION_FRAMES[tick % PERMISSION_FRAMES.length];
  return (
    // inert: a self-playing demo, so its buttons do not take clicks or focus.
    <div ref={ref} inert>
      <PermissionRequest
        description={HOME_PERMISSION_DESCRIPTION}
        scopes={HOME_PERMISSION_SCOPES}
        warning={HOME_PERMISSION_WARNING}
        requestedAt="requested 14:02"
        status={status}
        resolvedNote={status === "granted" ? "until revoked" : undefined}
        onGrant={() => {}}
        onDeny={() => {}}
      />
    </div>
  );
}

/** "Used here" moves from memory to memory as the agent works; no edit or delete dialogs. */
function MemoryTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(2200);
  const used = tick === 0 ? null : (tick - 1) % HOME_MEMORIES.length;
  const items: MemoryItem[] = HOME_MEMORIES.map((item, index) => ({
    ...item,
    usedHere: used === null ? item.usedHere : index === used,
  }));
  return (
    <div ref={ref} inert>
      <MemoryPanel items={items} />
    </div>
  );
}

/** Messages pile up until the window nears its limit, then the oldest are trimmed and it starts again. */
const BASE_TOKENS = 10_200 + 16_100 + 35_200 + 13_200;

function ContextTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(1400);
  const messages = tick === 0 ? 96_400 : 56_400 + ((tick - 1) % 12) * 4_200;
  return (
    <div ref={ref} inert>
      <ContextWindow
        used={BASE_TOKENS + messages}
        limit={200_000}
        segments={contextSegments(10_200, 16_100, 35_200, messages, 13_200)}
        onTrim={() => {}}
      />
    </div>
  );
}

/** The orchestrator's sub-agents move on: tests finish, the waiting migration runs, then it is done. */
const FLEET_FRAMES: AgentFleetSubAgentStatus[][] = [
  ["done", "done", "running", "waiting"],
  ["done", "done", "done", "waiting"],
  ["done", "done", "done", "running"],
  ["done", "done", "done", "done"],
];

function FleetTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(2400);
  const frame = FLEET_FRAMES[tick % FLEET_FRAMES.length];
  const agents: AgentFleetAgent[] = HOME_FLEET.map((agent) => ({
    ...agent,
    status: frame.every((status) => status === "done") ? "done" : "running",
    subAgents: agent.subAgents.map((sub, index) => ({ ...sub, status: frame[index] })),
  }));
  return (
    <div ref={ref} inert>
      <AgentFleet totals="" agents={agents} expandedId="billing" />
    </div>
  );
}

/** The AI tab: the parts the design shows, full size, with example data, each playing by itself. */
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

/** Component categories as segmented tabs, each showing real kit parts with example data. */
export function HomeBento() {
  const counts = new Map(galleryGroups().map((group) => [group.id, group.count]));
  const items = SHOWN.map((group) => {
    // Rendered as components (not called), so each tab keeps its own hooks.
    const Category = group === "AI" ? AiBento : (CATEGORY_BENTOS[group] ?? AiBento);
    return { id: group, label: `${group} · ${counts.get(group) ?? 0}`, content: <Category /> };
  });

  return (
    <PreviewScope className={styles.bentoScope}>
      <Tabs className={styles.tabs} variant="line" ariaLabel="Component categories" defaultValue="AI" items={items} />
    </PreviewScope>
  );
}
