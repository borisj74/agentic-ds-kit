import type { Metadata } from "next";
import { Section, Table } from "agentic-ds-kit";
import { CodeBlock } from "../components/CodeBlock";
import playground from "../playground.module.css";
import { canonical } from "@/lib/site";

const RUN = `npx agentic-ds-kit review app --score
npx agentic-ds-kit review app --json --score
npx agentic-ds-kit review app --min 80`;

const FORMULA = `share = kitElements / (kitElements + otherElements)
        (or 1 when there are no countable elements)
scale = 100 / max(100, kitElements + otherElements)
value = max(0, min(100, round(100 * share - (5 * errors + 2 * warnings) * scale)))`;

const JSON_SHAPE = `"score": {
  "value": 85,
  "kitElements": 18,
  "otherElements": 2,
  "errors": 1,
  "warnings": 0,
  "formula": "share = kitElements / (kitElements + otherElements), ...; scale = ...; value = ..."
}`;

const COPY = `mkdir -p .github/workflows
cp node_modules/agentic-ds-kit/templates/github/contract-fit.yml .github/workflows/`;

const COUNT_COLUMNS = [
  { key: "kind", header: "Kind", emphasis: true },
  { key: "tags", header: "Tags" },
  { key: "why", header: "Why" },
] as const;

const COUNT_ROWS = [
  {
    kind: "Kit",
    tags: "Any tag whose name (Button, or Card in Card.Header) is imported from agentic-ds-kit.",
    why: "This is the part the contracts cover.",
  },
  {
    kind: "Other",
    tags: "button, a, input, select, textarea, img, table, dialog",
    why: "Things people click, type into or clearly see, where the kit has a component to use instead.",
  },
  {
    kind: "Not counted",
    tags: "div, span, main, header, nav, headings, lists, p, fragments, Lucide icons, Next.js tags, other components",
    why: "Layout and text are yours to write. Counting them would punish good markup.",
  },
];

export const metadata: Metadata = {
  ...canonical("/contract-fit"),
  title: "Contract fit",
};

export default function ContractFitPage() {
  return (
    <div className={playground.page}>
      <div className={playground.shell}>
        <h1 className={playground.pageTitle}>Contract fit</h1>
        <p className={playground.pageLead}>
          A number from 0 to 100 for how well a screen follows the kit. It is the share of UI
          elements that come from the kit, minus a penalty for each review error and a smaller one
          for each warning, counted per 100 elements. It sits on top of review: the findings and what to fix stay the same.
        </p>

        <Section title="Run it" description="Add --score to review. --min fails the run when the score is too low.">
          <div className={playground.stack}>
            <CodeBlock code={RUN} />
            <p className={playground.body}>
              --min turns on --score and exits 1 when the score is below the number you give. Errors
              still exit 1 as before. Without --score or --min, review prints and exits exactly as it
              did. The MCP tool review_ui always includes the score.
            </p>
          </div>
        </Section>

        <Section title="What counts as a UI element" description="Each opening JSX tag counts once. CSS files add findings, not elements.">
          <Table size="sm" caption="How review sorts tags." columns={[...COUNT_COLUMNS]} rows={[...COUNT_ROWS]} />
        </Section>

        <Section title="The formula" description="Share first, then penalties per 100 elements, then kept between 0 and 100.">
          <div className={playground.stack}>
            <CodeBlock code={FORMULA} />
            <p className={playground.body}>
              In plain words: take the part of your elements that come from the kit, as a percent.
              Take off 5 for every error and 2 for every warning, for every 100 elements. Round it,
              and never go below 0 or above 100. Anything with up to 100 elements counts as 100, so
              on a single screen each error costs a full 5 points. In a folder with 400 elements it
              costs 1.25, so a big app is not pushed to 0 just by being big. A file with no
              countable elements, such as a clean CSS file, starts at 100, so errors in it still
              bring the score down.
            </p>
          </div>
        </Section>

        <Section title="Worked example" description="One page with 18 kit elements, 2 native ones, and one error.">
          <div className={playground.stack}>
            <p className={playground.body}>
              The page uses 18 kit components (Buttons, Inputs, a Table and so on) and two native
              tags: one a and one img. Review finds one error, a hardcoded colour, and no warnings.
              Share is 18 / 20 = 0.9, so 90. The page has fewer than 100 elements, so the scale is
              1 and the error costs 5, which gives 85. Swap the a for kit Link and fix the colour,
              and the score goes to 95.
            </p>
            <CodeBlock code={JSON_SHAPE} />
          </div>
        </Section>

        <Section title="Post it on pull requests" description="A GitHub workflow template ships with the package.">
          <div className={playground.stack}>
            <CodeBlock code={COPY} />
            <p className={playground.body}>
              The workflow runs review with --json --score on each pull request and keeps one comment
              up to date with the score, the error and warning counts, and the top 10 findings. Change
              the path in the file to your UI folder. On pull requests from forks GitHub does not let
              the job comment, so the score is only in the job log.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
