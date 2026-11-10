import type { ComponentPropsWithoutRef, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export type AgentTrailStepStatus = "done" | "running" | "approval" | "pending" | "failed";

export interface AgentTrailStep {
  id: string;
  label: string;
  status: AgentTrailStepStatus;
  /** Time a finished step took, e.g. "4.1s". Shown for done and failed steps. */
  duration?: string;
  /** Live timer for the running or approval step, e.g. "0:18". */
  timer?: string;
  /** Detail under the label, e.g. the tool call "write_file src/middleware/auth.ts". */
  sublabel?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentTrailOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentTrailProps extends Omit<ComponentPropsWithoutRef<"section">, AgentTrailOwnedKeys> {
  /** The task, e.g. "Implement login rate limit". */
  title: string;
  steps: AgentTrailStep[];
  /** Lucide icon before the title. */
  icon?: KitIcon;
  /** Small neutral tag after the title, e.g. a branch or "example". */
  tag?: string;
  /** Override the "3/5" counter. Default: position of the first unfinished step over the step count. */
  progress?: { current: number; total: number };
  ref?: Ref<HTMLElement>;
}
