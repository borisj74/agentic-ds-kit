import type { ComponentType } from "react";
import { AgentOverviewDemo } from "./AgentOverviewDemo";
import { LogoStripDemo } from "./LogoStripDemo";
import { PlansDemo } from "./PlansDemo";

/** The live demo each block's preview frame renders, by docs slug. */
export const BLOCK_DEMOS: Record<string, ComponentType> = {
  "agent-overview": AgentOverviewDemo,
  "logo-strip": LogoStripDemo,
  plans: PlansDemo,
};
