import { agentOverviewDoc } from "./agent-overview";
import { logoStripDoc } from "./logo-strip";
import { plansDoc } from "./plans";
import { liveSessionDoc } from "./live-session";
import { runDetailDoc } from "./run-detail";
import { appDirectoryDoc } from "./app-directory";
import { workBoardDoc } from "./work-board";
import type { BlockDoc } from "./types";

export type { BlockContract, BlockDoc } from "./types";

/**
 * Every block's docs, A–Z by label. A new block adds its own file here (contract, lead, usage),
 * a demo in app/_components/blocks/, and one line in each list.
 */
export const BLOCK_DOCS: BlockDoc[] = [agentOverviewDoc, logoStripDoc, plansDoc, liveSessionDoc, runDetailDoc, appDirectoryDoc, workBoardDoc].sort((a, b) => a.label.localeCompare(b.label, "en"));

export function blockDoc(slug: string): BlockDoc | undefined {
  return BLOCK_DOCS.find((doc) => doc.slug === slug);
}
