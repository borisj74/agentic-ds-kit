/** A block contract's fields the docs use (packages/kit/contracts/<id>.json, "kind": "block"). */
export interface BlockContract {
  id: string;
  kind: string;
  /** Always "block" for a block contract. */
  level: string;
  category: string;
  summary: string;
  intent: string;
  useWhen: string[];
  doNotUseWhen: string[];
  contains: string[];
  layout?: string[];
  doNot: string[];
  snippet: string;
}

/** One block's docs page: its contract plus the page lead and a usage example. */
export interface BlockDoc {
  /** URL slug: /blocks/<slug>. */
  slug: string;
  /** Nav and page title, e.g. "Agent overview". */
  label: string;
  /** Code name, e.g. "AgentOverview". */
  name: string;
  contract: BlockContract;
  lead: string;
  usage: string;
}
