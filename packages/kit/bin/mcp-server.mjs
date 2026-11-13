/**
 * A small, zero-dependency MCP server over stdio: newline-delimited JSON-RPC 2.0, tools only.
 * Implements MCP protocol 2025-06-18 (and answers 2025-03-26 / 2024-11-05 clients in their own
 * version): initialize, ping, tools/list and tools/call. Notifications get no reply; unknown
 * methods get -32601. Tool arguments are checked against each tool's plain JSON Schema.
 * stdout carries only protocol messages.
 */

export const PROTOCOL_VERSION = "2025-06-18";
export const SUPPORTED_PROTOCOL_VERSIONS = [PROTOCOL_VERSION, "2025-03-26", "2024-11-05"];

const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

/** A tool error the client should see as an `isError` result (bad input, unknown name, …). */
export class ToolInputError extends Error {}

function describeType(schema) {
  if (schema.enum) return `one of ${schema.enum.join(", ")}`;
  if (schema.type === "array") return `an array of ${describeType(schema.items ?? {})}s`;
  return schema.type === "integer" ? "an integer" : `a ${schema.type}`;
}

/** Minimal JSON Schema check for the subset the tools use. Returns a list of problems. */
export function validate(schema, value, path = "arguments") {
  const problems = [];
  if (schema.type === "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return [`${path} must be an object`];
    for (const key of schema.required ?? []) if (value[key] === undefined) problems.push(`${path}.${key} is required`);
    for (const [key, item] of Object.entries(value)) {
      const sub = schema.properties?.[key];
      if (!sub) {
        if (schema.additionalProperties === false) problems.push(`${path}.${key} is not a known argument`);
        continue;
      }
      if (item !== undefined) problems.push(...validate(sub, item, `${path}.${key}`));
    }
    return problems;
  }
  if (!schema.type && !schema.enum) return problems; // any value (questions overlay)
  const ok =
    (schema.type === "string" && typeof value === "string") ||
    (schema.type === "boolean" && typeof value === "boolean") ||
    (schema.type === "number" && typeof value === "number" && Number.isFinite(value)) ||
    (schema.type === "integer" && Number.isInteger(value)) ||
    (schema.type === "array" && Array.isArray(value)) ||
    (!schema.type && schema.enum);
  if (!ok) return [`${path} must be ${describeType(schema)}`];
  if (schema.enum && !schema.enum.includes(value)) return [`${path} must be ${describeType(schema)}`];
  if (schema.minimum !== undefined && value < schema.minimum) problems.push(`${path} must be ≥ ${schema.minimum}`);
  if (schema.maximum !== undefined && value > schema.maximum) problems.push(`${path} must be ≤ ${schema.maximum}`);
  if (schema.type === "array" && schema.items) {
    value.forEach((item, index) => problems.push(...validate(schema.items, item, `${path}[${index}]`)));
  }
  return problems;
}

/**
 * tools: [{ name, title, description, inputSchema, annotations, handler(args) }]. A handler
 * returns data (sent as compact JSON text) or throws: ToolInputError (and anything `isToolError`
 * accepts) becomes an isError result; anything else is a JSON-RPC internal error.
 */
export function createServer({ name, version, instructions, tools, isToolError = () => false }) {
  const byName = new Map(tools.map((tool) => [tool.name, tool]));

  function toolResult(text, isError = false) {
    return isError ? { content: [{ type: "text", text }], isError: true } : { content: [{ type: "text", text }] };
  }

  const methods = {
    initialize(params) {
      const asked = params?.protocolVersion;
      return {
        protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name, version },
        ...(instructions ? { instructions } : {}),
      };
    },
    ping() {
      return {};
    },
    "tools/list"() {
      return {
        tools: tools.map(({ name: toolName, title, description, inputSchema, annotations }) => ({
          name: toolName,
          title,
          description,
          inputSchema,
          annotations,
        })),
      };
    },
    "tools/call"(params) {
      const tool = byName.get(params?.name);
      if (!tool) {
        const error = new Error(`Unknown tool: ${params?.name}`);
        error.code = INVALID_PARAMS;
        throw error;
      }
      const args = params.arguments ?? {};
      const problems = validate(tool.inputSchema, args);
      if (problems.length) return toolResult(`Invalid arguments for tool ${tool.name}: ${problems.join("; ")}`, true);
      try {
        return toolResult(JSON.stringify(tool.handler(args)));
      } catch (error) {
        if (error instanceof ToolInputError || isToolError(error)) return toolResult(error.message, true);
        throw error;
      }
    },
  };

  /** Handle one parsed message. Returns the response object, or null for notifications. */
  function handle(message) {
    if (message === null || typeof message !== "object" || Array.isArray(message) || message.jsonrpc !== "2.0") {
      return { jsonrpc: "2.0", id: message?.id ?? null, error: { code: INVALID_REQUEST, message: "Invalid Request" } };
    }
    const isNotification = !("id" in message);
    // Responses from the client (we never send requests) and notifications need no reply.
    if (isNotification || typeof message.method !== "string") return null;
    const method = Object.hasOwn(methods, message.method) ? methods[message.method] : undefined;
    if (!method) {
      return { jsonrpc: "2.0", id: message.id, error: { code: METHOD_NOT_FOUND, message: `Method not found: ${message.method}` } };
    }
    try {
      return { jsonrpc: "2.0", id: message.id, result: method(message.params) };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: message.id,
        error: { code: error.code ?? INTERNAL_ERROR, message: error.message || "Internal error" },
      };
    }
  }

  /** Handle one line of input. Returns the response line(s) to write, without newlines. */
  function handleLine(line) {
    if (!line.trim()) return [];
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      return [JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: PARSE_ERROR, message: "Parse error" } })];
    }
    const responses = Array.isArray(message) ? message.map(handle) : [handle(message)];
    return responses.filter(Boolean).map((response) => JSON.stringify(response));
  }

  return { handle, handleLine };
}

/** Serve on stdin/stdout until stdin ends. Resolves when the input is closed. */
export function serveStdio(server, { input = process.stdin, output = process.stdout } = {}) {
  return new Promise((resolve) => {
    let buffer = "";
    input.setEncoding("utf8");
    input.on("data", (chunk) => {
      buffer += chunk;
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).replace(/\r$/, "");
        buffer = buffer.slice(newline + 1);
        for (const response of server.handleLine(line)) output.write(`${response}\n`);
        newline = buffer.indexOf("\n");
      }
    });
    input.on("end", () => {
      for (const response of server.handleLine(buffer)) output.write(`${response}\n`);
      resolve();
    });
  });
}
