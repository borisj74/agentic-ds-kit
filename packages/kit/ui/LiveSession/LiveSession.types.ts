import type { ComponentPropsWithoutRef, Ref } from "react";
import type { ApprovalCardAction, ApprovalCardRisk } from "../ApprovalCard/ApprovalCard.types";
import type { ChatMessage } from "../Chat/Chat.types";

/** Where an agent is. Done agents leave Running now; their steering is off. */
export type LiveSessionAgentStatus = "running" | "waiting" | "paused" | "failed" | "done";

/** An agent in the session: a RunningNow item plus what AgentSteering needs. */
export interface LiveSessionAgent {
  id: string;
  name: string;
  status: LiveSessionAgentStatus;
  /** What it does now, e.g. "editing invoice.ts". */
  activity?: string;
  /** Line under the name in the steering card, e.g. "step 6 · claude-code". */
  meta?: string;
  /** Clock, e.g. "02:14". */
  elapsed?: string;
  /** Quick steers shown as chips, e.g. "Focus on refunds". */
  suggestions?: string[];
  /** The last steer landed, e.g. "focus on refunds · 14:03". */
  applied?: string;
}

/** An agent asks before it acts: an inline kit ApprovalCard. */
export interface LiveSessionRequest {
  id: string;
  /** The asking agent (an id in `agents`). */
  agentId: string;
  /** The question, e.g. "Run the staging migration?". */
  title: string;
  description?: string;
  risk?: ApprovalCardRisk;
  /** Exactly what will run: a command or a diff. */
  action: ApprovalCardAction;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type LiveSessionOwnedKeys = "children" | "title" | "onPause";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface LiveSessionProps extends Omit<ComponentPropsWithoutRef<"section">, LiveSessionOwnedKeys> {
  /** The conversation (kit Chat messages). */
  messages: ChatMessage[];
  agents: LiveSessionAgent[];
  /** Open approvals, oldest first. The first shows inline; the rest are counted. */
  requests?: LiveSessionRequest[];
  /** The orchestrator is writing a reply. */
  thinking?: boolean;
  /** Prompt chips over the chat composer. */
  suggestions?: string[];
  /** Controlled steered agent. */
  selectedAgentId?: string;
  /** Uncontrolled starting agent. Default: the first agent still working. */
  defaultSelectedAgentId?: string;
  onSelectAgent?: (agentId: string) => void;
  /** A chat message was sent. */
  onSend?: (text: string) => void;
  /** A steer was sent to an agent. */
  onSteer?: (agentId: string, text: string) => void;
  onPause?: (agentId: string) => void;
  onResume?: (agentId: string) => void;
  onStop?: (agentId: string) => void;
  onApprove?: (requestId: string) => void;
  onDeny?: (requestId: string) => void;
  /** Chat header. Default "Conversation". */
  chatTitle?: string;
  /** Block heading. Default "Live session". */
  title?: string;
  ref?: Ref<HTMLElement>;
}
