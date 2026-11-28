import contracts from "agentic-ds-kit/contracts/index.json";
import { agentOverviewDoc } from "./agent-overview";
import { logoStripDoc } from "./logo-strip";
import { plansDoc } from "./plans";
import { liveSessionDoc } from "./live-session";
import { runDetailDoc } from "./run-detail";
import { appDirectoryDoc } from "./app-directory";
import { workBoardDoc } from "./work-board";
import { kpiBoardDoc } from "./kpi-board";
import { usageBillingDoc } from "./usage-billing";
import { activityFeedDoc } from "./activity-feed";
import { planReviewDoc } from "./plan-review";
import { changeReviewDoc } from "./change-review";
import { evalSuiteDoc } from "./eval-suite";
import { failureClustersDoc } from "./failure-clusters";
import type { BlockDoc } from "./types";

export type { BlockContract, BlockDoc } from "./types";

/**
 * Every block's docs, deprecated ones included, A–Z by label. A new block adds its own file here
 * (contract, lead, usage), a demo in app/_components/blocks/, and one line in each list.
 * /blocks/<slug> pages and blockDoc() read this list, so deprecated block pages stay reachable.
 */
export const ALL_BLOCK_DOCS: BlockDoc[] = [agentOverviewDoc, logoStripDoc, plansDoc, liveSessionDoc, runDetailDoc, appDirectoryDoc, workBoardDoc, kpiBoardDoc, usageBillingDoc, activityFeedDoc, planReviewDoc, changeReviewDoc, evalSuiteDoc, failureClustersDoc].sort((a, b) => a.label.localeCompare(b.label, "en"));

/** Blocks whose contract is deprecated (status in contracts/index.json). */
const DEPRECATED_BLOCK_IDS = new Set(
  contracts.filter((entry) => "status" in entry && entry.status === "deprecated").map((entry) => entry.id),
);

/** The default block list (the /blocks index, nav, command palette, sitemap): deprecated blocks left out. */
export const BLOCK_DOCS: BlockDoc[] = ALL_BLOCK_DOCS.filter((doc) => !DEPRECATED_BLOCK_IDS.has(doc.contract.id));

export function isDeprecatedBlock(doc: BlockDoc): boolean {
  return DEPRECATED_BLOCK_IDS.has(doc.contract.id);
}

export function blockDoc(slug: string): BlockDoc | undefined {
  return ALL_BLOCK_DOCS.find((doc) => doc.slug === slug);
}
