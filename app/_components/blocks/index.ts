import type { ComponentType } from "react";
import { AgentOverviewDemo } from "./AgentOverviewDemo";
import { LogoStripDemo } from "./LogoStripDemo";
import { PlansDemo } from "./PlansDemo";
import { LiveSessionDemo } from "./LiveSessionDemo";
import { RunDetailDemo } from "./RunDetailDemo";
import { AppDirectoryDemo } from "./AppDirectoryDemo";
import { WorkBoardDemo } from "./WorkBoardDemo";
import { KpiBoardDemo } from "./KpiBoardDemo";
import { UsageBillingDemo } from "./UsageBillingDemo";
import { ActivityFeedDemo } from "./ActivityFeedDemo";

/** The live demo each block's preview frame renders, by docs slug. */
export const BLOCK_DEMOS: Record<string, ComponentType> = {
  "agent-overview": AgentOverviewDemo,
  "logo-strip": LogoStripDemo,
  plans: PlansDemo,
  "live-session": LiveSessionDemo,
  "run-detail": RunDetailDemo,
  "app-directory": AppDirectoryDemo,
  "work-board": WorkBoardDemo,
  "kpi-board": KpiBoardDemo,
  "usage-billing": UsageBillingDemo,
  "activity-feed": ActivityFeedDemo,
};
