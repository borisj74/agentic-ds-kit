"use client";

import { useEffect, useId, useRef } from "react";
import { Circle, CircleCheck, CirclePause, CircleX, Layers, LoaderCircle, Minimize2, Network } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type {
  AgentFleetAgent,
  AgentFleetProps,
  AgentFleetStatus,
  AgentFleetSubAgent,
  AgentFleetSubAgentStatus,
} from "./AgentFleet.types";
import styles from "./AgentFleet.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  AgentFleetProps,
  AgentFleetAgent,
  AgentFleetSubAgent,
  AgentFleetStatus,
  AgentFleetSubAgentStatus,
} from "./AgentFleet.types";

const AGENT_LABEL: Record<AgentFleetStatus, string> = {
  idle: "Idle",
  running: "Running",
  waiting: "Needs you",
  done: "Done",
  failed: "Failed",
};

const SUB_LABEL: Record<AgentFleetSubAgentStatus, string> = {
  queued: "Queued",
  running: "Running",
  waiting: "Waiting for you",
  done: "Done",
  failed: "Failed",
};

const LEGEND_ORDER: AgentFleetSubAgentStatus[] = ["done", "failed", "running", "waiting", "queued"];
const LEGEND_WORD: Record<AgentFleetSubAgentStatus, string> = {
  done: "done",
  failed: "failed",
  running: "running",
  waiting: "waiting",
  queued: "queued",
};

const SUB_ICON = {
  queued: Circle,
  running: LoaderCircle,
  waiting: CirclePause,
  done: CircleCheck,
  failed: CircleX,
} as const;

function counts(subAgents: AgentFleetSubAgent[]) {
  const result: Record<AgentFleetSubAgentStatus, number> = { queued: 0, running: 0, waiting: 0, done: 0, failed: 0 };
  for (const sub of subAgents) result[sub.status] += 1;
  return result;
}

