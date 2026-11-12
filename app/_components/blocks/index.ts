import type { ComponentType } from "react";
import { AgentOverviewDemo } from "./AgentOverviewDemo";
import { LogoStripDemo } from "./LogoStripDemo";
import { PlansDemo } from "./PlansDemo";
import { LiveSessionDemo } from "./LiveSessionDemo";
import { RunDetailDemo } from "./RunDetailDemo";

/** The live demo each block's preview frame renders, by docs slug. */
export const BLOCK_DEMOS: Record<string, ComponentType> = {
  "agent-overview": AgentOverviewDemo,
  "logo-strip": LogoStripDemo,
  plans: PlansDemo,
  "live-session": LiveSessionDemo,
  "run-detail": RunDetailDemo,
};
