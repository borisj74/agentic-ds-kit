/**
 * agentic-ds-kit mcp: stdio MCP server. Tools read this install only.
 * stdout is the protocol. Do not write logs there.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parseArgs } from "node:util";
import { z } from "zod";
import {
  CatalogError,
  TOKEN_GROUPS,
  getComponent,
  getPattern,
  getRules,
  getTokens,
  listComponents,
  listPatterns,
  packageRoot,
  searchComponents,
} from "./catalog.mjs";
import { QuestionsError, buildQuestions } from "./questions.mjs";

export const MCP_HELP = `Usage: npx agentic-ds-kit mcp

Start a read-only MCP server on stdio. Cursor and Claude Code spawn this
command and query the installed kit. Answers are read from this install's
contracts, tokens, patterns, and AGENTS.md. Nothing is fetched.

Tools:
  list_components       Name, category, and a one-line purpose
  get_component         Props, variants, must/doNot, tokens, import, example
  search_components     Match name, purpose, or contract keywords
  get_tokens            Semantic color, type, space, radius, and grid
  list_patterns         Description and the add command
  get_pattern           One pattern by id
  get_rules             AGENTS.md, including the page-layout grid rule
  questions             Same JSON as npx agentic-ds-kit questions

Options:
  -h, --help            Show this help`;

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const tokenGroup = z
  .enum(TOKEN_GROUPS)
  .optional()
  .describe("color, type, space, radius, or grid. Omit for all five.");

function register(server, name, config, fn) {
  server.registerTool(name, { ...config, annotations: READ_ONLY }, async (args) => {
    try {
      const data = fn(args ?? {});
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data,
      };
    } catch (error) {
      if (error instanceof CatalogError || error instanceof QuestionsError) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
      }
      throw error;
    }
  });
}

function questionsOptions(args) {
  const options = { root: packageRoot };
  for (const key of ["only", "group", "overlay", "none", "useWhen", "notWhen", "askStyle", "enums"]) {
    if (args[key] !== undefined) options[key] = args[key];
  }
  return options;
}

function createServer() {
  const { kit: version } = listComponents();
  const server = new McpServer(
    { name: "agentic-ds-kit", version },
    {
      instructions:
        "Read-only catalog of the agentic-ds-kit install this process was started from. " +
        "Use these tools for components, tokens, patterns, kit rules, and the questions option list. " +
        "Answers come from that install's files. Do not invent a component or token the tools do not return.",
    },
  );

  register(
    server,
    "list_components",
    {
      title: "List components",
      description:
        "List every UI component in this install. Each entry has the code name, the catalog group as category, and a one-line purpose from its contract. Use get_component for props and rules.",
    },
    () => listComponents(),
  );

  register(
    server,
    "get_component",
    {
      title: "Get component",
      description:
        "Get one component by code name or contract id (Button or button). Returns props, enum variants, must and doNot rules, the tokens the contract lists, an import line, and a usage example from the contract snippet.",
      inputSchema: {
        name: z.string().describe("Component code name or contract id, such as Button or button."),
      },
    },
    ({ name }) => getComponent(name),
  );

  register(
    server,
    "search_components",
    {
      title: "Search components",
      description:
        "Find components whose name, purpose, or contract keywords match. Keywords are the contract useWhen, doNotUseWhen, and doNot lines. Every word must match. Case-insensitive.",
      inputSchema: {
        query: z.string().describe('Words to match, such as "date" or "kpi".'),
      },
    },
    ({ query }) => searchComponents(query),
  );

  register(
    server,
    "get_tokens",
    {
      title: "Get tokens",
      description:
        "Semantic tokens from this install, with the CSS variable name, the value, and the usage note from tokens/usage.json. Groups: color (light value plus dark), type, space, radius, grid. Omit group for all five. Primitive --color-* ramps are not included.",
      inputSchema: { group: tokenGroup },
    },
    ({ group }) => getTokens(group),
  );

  register(
    server,
    "list_patterns",
    {
      title: "List patterns",
      description:
        "List copy-in screen patterns. Each entry has an id, a one-line description, and the npx agentic-ds-kit add command that copies it into an app.",
    },
    () => listPatterns(),
  );

  register(
    server,
    "get_pattern",
    {
      title: "Get pattern",
      description:
        "Get one pattern by id (dashboard or app-shell). Returns the description, the npx agentic-ds-kit add command, and the contract must and defaults.",
      inputSchema: {
        id: z.string().describe("Pattern id, such as dashboard or app-shell."),
      },
    },
    ({ id }) => getPattern(id),
  );

  register(
    server,
    "get_rules",
    {
      title: "Get kit rules",
      description:
        "Return this install's AGENTS.md, including the page-layout rule for layout classes and --grid-* tokens. This is the rule text agents should follow.",
    },
    () => getRules(),
  );

  register(
    server,
    "questions",
    {
      title: "Questions option list",
      description:
        "Build the same closed option list as `npx agentic-ds-kit questions` from this install's contracts. Pass no arguments for the full list. Options match the CLI: only, group (component or pattern), overlay (the JSON object, not a file path), none, useWhen, notWhen, askStyle (part or strict), enums (own, all, or none).",
      inputSchema: {
        only: z.array(z.string()).optional().describe("Contract ids to keep."),
        group: z.enum(["component", "pattern"]).optional().describe("Limit to components or patterns."),
        overlay: z
          .any()
          .optional()
          .describe("Overlay object with only, composites, options, and/or drop. Same shape as the questions --overlay file."),
        none: z.boolean().optional().describe('Add a "None of these" option.'),
        useWhen: z.number().int().min(0).optional().describe("useWhen lines per description. Default 2."),
        notWhen: z.number().int().min(0).optional().describe("doNotUseWhen lines per description. Default 2."),
        askStyle: z.enum(["part", "strict"]).optional().describe("part (default) or strict."),
        enums: z.enum(["own", "all", "none"]).optional().describe("own (default), all, or none."),
      },
    },
    (args) => buildQuestions(questionsOptions(args)),
  );

  return server;
}

/** CLI entry. Returns the process exit code. The server stays up until stdin closes. */
export async function runMcp(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: false,
      options: { help: { type: "boolean", short: "h" } },
    });
  } catch (error) {
    console.error(`agentic-ds-kit: ${error.message}\n\n${MCP_HELP}`);
    return 1;
  }
  if (parsed.values.help) {
    console.log(MCP_HELP);
    return 0;
  }

  let server;
  try {
    server = createServer();
  } catch (error) {
    console.error(`agentic-ds-kit: ${error.message}`);
    return 1;
  }

  if (process.stderr.isTTY) {
    console.error("agentic-ds-kit mcp: waiting for an MCP client on stdio. Ctrl-C to stop.");
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  await new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const previous = transport.onclose;
    transport.onclose = () => {
      previous?.();
      finish();
    };
    process.stdin.once("end", () => {
      server.close().then(finish, finish);
    });
  });
  return 0;
}
