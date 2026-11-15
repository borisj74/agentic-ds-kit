import contract from "../../packages/kit/contracts/evalsuite.json";
import type { BlockDoc } from "./types";

export const evalSuiteDoc: BlockDoc = {
  slug: "eval-suite",
  label: "Eval suite",
  name: "EvalSuite",
  contract,
  lead:
    "Test a candidate agent version against the baseline on a fixed set of cases before you ship it. Pass rate, cost and latency sit side by side, regressions come first, and each case opens with its input, both outputs as a split diff and the grader's note. Promote stays disabled, with the reason beside it, until every regression is reviewed.",
  usage: `import { EvalSuite } from "agentic-ds-kit";

export function EvalPage({ run }) {
  return (
    <main className="layout-content">
      <EvalSuite
        baseline={{ label: "v12", metrics: run.baseline }}   // { passRate, avgCost, p50LatencyMs }
        candidate={{ label: "v13", metrics: run.candidate }}
        cases={run.cases}       // { id, name, tags?, dataset?, input, baseline, candidate, graderNote?, accepted?, flagged? }[]
        status={run.status}     // "running" | "done" | "error"
        progress={run.progress} // 0–1 while running
        onAcceptExpected={(id) => acceptAsExpected(run.id, id)}
        onFlag={(id) => flagCase(run.id, id)}
        onRerun={() => rerun(run.id)}
        onPromote={() => promote(run.candidateId)}
      />
    </main>
  );
}`,
};
