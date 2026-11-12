import type { ComponentType } from "react";
import { AgentOverviewDemo } from "./AgentOverviewDemo";
import { AppDirectoryDemo } from "./AppDirectoryDemo";
import { WorkBoardDemo } from "./WorkBoardDemo";

/** The live demo each block's preview frame renders, by docs slug. */
export const BLOCK_DEMOS: Record<string, ComponentType> = {
  "agent-overview": AgentOverviewDemo,
  "app-directory": AppDirectoryDemo,
  "work-board": WorkBoardDemo,
};
