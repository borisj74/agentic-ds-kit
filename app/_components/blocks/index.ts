import type { ComponentType } from "react";
import { AgentOverviewDemo } from "./AgentOverviewDemo";
import { LiveSessionDemo } from "./LiveSessionDemo";
import { RunDetailDemo } from "./RunDetailDemo";

/** The live demo each block's preview frame renders, by docs slug. */
export const BLOCK_DEMOS: Record<string, ComponentType> = {
  "agent-overview": AgentOverviewDemo,
  "live-session": LiveSessionDemo,
  "run-detail": RunDetailDemo,
};
