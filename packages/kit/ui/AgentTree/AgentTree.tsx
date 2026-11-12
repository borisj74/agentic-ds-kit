"use client";

import { useId } from "react";
import { ChevronDown, ChevronRight, Circle, CircleCheck, CirclePause, CircleX, LoaderCircle, Network } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Empty } from "../Empty";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import type { AgentTreeNode, AgentTreeProps, AgentTreeStatus } from "./AgentTree.types";
import styles from "./AgentTree.module.css";

export type { AgentTreeProps, AgentTreeNode, AgentTreeStatus } from "./AgentTree.types";

const STATUS_TEXT: Record<AgentTreeStatus, string> = {
  queued: "Queued",
  running: "Running",
  waiting: "Waiting for you",
  done: "Done",
  failed: "Failed",
};

const STATUS_ICON = {
  queued: Circle,
  running: LoaderCircle,
  waiting: CirclePause,
  done: CircleCheck,
  failed: CircleX,
} as const;

function costOf(node: AgentTreeNode): number {
  if (node.cost !== undefined) return node.cost;
  return (node.children ?? []).reduce((sum, child) => sum + costOf(child), 0);
}

function count(node: AgentTreeNode): number {
  return (node.children ?? []).reduce((sum, child) => sum + 1 + count(child), 0);
}

function allDone(node: AgentTreeNode): boolean {
  return node.status === "done" && (node.children ?? []).every(allDone);
}

interface RowContext {
  folded: Set<string>;
  toggle?: (id: string) => void;
  onApprove?: (id: string) => void;
  onRetry?: (id: string) => void;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  currency: string;
}

function Row({ node, depth, ctx, root }: { node: AgentTreeNode; depth: number; ctx: RowContext; root?: boolean }) {
  const groupId = useId();
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isFolded = ctx.folded.has(node.id);
  const Icon = root ? Network : STATUS_ICON[node.status];
  const rolled = hasChildren && node.cost === undefined;
  const cost = costOf(node);
  const Chevron = isFolded ? ChevronRight : ChevronDown;

  return (
    <li className={styles.item} style={{ ["--tree-depth" as string]: depth }}>
      <div
        className={cx(
          styles.row,
          styles[node.status],
          hasChildren && styles.branch,
          root && styles.root,
          ctx.selectedId === node.id && styles.selected,
          (node.status === "waiting" || node.status === "failed") && !hasChildren && styles.flagged,
        )}
      >
        <div className={styles.main}>
          <span className={styles.toggleSlot}>
            {hasChildren && !root && ctx.toggle ? (
              <button
                type="button"
                className={styles.toggle}
                aria-expanded={!isFolded}
                aria-controls={groupId}
                aria-label={`${isFolded ? "Show" : "Hide"} ${node.name}`}
                onClick={() => ctx.toggle?.(node.id)}
              >
                <Chevron size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
              </button>
            ) : null}
          </span>
          <Icon size={16} strokeWidth={ICON_STROKE} className={styles.icon} aria-hidden="true" />
          {ctx.onSelect ? (
            <button
              type="button"
              className={cx(styles.name, styles.select)}
              aria-pressed={ctx.selectedId === node.id}
              aria-label={`${node.name}, ${STATUS_TEXT[node.status]}`}
              onClick={() => ctx.onSelect?.(node.id)}
            >
              {node.name}
            </button>
          ) : (
            <span className={styles.name}>{node.name}</span>
          )}
          {hasChildren && isFolded ? <span className={styles.foldedCount}>{count(node)} agents</span> : null}
        </div>
        <span className={styles.status}>{STATUS_TEXT[node.status]}</span>
        <span className={styles.time}>{node.elapsed ?? ""}</span>
        <span className={styles.cost}>
          {rolled ? <span aria-label="total">Σ </span> : null}
          {ctx.currency}
          {cost.toFixed(2)}
        </span>
        {!hasChildren && (node.note || (node.status === "waiting" && ctx.onApprove) || (node.status === "failed" && ctx.onRetry)) ? (
          <div className={styles.noteRow}>
            <span className={styles.note}>{node.note}</span>
            {node.status === "waiting" && ctx.onApprove ? (
              <Button size="sm" appearance="soft" mode="neutral" shortcut="⏎" onClick={() => ctx.onApprove?.(node.id)} aria-label={`Approve ${node.name}`}>
                Approve
              </Button>
            ) : null}
            {node.status === "failed" && ctx.onRetry ? (
              <Button size="sm" appearance="ghost" mode="danger" iconStart="RotateCcw" onClick={() => ctx.onRetry?.(node.id)} aria-label={`Retry ${node.name}`}>
                Retry
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      {hasChildren && !isFolded ? (
        <ul id={groupId} className={styles.group}>
          {node.children?.map((child) => (
            <Row key={child.id} node={child} depth={depth + 1} ctx={ctx} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** An orchestrator and its sub-agents. Every node shows status, time and cost; branch costs roll up. */
export function AgentTree({
  root,
  label = "Orchestrator",
  folded = [],
  onFoldedChange,
  onApprove,
  onRetry,
  selectedId,
  onSelect,
  currency = "$",
  loading = false,
  className,
  ref,
  ...rest
}: AgentTreeProps) {
  const labelId = useId();
  const foldedSet = new Set(folded);
  const ctx: RowContext = {
    folded: foldedSet,
    toggle: onFoldedChange
      ? (id) => onFoldedChange(foldedSet.has(id) ? folded.filter((item) => item !== id) : [...folded, id])
      : undefined,
    onApprove,
    onRetry,
    selectedId,
    onSelect,
    currency,
  };

  return (
    <section {...rest} ref={ref} className={cx(styles.tree, className)} aria-labelledby={labelId} aria-busy={loading || undefined}>
      <header className={styles.head}>
        <span id={labelId} className={styles.label}>
          {label}
        </span>
        {root && allDone(root) ? (
          <Badge tone="success" size="sm">
            All complete
          </Badge>
        ) : root ? (
          <span className={styles.columns} aria-hidden="true">
            <span>status</span>
            <span className={styles.end}>time</span>
            <span className={styles.end}>cost</span>
          </span>
        ) : null}
      </header>
      {loading ? (
        <div className={styles.loading}>
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className={styles.skeletonRow} style={{ ["--tree-depth" as string]: row === 0 || row === 4 ? 0 : 1 }}>
              <Skeleton shape="circle" size="sm" />
              <Skeleton width={row % 2 ? "45%" : "35%"} />
            </div>
          ))}
        </div>
      ) : root ? (
        <ul className={styles.list}>
          <Row node={root} depth={0} ctx={ctx} root />
        </ul>
      ) : (
        <Empty icon="Network" title="No sub-agents yet" description="The orchestrator hasn't started any sub-agents. The tree grows here as it does." />
      )}
    </section>
  );
}
