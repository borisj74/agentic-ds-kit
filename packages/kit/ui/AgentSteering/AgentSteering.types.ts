import type { ComponentPropsWithoutRef, Ref } from "react";

export type AgentSteeringStatus = "running" | "paused" | "stopped" | "done";

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentSteeringOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentSteeringProps extends Omit<ComponentPropsWithoutRef<"section">, AgentSteeringOwnedKeys> {
  /** Agent or task name. */
  name: string;
  /** e.g. "step 6 · editing invoice.ts" */
  meta?: string;
  status?: AgentSteeringStatus;
  /** Run clock, e.g. "02:14". */
  elapsed?: string;
  /** Composer text (controlled). */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Send the steer. The send button is the one solid primary; Enter sends. */
  onSteer?: (text: string) => void;
  /**
   * Send button look. Default "solid" (the view's one solid primary). Use "soft" when another
   * solid primary shares the view, e.g. a Chat composer beside it.
   */
  sendAppearance?: "solid" | "soft";
  /** Steer in flight. */
  sending?: boolean;
  /** Confirmation after a steer landed, e.g. "focus on refunds · 14:03". */
  applied?: string;
  /** Steer not delivered, e.g. "Couldn't reach the agent. Your text is kept." */
  error?: string;
  onRetry?: () => void;
  /** Quick steers shown as chips while running. */
  suggestions?: string[];
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  /** When set, Stop opens a kit AlertDialog with this text before calling onStop. */
  stopConfirm?: { title: string; description: string };
  /** Stopped line, e.g. "Stopped by you · 14:05 · 2 files left as edited". */
  stoppedNote?: string;
  onOpenTrail?: () => void;
  loading?: boolean;
  ref?: Ref<HTMLElement>;
}
