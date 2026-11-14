/**
 * agentic-ds-kit mcp: stdio MCP server. Tools read this install only.
 * stdout is the protocol. Do not write logs there.
 * No runtime dependencies: the protocol layer is ./mcp-server.mjs (MCP 2025-06-18, tools only).
 */
import { parseArgs } from "node:util";
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
import { COMPONENT_LEVELS } from "./levels.mjs";
import { createServer as createRpcServer, serveStdio } from "./mcp-server.mjs";
import { MAX_LIMIT, shapeComponents, shapeQuestions, shapeTokens } from "./mcp-shape.mjs";
import { QuestionsError, buildQuestions } from "./questions.mjs";
import { ReviewError, reviewCode, reviewPath } from "./review.mjs";

export const MCP_HELP = `Usage: npx agentic-ds-kit mcp

Start a read-only MCP server on stdio. Cursor and Claude Code spawn this
command and query the installed kit. Answers are read from this install's
contracts, tokens, patterns, and AGENTS.md. Nothing is fetched.

Tools:
  list_components       Name, kind (component or block), level, short purpose; detail, kind,
                        level, limit, offset
  get_component         Props, variants, must/doNot, tokens, import, example, kind, level
  search_components     Match name, purpose, or contract keywords; rows include level
  get_tokens            Semantic tokens by group; summary by default, detail full, limit, offset
  list_patterns         Description, level (template) and the add command
  get_pattern           One pattern by id, with level (template)
  get_rules             AGENTS.md, including the page-layout grid rule
  questions             Same JSON as npx agentic-ds-kit questions; detail summary, limit, offset
  review_ui             Same findings as npx agentic-ds-kit review: a path, or code plus
                        filename for a draft that is not saved yet

Levels, smallest to biggest: ${COMPONENT_LEVELS.join(", ")}, template (patterns).
Reuse the biggest piece that fits before building from smaller ones.

Options:
  -h, --help            Show this help`;

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

// Plain JSON Schema for tool inputs (no zod). Everything optional unless listed in `required`.
const detail = (fallback) => ({
  type: "string",
  enum: ["summary", "full"],
  description: `summary (short rows) or full (every field). Default ${fallback}.`,
});
const limit = { type: "integer", minimum: 1, maximum: MAX_LIMIT, description: `Page size, 1-${MAX_LIMIT}. Omit for all rows.` };
const offset = { type: "integer", minimum: 0, description: "Rows to skip. Use page.next from the previous answer." };
const tokenGroup = { type: "string", enum: TOKEN_GROUPS, description: "color, type, space, radius, or grid. Omit for all five." };
const objectSchema = (properties = {}, required = []) => ({
  type: "object",
  properties,
  ...(required.length ? { required } : {}),
  additionalProperties: false,
});

