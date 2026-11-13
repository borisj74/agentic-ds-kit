/**
 * The zero-dependency MCP server over raw stdio (no SDK): initialize and version negotiation,
 * ping, no reply to notifications, method-not-found, unknown tool, bad arguments, parse errors.
 * mcp.test.mjs drives the same server through the official SDK client to catch protocol drift.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const bin = fileURLToPath(new URL("../bin/agentic-ds-kit.mjs", import.meta.url));
const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

/** Send lines to `agentic-ds-kit mcp`, close stdin, return the parsed response lines. */
function session(...messages) {
  const input = messages.map((m) => (typeof m === "string" ? m : JSON.stringify(m))).join("\n") + "\n";
  const run = spawnSync(process.execPath, [bin, "mcp"], { input, encoding: "utf8", timeout: 10_000 });
  assert.equal(run.status, 0, run.stderr);
  return run.stdout.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

const init = (protocolVersion = "2025-06-18", id = 1) => ({
  jsonrpc: "2.0",
  id,
  method: "initialize",
  params: { protocolVersion, capabilities: {}, clientInfo: { name: "raw-test", version: "0" } },
});

describe("mcp protocol (raw stdio)", () => {
  test("initialize answers with server info, tools capability and the negotiated version", () => {
    const [res] = session(init());
    assert.equal(res.id, 1);
    assert.equal(res.result.protocolVersion, "2025-06-18");
    assert.deepEqual(res.result.capabilities, { tools: { listChanged: false } });
    assert.deepEqual(res.result.serverInfo, { name: "agentic-ds-kit", version });
    assert.match(res.result.instructions, /Read-only catalog/);
  });

  test("an older supported version is echoed; an unknown one gets 2025-06-18", () => {
    assert.equal(session(init("2024-11-05"))[0].result.protocolVersion, "2024-11-05");
    assert.equal(session(init("2099-01-01"))[0].result.protocolVersion, "2025-06-18");
  });

  test("notifications get no reply; ping returns an empty result", () => {
    const out = session(
      init(),
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: 9 } },
      { jsonrpc: "2.0", id: 2, method: "ping" },
    );
    assert.deepEqual(out.map((r) => r.id), [1, 2]);
    assert.deepEqual(out[1].result, {});
  });

  test("unknown methods are -32601, unknown tools -32602, bad JSON -32700, bad shape -32600", () => {
    const out = session(
      { jsonrpc: "2.0", id: 3, method: "resources/list" },
      { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "nope", arguments: {} } },
      "{not json",
      { id: 5, method: "ping" },
    );
    assert.equal(out[0].error.code, -32601);
    assert.equal(out[1].error.code, -32602);
    assert.equal(out[2].error.code, -32700);
    assert.equal(out[3].error.code, -32600);
  });

  test("tools/list has plain JSON Schema inputs; tools/call validates arguments", () => {
    const [list, ok, bad, missing] = session(
      { jsonrpc: "2.0", id: 6, method: "tools/list" },
      { jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "get_component", arguments: { name: "Button" } } },
      { jsonrpc: "2.0", id: 8, method: "tools/call", params: { name: "list_components", arguments: { limit: 0 } } },
      { jsonrpc: "2.0", id: 9, method: "tools/call", params: { name: "get_pattern", arguments: {} } },
    );
    const tokens = list.result.tools.find((tool) => tool.name === "get_tokens");
    assert.equal(tokens.inputSchema.type, "object");
    assert.deepEqual(tokens.inputSchema.properties.group.enum, ["color", "type", "space", "radius", "grid"]);
    assert.equal(tokens.annotations.readOnlyHint, true);
    assert.equal(JSON.parse(ok.result.content[0].text).component.name, "Button");
    assert.equal(bad.result.isError, true);
    assert.match(bad.result.content[0].text, /limit must be ≥ 1/);
    assert.equal(missing.result.isError, true);
    assert.match(missing.result.content[0].text, /id is required/);
  });
});