function money(value: string): number {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function defaultTotals(agents: AgentFleetAgent[]): string {
  const subs = agents.reduce((sum, agent) => sum + agent.subAgents.length, 0);
  const parts = [`Fleet · ${agents.length} agent${agents.length === 1 ? "" : "s"}`, `${subs} sub-agent${subs === 1 ? "" : "s"}`];
  const waiting = agents.filter((agent) => agent.status === "waiting").length;
  const failed = agents.filter((agent) => agent.status === "failed").length;
  if (agents.every((agent) => agent.status === "idle")) parts.push("all idle");
  if (waiting) parts.push(`${waiting} needs you`);
  if (failed) parts.push(`${failed} failed`);
  const cost = agents.reduce((sum, agent) => sum + money(agent.cost), 0);
  parts.push(`$${cost.toFixed(2)}`);
  return parts.join(" · ");
}

function StatusDot({ status }: { status: AgentFleetStatus }) {
  return (
    <span className={cx(styles.status, styles[`status-${status}`])}>
      <span className={styles.dot} aria-hidden="true" />
      {AGENT_LABEL[status]}
    </span>
  );
}

function Segments({ agent }: { agent: AgentFleetAgent }) {
  return (
    <span className={styles.segments} aria-hidden="true">
      {agent.subAgents.map((sub) => (
        <span key={sub.id} className={styles.segment}>
          <span className={cx(styles.fill, styles[`fill-${agent.status === "idle" ? "idle" : sub.status}`])} />
        </span>
      ))}
    </span>
  );
}

function Legend({ agent }: { agent: AgentFleetAgent }) {
  if (agent.status === "idle") return null;
  const tally = counts(agent.subAgents);
  return (
    <ul className={styles.legend}>
      {LEGEND_ORDER.filter((key) => tally[key] > 0).map((key) => (
        <li key={key} className={styles.legendItem}>
          <span className={cx(styles.dot, styles[`dot-${key}`])} aria-hidden="true" />
          {tally[key]} {LEGEND_WORD[key]}
        </li>
      ))}
    </ul>
  );
}

function Lead({ large }: { large?: boolean }) {
  return (
    <span className={cx(styles.lead, large && styles.leadLarge)} aria-hidden="true">
      <Network size={16} strokeWidth={ICON_STROKE} />
    </span>
  );
}

function OverviewCard({
  agent,
  onOpen,
  onReview,
}: {
  agent: AgentFleetAgent;
  onOpen?: () => void;
  onReview?: (subAgentId: string) => void;
}) {
  const nameId = useId();
  const waitingSub = agent.status === "waiting" ? agent.subAgents.find((sub) => sub.status === "waiting") : undefined;
  return (
    <article className={cx(styles.card, onOpen && styles.interactive)} aria-labelledby={nameId}>
      <header className={styles.cardHeader}>
        <Lead />
        <h3 id={nameId} className={styles.name}>
          {onOpen ? (
            <button type="button" className={styles.open} aria-expanded="false" data-fleet-open={agent.id} onClick={onOpen}>
              {agent.name}
            </button>
          ) : (
            agent.name
          )}
        </h3>
        <StatusDot status={agent.status} />
      </header>
      <p className={styles.count}>
        <span className={styles.countValue}>{agent.subAgents.length}</span>
        <span className={styles.countLabel}>sub-agents</span>
      </p>
      <div className={styles.progress}>
        <Segments agent={agent} />
        <Legend agent={agent} />
      </div>
      {waitingSub ? (
        <div className={styles.attention}>
          <CirclePause size={16} strokeWidth={ICON_STROKE} className={styles.attentionIcon} aria-hidden="true" />
          <span className={styles.attentionText}>{waitingSub.name} waits for your OK</span>
          {onReview ? (
            <Button
              size="sm"
              appearance="ghost"
              mode="neutral"
              className={styles.raise}
              onClick={() => onReview(waitingSub.id)}
              aria-label={`Review ${waitingSub.name}`}
            >
              Review
            </Button>
          ) : null}
        </div>
      ) : null}
      <footer className={styles.cardFooter}>
        <span className={styles.cost}>{agent.cost}</span>
        <span className={styles.elapsed}>{agent.status === "idle" ? "—" : (agent.elapsed ?? "")}</span>
      </footer>
    </article>
  );
}

function CompactCard({ agent, onOpen }: { agent: AgentFleetAgent; onOpen?: () => void }) {
  const nameId = useId();
  return (
    <article className={cx(styles.compact, onOpen && styles.interactive)} aria-labelledby={nameId}>
      <header className={styles.cardHeader}>
        <Lead />
        <h3 id={nameId} className={cx(styles.name, styles.nameSmall)}>
          {onOpen ? (
            <button type="button" className={styles.open} aria-expanded="false" data-fleet-open={agent.id} onClick={onOpen}>
              {agent.name}
            </button>
          ) : (
            agent.name
          )}
        </h3>
        <span className={cx(styles.dot, styles[`dot-agent-${agent.status}`])} />
        <span className={styles.srOnly}>{AGENT_LABEL[agent.status]}</span>
      </header>
      <Segments agent={agent} />
      <footer className={styles.compactFooter}>
        <span>
          {agent.subAgents.length} sub-agents · {AGENT_LABEL[agent.status].toLowerCase()}
        </span>
        <span className={styles.cost}>{agent.cost}</span>
      </footer>
    </article>
  );
}

function ExpandedCard({
  agent,
  onClose,
  onReview,
}: {
  agent: AgentFleetAgent;
  onClose?: () => void;
  onReview?: (subAgentId: string) => void;
}) {
  const nameId = useId();
  const tally = counts(agent.subAgents);
  const stats = [
    { label: "Cost", value: agent.cost },
    { label: "Time", value: agent.elapsed ?? "—" },
    { label: "Done", value: `${tally.done} of ${agent.subAgents.length}` },
    { label: "Waiting", value: String(tally.waiting) },
  ];
  return (
    <article className={styles.expanded} aria-labelledby={nameId}>
      <header className={styles.cardHeader}>
        <Lead large />
        <div className={styles.expandedHeading}>
          <h3 id={nameId} className={cx(styles.name, styles.nameLarge)}>
            {agent.name}
          </h3>
          {agent.meta ? <p className={styles.meta}>{agent.meta}</p> : null}
        </div>
        <StatusDot status={agent.status} />
        {onClose ? (
          <button
            type="button"
            className={styles.close}
            aria-expanded="true"
            data-fleet-close=""
            aria-label={`Collapse ${agent.name}`}
            onClick={onClose}
          >
            <Minimize2 size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </button>
        ) : null}
      </header>
      <dl className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <dt className={styles.statLabel}>{stat.label}</dt>
            <dd className={styles.statValue}>{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.progress}>
        <Segments agent={agent} />
        <Legend agent={agent} />
      </div>
      <div className={styles.tree}>
        <div className={styles.treeHead}>
          <span>Sub-agents</span>
          <span className={styles.treeTotal}>Σ {agent.cost}</span>
        </div>
        <ul className={styles.treeList}>
          {agent.subAgents.map((sub, index) => {
            const Icon = SUB_ICON[sub.status];
            return (
              <li
                key={sub.id}
                className={cx(styles.treeRow, styles[`sub-${sub.status}`])}
                style={{ animationDelay: `calc(${index} * var(--fleet-stagger))` }}
              >
                <span className={styles.branch} aria-hidden="true" />
                <Icon size={16} strokeWidth={ICON_STROKE} className={styles.subIcon} aria-hidden="true" />
                <span className={styles.subName}>{sub.name}</span>
                {sub.status === "waiting" && onReview ? (
                  <Button size="sm" appearance="outline" mode="neutral" onClick={() => onReview(sub.id)} aria-label={`Review ${sub.name}`}>
                    Review
                  </Button>
                ) : null}
                <span className={styles.subStatus}>{SUB_LABEL[sub.status]}</span>
                <span className={styles.subElapsed}>{sub.elapsed ?? ""}</span>
                <span className={styles.subCost}>{sub.cost ?? ""}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

/** Several agents side by side. Each card sums up its sub-agents; one card can open into its sub-agent tree. */
export function AgentFleet({
  agents,
  expandedId,
  onExpandedChange,
  onReview,
  totals,
  loading = false,
  onStart,
  ariaLabel = "Agent fleet",
  className,
  ref,
  ...rest
}: AgentFleetProps) {
  const expanded = expandedId ? agents.find((agent) => agent.id === expandedId) : undefined;
  const rootRef = useRef<HTMLElement | null>(null);
  const previous = useRef(expandedId ?? null);

  // Keep focus with the person: into the opened card, back to its card when it closes. Not on first render.
  useEffect(() => {
    const before = previous.current;
    const now = expandedId ?? null;
    previous.current = now;
    if (before === now) return;
    const root = rootRef.current;
    if (!root) return;
    if (now) root.querySelector<HTMLElement>("[data-fleet-close]")?.focus();
    else if (before) root.querySelector<HTMLElement>(`[data-fleet-open="${CSS.escape(before)}"]`)?.focus();
  }, [expandedId]);
  const line = totals ?? (agents.length > 0 ? defaultTotals(agents) : "");

  let body;
  if (loading) {
    body = (
      <div className={styles.overview} aria-busy="true">
        {[0, 1, 2].map((key) => (
          <div key={key} className={cx(styles.card, styles.skeletonCard)}>
            <div className={styles.cardHeader}>
              <Skeleton shape="circle" size="md" />
              <Skeleton width="55%" />
            </div>
            <Skeleton shape="rect" width="30%" height="var(--space-6)" />
            <Skeleton width="100%" size="sm" />
          </div>
        ))}
        <span className={styles.srOnly} role="status">
          Loading agents
        </span>
      </div>
    );
  } else if (agents.length === 0) {
    body = (
      <Empty
        outlined
        icon="Network"
        title="No agents in this fleet"
        description="Start an agent or connect an orchestrator. Its sub-agents roll up here."
        actions={
          onStart ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="Plus" onClick={onStart}>
              Start an agent
            </Button>
          ) : undefined
        }
      />
    );
  } else if (expanded) {
    body = (
      <div className={styles.focus}>
        <div className={styles.column}>
          {agents
            .filter((agent) => agent.id !== expanded.id)
            .map((agent) => (
              <CompactCard
                key={agent.id}
                agent={agent}
                onOpen={onExpandedChange ? () => onExpandedChange(agent.id) : undefined}
              />
            ))}
        </div>
        <ExpandedCard
          key={expanded.id}
          agent={expanded}
          onClose={onExpandedChange ? () => onExpandedChange(null) : undefined}
          onReview={onReview ? (subId) => onReview(expanded.id, subId) : undefined}
        />
      </div>
    );
  } else {
    body = (
      <div className={styles.overview}>
        {agents.map((agent) => (
          <OverviewCard
            key={agent.id}
            agent={agent}
            onOpen={onExpandedChange ? () => onExpandedChange(agent.id) : undefined}
            onReview={onReview ? (subId) => onReview(agent.id, subId) : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <section {...rest} {...nisthaAttr("agentfleet", rest)} ref={mergeRefs(rootRef, ref)} className={cx(styles.fleet, className)} aria-label={ariaLabel}>
      {body}
      {line && !loading && agents.length > 0 ? (
        <p className={styles.totals}>
          <Layers size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
          {line}
        </p>
      ) : null}
    </section>
  );
}