function tool(name, { title, description, inputSchema }, handler) {
  return { name, title, description, inputSchema: inputSchema ?? objectSchema(), annotations: READ_ONLY, handler };
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
  const tools = [];
  const register = (name, config, handler) => tools.push(tool(name, config, handler));

  register(
    "list_components",
    {
      title: "List components",
      description:
        "List every UI component in this install, blocks included. Default summary rows: id, code name, kind (component, or block for a larger composition such as AgentOverview), level (atom, molecule, organism or block) and the first sentence of its purpose. detail full adds the category and the whole purpose line. Filter with kind and/or level; page with limit and offset (page.next). Reuse the biggest level that fits before building from smaller ones. Use get_component for props and rules.",
      inputSchema: objectSchema({
        detail: detail("summary"),
        kind: { type: "string", enum: ["component", "block"], description: "Only components or only blocks." },
        level: {
          type: "string",
          enum: [...COMPONENT_LEVELS],
          description: `Only one level: ${COMPONENT_LEVELS.join(", ")}. Patterns are level template; use list_patterns.`,
        },
        limit,
        offset,
      }),
    },
    (args) => shapeComponents(listComponents(), args),
  );

  register(
    "get_component",
    {
      title: "Get component",
      description:
        "Get one component by code name or contract id (Button or button). Returns its kind and level, props, enum variants, must and doNot rules, the tokens the contract lists, an import line, and a usage example from the contract snippet.",
      inputSchema: objectSchema(
        { name: { type: "string", description: "Component code name or contract id, such as Button or button." } },
        ["name"],
      ),
    },
    ({ name }) => getComponent(name),
  );

  register(
    "search_components",
    {
      title: "Search components",
      description:
        "Find components whose name, purpose, or contract keywords match. Keywords are the contract useWhen, doNotUseWhen, and doNot lines. Every word must match. Case-insensitive. Rows include kind and level.",
      inputSchema: objectSchema({ query: { type: "string", description: 'Words to match, such as "date" or "kpi".' } }, ["query"]),
    },
    ({ query }) => searchComponents(query),
  );

  register(
    "get_tokens",
    {
      title: "Get tokens",
      description:
        "Semantic tokens from this install. Default summary rows: CSS variable name, group and value (color adds the dark value). detail full adds the usage note, useWhen and doNot from tokens/usage.json. Groups: color, type, space, radius, grid; omit group for all five. Page with limit and offset (page.next). Primitive --color-* ramps are not included.",
      inputSchema: objectSchema({ group: tokenGroup, detail: detail("summary"), limit, offset }),
    },
    ({ group, ...rest }) => shapeTokens(getTokens(group), rest),
  );

  register(
    "list_patterns",
    {
      title: "List patterns",
      description:
        "List copy-in screen patterns. Each entry has an id, its level (always template, the biggest level), a one-line description, and the npx agentic-ds-kit add command that copies it into an app.",
    },
    () => listPatterns(),
  );

  register(
    "get_pattern",
    {
      title: "Get pattern",
      description:
        "Get one pattern by id (dashboard or app-shell). Returns its level (template), the description, the npx agentic-ds-kit add command, and the contract must and defaults.",
      inputSchema: objectSchema({ id: { type: "string", description: "Pattern id, such as dashboard or app-shell." } }, ["id"]),
    },
    ({ id }) => getPattern(id),
  );

  register(
    "get_rules",
    {
      title: "Get kit rules",
      description:
        "Return this install's AGENTS.md, including the page-layout rule for layout classes and --grid-* tokens. This is the rule text agents should follow.",
    },
    () => getRules(),
  );

  register(
    "questions",
    {
      title: "Questions option list",
      description:
        "Build the same closed option list as `npx agentic-ds-kit questions` from this install's contracts. Pass no arguments for the full list. Options match the CLI: only, group (component or pattern), overlay (the JSON object, not a file path), none, useWhen, notWhen, askStyle (part or strict), enums (own, all, or none). detail summary returns only id, label and kind per option (no enums); limit and offset page the options (page.next).",
      inputSchema: objectSchema({
        only: { type: "array", items: { type: "string" }, description: "Contract ids to keep." },
        group: { type: "string", enum: ["component", "pattern"], description: "Limit to components or patterns." },
        overlay: {
          description: "Overlay object with only, composites, options, and/or drop. Same shape as the questions --overlay file.",
        },
        none: { type: "boolean", description: 'Add a "None of these" option.' },
        useWhen: { type: "integer", minimum: 0, description: "useWhen lines per description. Default 2." },
        notWhen: { type: "integer", minimum: 0, description: "doNotUseWhen lines per description. Default 2." },
        askStyle: { type: "string", enum: ["part", "strict"], description: "part (default) or strict." },
        enums: { type: "string", enum: ["own", "all", "none"], description: "own (default), all, or none." },
        detail: { ...detail("full"), description: "full (the CLI JSON) or summary (id, label, kind). Default full." },
        limit,
        offset,
      }),
    },
    (args) => shapeQuestions(buildQuestions(questionsOptions(args)), args),
  );

  register(
    "review_ui",
    {
      title: "Review UI",
      description:
        "Check UI code against this install's contracts and tokens, the same as `npx agentic-ds-kit review`. Pass path (a file or folder, relative to the folder the server runs in), or code plus filename to check a draft that is not saved yet (filename picks the rules and names the file, such as app/page.tsx). Returns findings (id, rule, severity, file, line, contractId, message, fix) and the error and warning counts. Rules: raw-value, wrong-use, outside-kit (errors); rebuild, pattern-fits (warnings). Fix every error before you finish.",
      inputSchema: objectSchema({
        path: { type: "string", description: "File or folder to review, such as app or app/page.tsx." },
        code: { type: "string", description: "Source text of a draft. Needs filename." },
        filename: { type: "string", description: "Name for the draft, such as app/page.tsx. Needs code." },
      }),
    },
    ({ path, code, filename }) => {
      if (path !== undefined && code !== undefined) throw new ReviewError("Pass path, or code with filename, not both.");
      if (code !== undefined || filename !== undefined) return reviewCode(code, filename);
      if (path === undefined) throw new ReviewError("Pass path (a file or folder), or code with filename.");
      return reviewPath(path);
    },
  );

  return createRpcServer({
    name: "agentic-ds-kit",
    version,
    instructions:
      "Read-only catalog of the agentic-ds-kit install this process was started from. " +
      "Use these tools for components, tokens, patterns, kit rules, the questions option list, and review_ui to check UI code. " +
      "Answers come from that install's files. Do not invent a component or token the tools do not return.",
    tools,
    isToolError: (error) => error instanceof CatalogError || error instanceof QuestionsError || error instanceof ReviewError,
  });
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

  await serveStdio(server);
  return 0;
}
