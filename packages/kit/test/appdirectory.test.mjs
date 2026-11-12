/**
 * AppDirectory: the Connected chip filters the catalogue, a tile opens the detail drawer, and the
 * drawer's Connect / Disconnect reach the block's props. Runs against the built kit (dist): build
 * first (npm run build -w agentic-ds-kit). CSS imports are stubbed so the block renders on the
 * server with react-dom/server.
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { before, describe, test } from "node:test";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "", shortCircuit: true };
  return next(url, context);
}`),
);

const apps = [
  { id: "ledger", name: "Ledger (example)", description: "Sync invoices", category: "Accounting", status: "connected", permissions: ["Read invoices"] },
  { id: "chat", name: "Chat (example)", description: "Post alerts", category: "Messaging", status: "available" },
  { id: "crm", name: "CRM (example)", description: "Sync contacts", category: "Sales", status: "available" },
  { id: "vault", name: "Vault (example)", description: "Store files", category: "Storage", status: "comingSoon" },
];

let logic;
let React;
let renderToStaticMarkup;
let AppDirectory;

before(async () => {
  logic = await import("../dist/ui/AppDirectory/appDirectory.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ AppDirectory } = await import("../dist/ui/AppDirectory/AppDirectory.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(AppDirectory, { apps, onConnect() {}, onDisconnect() {}, ...props }));
}

describe("AppDirectory logic", () => {
  test("the Connected chip keeps connected apps only", () => {
    assert.deepEqual(logic.visibleApps(apps, false).map((a) => a.id), ["ledger", "chat", "crm", "vault"]);
    assert.deepEqual(logic.visibleApps(apps, true).map((a) => a.id), ["ledger"]);
  });

  test("the head counts what is connected", () => {
    assert.equal(logic.connectedSummary(apps), "1 of 4 connected");
    assert.equal(logic.connectedSummary(apps.filter((a) => a.status !== "connected")), "None of 3 connected yet");
    assert.equal(logic.connectedSummary([]), "No apps in the directory");
  });

  test("the drawer's status and action follow the app", () => {
    assert.deepEqual(logic.drawerState(apps[0]), { label: "Connected", tone: "success", action: "disconnect" });
    assert.equal(logic.drawerState(apps[1]).action, "connect");
    assert.equal(logic.drawerState(apps[1], "chat").action, "connecting");
    assert.equal(logic.drawerState(apps[3]).action, "none");
  });
});

describe("AppDirectory render", () => {
  test("a labelled section with an h2, the count and the Connected toggle", () => {
    const html = render();
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"/);
    assert.match(html, /<h2[^>]*>Apps<\/h2>/);
    assert.ok(html.includes("1 of 4 connected"));
    assert.match(html, /<button[^>]*aria-pressed="false"[^>]*>.*Connected/);
    for (const app of apps) assert.ok(html.includes(app.name), app.name);
  });

  test("Connected only shows connected apps, pressed", () => {
    const html = render({ connectedOnly: true });
    assert.match(html, /aria-pressed="true"/);
    assert.ok(html.includes("Ledger (example)") && !html.includes("Chat (example)"));
    assert.ok(html.includes("Connected apps"));
  });

  test("empty states: no apps, and nothing connected", () => {
    assert.ok(render({ apps: [] }).includes("No apps yet"));
    const none = render({ apps: apps.filter((a) => a.status !== "connected"), defaultConnectedOnly: true });
    assert.ok(none.includes("Nothing connected yet") && none.includes("Show all apps"));
  });
});

describe("AppDirectory callbacks", () => {
  test("tiles open the drawer; the drawer connects, disconnects and closes", () => {
    const calls = [];
    const handlers = logic.directoryHandlers({
      select: (id) => calls.push(["select", id]),
      onConnect: (id) => calls.push(["connect", id]),
      onDisconnect: (id) => calls.push(["disconnect", id]),
    });
    handlers.onTileConnect("chat");
    handlers.onDrawerConnect("chat");
    handlers.onTileManage("ledger");
    handlers.onDrawerDisconnect("ledger");
    handlers.onDrawerClose();
    assert.deepEqual(calls, [
      ["select", "chat"],
      ["connect", "chat"],
      ["select", "ledger"],
      ["disconnect", "ledger"],
      ["select", null],
    ]);
  });
});

describe("AppDirectory in the catalog (MCP)", () => {
  test("list_components and get_component return it as a block", async () => {
    const { getComponent, listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "appdirectory");
    assert.equal(row?.name, "AppDirectory");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Integrations");
    const { component } = getComponent("AppDirectory");
    assert.equal(component.import, 'import { AppDirectory } from "agentic-ds-kit";');
  });
});
