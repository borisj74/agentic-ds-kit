import type { ComponentType } from "react";
import { AgentOverviewDemo } from "./AgentOverviewDemo";
import { KpiBoardDemo } from "./KpiBoardDemo";
import { UsageBillingDemo } from "./UsageBillingDemo";

/** The live demo each block's preview frame renders, by docs slug. */
export const BLOCK_DEMOS: Record<string, ComponentType> = {
  "agent-overview": AgentOverviewDemo,
  "kpi-board": KpiBoardDemo,
  "usage-billing": UsageBillingDemo,
};
