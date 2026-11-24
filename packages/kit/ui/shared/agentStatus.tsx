import { CircleCheck, CircleDashed, CirclePause, CircleX, Hand, LoaderCircle, type LucideIcon } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { cx } from "./cx";
import styles from "./agentStatus.module.css";

/**
 * The one status language for agents and their runs, shared by AgentOverview, RunDetail and
 * their parts. Always drawn as an icon plus the word; colour only backs the word up.
 */
export type AgentStatus = "queued" | "running" | "needs-you" | "paused" | "done" | "failed";

/** Older status words the agent pieces used, mapped onto AgentStatus. */
export type AgentStatusInput =
  | AgentStatus
  | "waiting"
  | "approval"
  | "idle"
  | "pending";

const ALIAS: Record<AgentStatusInput, AgentStatus> = {
  queued: "queued",
  running: "running",
  "needs-you": "needs-you",
  paused: "paused",
  done: "done",
  failed: "failed",
  waiting: "needs-you",
  approval: "needs-you",
  idle: "queued",
  pending: "queued",
};

/** Maps an older status word (waiting, approval, idle, pending) onto AgentStatus. */
export function toAgentStatus(status: AgentStatusInput): AgentStatus {
  return ALIAS[status] ?? "queued";
}

export const AGENT_STATUS_WORD: Record<AgentStatus, string> = {
  queued: "Queued",
  running: "Running",
  "needs-you": "Needs you",
  paused: "Paused",
  done: "Done",
  failed: "Failed",
};

const AGENT_STATUS_ICON: Record<AgentStatus, LucideIcon> = {
  queued: CircleDashed,
  running: LoaderCircle,
  "needs-you": Hand,
  paused: CirclePause,
  done: CircleCheck,
  failed: CircleX,
};

/** The status icon alone, aria-hidden. Pair it with the word in visible text. */
export function AgentStatusIcon({ status, size = 16, className }: { status: AgentStatus; size?: number; className?: string }) {
  const Icon = AGENT_STATUS_ICON[status];
  return <Icon aria-hidden="true" size={size} strokeWidth={ICON_STROKE} className={cx(styles.icon, styles[status], className)} />;
}

/** Icon plus word, e.g. "✋ Needs you". The word is visible text; the icon is aria-hidden. */
export function AgentStatusMark({ status, className }: { status: AgentStatus; className?: string }) {
  return (
    <span className={cx(styles.mark, styles[status], className)}>
      <AgentStatusIcon status={status} />
      <span className={styles.word}>{AGENT_STATUS_WORD[status]}</span>
    </span>
  );
}
