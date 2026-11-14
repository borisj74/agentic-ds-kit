import type { Metadata } from "next";
import { Section, Table } from "agentic-ds-kit";
import kitPackage from "agentic-ds-kit/package.json";
import { CodeBlock } from "../components/CodeBlock";
import playground from "../playground.module.css";
import { canonical } from "@/lib/site";

const VERSION = kitPackage.version;

const CURSOR = `{
  "mcpServers": {
    "agentic-ds-kit": {
      "command": "npx",
      "args": ["-y", "agentic-ds-kit", "mcp"]
    }
  }
}`;

const CLAUDE = `claude mcp add agentic-ds-kit -- npx -y agentic-ds-kit mcp`;

const TOOL_COLUMNS = [
  { key: "tool", header: "Tool", emphasis: true },
  { key: "args", header: "Arguments" },
  { key: "returns", header: "Returns" },
] as const;

const TOOL_ROWS = [
  {
    tool: "list_components",
    args: "detail, kind, limit, offset; all optional",
    returns: "Summary rows (id, name, kind, short purpose) by default; detail full adds category and the whole purpose",
  },
  {
    tool: "get_component",
    args: "name",
    returns: "Props, variants, must and doNot rules, tokens used, an import line, and a usage example",
  },
  {
    tool: "search_components",
    args: "query",
    returns: "Components whose name, purpose, or contract keywords match",
  },
  {
    tool: "get_tokens",
    args: "group, detail, limit, offset; all optional",
    returns: "Semantic tokens with name and value (dark too for color); detail full adds the usage notes",
  },
  {
    tool: "list_patterns",
    args: "none",
    returns: "Pattern id, description, and npx agentic-ds-kit add <id>",
  },
  {
    tool: "get_pattern",
    args: "id",
    returns: "Description, the add command, and the pattern's must and defaults",
  },
  {
    tool: "get_rules",
    args: "none",
    returns: "AGENTS.md from this install, including the page-layout grid rule",
  },
  {
    tool: "questions",
    args: "options, detail, limit, offset; all optional",
    returns: "The same option list as npx agentic-ds-kit questions; detail summary keeps id, label and kind",
  },
  {
    tool: "review_ui",
    args: "path, or code and filename",
    returns: "The same findings and counts as npx agentic-ds-kit review; code with filename checks a draft that is not saved",
  },
];

export const metadata: Metadata = {
  ...canonical("/mcp"),
  title: "MCP",
};

export default function McpPage() {
  return (
    <div className={playground.page}>
      <div className={playground.shell}>
        <h1 className={playground.pageTitle}>MCP</h1>
        <p className={playground.pageLead}>
          A local MCP server ships in the kit, version {VERSION}. Agents query the installed
          contracts, tokens, patterns, and rules over stdio. Answers come from that install, so they
          match the version you have.
        </p>

        <Section
          title="Cursor"
          description="Save this as .cursor/mcp.json in the app. Run it from the app root so npx uses the installed copy."
        >
          <div className={playground.stack}>
            <CodeBlock code={CURSOR} />
            <p className={playground.body}>
              The command is npx -y agentic-ds-kit mcp. The server is read-only. It does not edit
              files or call the network.
            </p>
          </div>
        </Section>

        <Section title="Claude Code" description="From the app root, register the same command.">
          <div className={playground.stack}>
            <CodeBlock code={CLAUDE} />
            <p className={playground.body}>
              Claude Code starts npx -y agentic-ds-kit mcp on stdio. Upgrade the package and the
              next session reads the new contracts.
            </p>
          </div>
        </Section>

        <Section
          title="Tools"
          description="Nine read-only tools. questions takes the same options as the CLI: only, group, overlay, none, useWhen, notWhen, askStyle, and enums. Pass the overlay as an object, not a file path."
        >
          <Table columns={[...TOOL_COLUMNS]} rows={TOOL_ROWS} caption="MCP tools" />
        </Section>
      </div>
    </div>
  );
}
