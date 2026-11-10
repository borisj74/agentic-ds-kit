import type { ComponentPropsWithoutRef, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export type AgentLanesTaskStatus = "done" | "running" | "waiting" | "failed";

export interface AgentLanesAgent {
  id: string;
  name: string;
  /** e.g. "Opus 5.5" */
  model?: string;
  icon?: KitIcon;
}

export interface AgentLanesTask {
  id: string;
  agentId: string;
  title: string;
  status: AgentLanesTaskStatus;
  /** Epoch ms. */
  start: number;
  /** Epoch ms. Open (running or waiting) tasks grow to now. */
  end?: number;
  /** Id of the task this one hands off to: a connector is drawn into it. */
  handoffTo?: string;
  /** Waiting tasks: the question shown in the decision popover. */
  ask?: string;
  /** Detail lines when the block is opened. */
  summary?: string[];
  /** Lucide icon in the block. */
  icon?: KitIcon;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentLanesOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentLanesProps extends Omit<ComponentPropsWithoutRef<"section">, AgentLanesOwnedKeys> {
  agents: AgentLanesAgent[];
  tasks: AgentLanesTask[];
  /** Window in ms. Default 10 minutes. */
  span?: number;
  /** Controlled clock (epoch ms). Without it the lanes tick once a second. */
  now?: number;
  /** Header title. Default "Agents". */
  title?: string;
  /** The open block (detail or decision). */
  openTaskId?: string | null;
  onOpenTaskChange?: (id: string | null) => void;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  /** "Open" in a block's detail. */
  onOpen?: (taskId: string) => void;
  /** Span choices for the zoom control, in ms. Default 3m and 10m. */
  spans?: number[];
  onSpanChange?: (span: number) => void;
  ref?: Ref<HTMLElement>;
}
