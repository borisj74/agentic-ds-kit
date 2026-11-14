import type { Metadata } from "next";
import NextLink from "next/link";
import { Card, Link, Section } from "agentic-ds-kit";
import index from "agentic-ds-kit/contracts/index.json";
import kitPackage from "agentic-ds-kit/package.json";
import { canonical } from "@/lib/site";
import { CodeBlock } from "./components/CodeBlock";
import playground from "./playground.module.css";

export const metadata: Metadata = {
  title: { absolute: "Nistha — a code-only design system for coding agents and product UI." },
  ...canonical("/"),
};

type Entry = { group: string; kind?: string };
const entries = index as Entry[];
const components = entries.filter((entry) => entry.group === "component");
const blocks = components.filter((entry) => entry.kind === "block").length;
const patterns = entries.filter((entry) => entry.group === "pattern").length;

const AREAS = [
  {
    title: "Components",
    description: `${components.length} React components, ${blocks} of them blocks, each with a JSON contract agents read before they write UI.`,
    href: "/components",
  },
  {
    title: "Patterns",
    description: `${patterns} example screens to copy into your app with npx agentic-ds-kit add, then make your own.`,
    href: "/patterns",
  },
  {
    title: "Blocks",
    description: "Whole areas of a screen, such as an agent overview or a billing summary, imported like any component.",
    href: "/blocks",
  },
];

/** The docs home: what Nistha is, how to install it, and where to go next. */
export default function Home() {
  return (
    <div className={playground.page}>
      <div className={playground.shell}>
        <h1 className={playground.pageTitle}>Nistha</h1>
        <p className={playground.pageLead}>
          A code-only design system for coding agents and product UI: JSON contracts, tokens and React components,
          published as agentic-ds-kit {kitPackage.version}.
        </p>

        <p className={playground.pageLead}>
          <Link href="/start-here" linkAs={NextLink} variant="standalone">
            New to Nistha and not an engineer? Start here
          </Link>
        </p>

        <Section title="Install" description="In a React 19 app (Next.js 15 or later, Vite, …). Tokens load with the first import.">
          <div className={playground.stack}>
            <CodeBlock code={'npm install agentic-ds-kit\n\nimport { Button } from "agentic-ds-kit";'} />
            <Link href="/get-started" linkAs={NextLink} variant="standalone">
              Read the getting started guide
            </Link>
          </div>
        </Section>

        <Section title="Explore">
          {/* layout-metrics: as many columns as fit (12rem minimum), one column on a phone. */}
          <div className="layout-metrics">
            {AREAS.map((area) => (
              <Card key={area.href} size="sm" title={area.title} description={area.description}>
                <Link href={area.href} linkAs={NextLink} variant="standalone">
                  {`Browse ${area.title.toLowerCase()}`}
                </Link>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="For coding agents" description="Cursor and Claude Code read the same rules and contracts from the installed package.">
          <div className={playground.stack}>
            <p className={playground.body}>
              Copy AGENTS.md and CLAUDE.md from the package into your app, and connect the local MCP server so agents can
              look up components, tokens and patterns from the version you installed.
            </p>
            <Link href="/mcp" linkAs={NextLink} variant="standalone">
              Set up the MCP server
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}
