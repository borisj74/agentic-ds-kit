/**
 * SetupGuide and integrations: SetupGuide status words, blocked tasks and inline provider tiles;
 * IntegrationPicker status words, the Connected segment, compact tiles and connectFlow "detail";
 * AppDirectory as a deprecated wrapper. Runs against the built kit (dist): build first
 * (npm run build -w agentic-ds-kit). CSS imports are stubbed so components render on the server.
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

const providers = [
  { id: "stripe", name: "Stripe", description: "Cards and bank", status: "available", icon: "CreditCard" },
  { id: "gocardless", name: "GoCardless", description: "Direct Debit", status: "available", icon: "Landmark" },
];

const tasks = [
  { id: "company", label: "Add company details", status: "done" },
  { id: "payments", label: "Connect payments", description: "Pick one provider. You can add another later", status: "current", integrations: providers },
  { id: "tax", label: "Add tax info", status: "todo" },
  { id: "invoice", label: "Send your first invoice", status: "blocked", dependsOn: ["payments"], blockedReason: "Unlocks when payments are connected" },
  { id: "accountant", label: "Invite your accountant", status: "skipped" },
];

let React;
let renderToStaticMarkup;
let kit;
let pickerLogic;
let guideLogic;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  kit = {
    ...(await import("../dist/ui/SetupGuide/SetupGuide.js")),
    ...(await import("../dist/ui/IntegrationPicker/IntegrationPicker.js")),
    ...(await import("../dist/ui/AppDirectory/AppDirectory.js")),
  };
  pickerLogic = await import("../dist/ui/IntegrationPicker/integrationPicker.logic.js");
  guideLogic = await import("../dist/ui/SetupGuide/setupGuide.logic.js");
});

const html = (Component, props) => renderToStaticMarkup(React.createElement(kit[Component], props));
const count = (text, pattern) => (text.match(pattern) ?? []).length;

describe("SetupGuide logic", () => {
  test("a blocked task unlocks once its dependencies are done", () => {
    assert.equal(guideLogic.effectiveStatus(tasks[3], tasks), "blocked");
    const paid = tasks.map((task) => (task.id === "payments" ? { ...task, status: "done" } : task));
    assert.equal(guideLogic.effectiveStatus(tasks[3], paid), "todo");
  });

  test("status words, the default blocked reason and the progress label", () => {
    assert.deepEqual(["done", "current", "todo", "blocked", "skipped"].map(guideLogic.statusWord), ["Done", "Current", "To do", "Blocked", "Skipped"]);
    assert.equal(guideLogic.blockedReason({ ...tasks[3], blockedReason: undefined }, tasks), "Unlocks after Connect payments");
    assert.equal(guideLogic.progressLabel(1, 4, 1), "1 of 4 done · 1 skipped");
    assert.equal(guideLogic.progressLabel(2, 4, 0), "2 of 4 done");
  });
});

describe("SetupGuide render", () => {
  const out = () => html("SetupGuide", { title: "Set up billing", tasks, onTaskAction() {}, onIntegrationConnect() {}, onUndoSkip() {}, onDismiss() {} });

  test("every row has a status word; the progress label counts skipped", () => {
    const text = out();
    for (const word of [">Done<", ">Current<", ">To do<", ">Blocked<", ">Skipped<"]) assert.ok(text.includes(word), word);
    assert.ok(text.includes("1 of 4 done · 1 skipped"));
    assert.match(text, /aria-valuenow="25"/);
    assert.match(text, /aria-current="step"/);
  });

  test("skipped tasks leave the denominator: 4 done + 1 skipped is a full bar", () => {
    const four = tasks.map((task) => (task.status === "skipped" ? task : { ...task, status: "done" }));
    const text = html("SetupGuide", { title: "Set up billing", tasks: four, onComplete() {} });
    assert.ok(text.includes("4 of 4 done · 1 skipped"));
    assert.match(text, /aria-valuenow="100"/);
  });

  test("provider tiles sit under the current row, which has no button of its own", () => {
    const text = out();
    assert.ok(text.includes("Stripe") && text.includes("GoCardless"));
    assert.equal(count(text, />Connect</g), 2);
    assert.ok(!text.includes(">Continue<"));
    assert.ok(text.includes(">Start<"));
  });

  test("a blocked row explains itself and has no button; skipped has Undo skip", () => {
    const text = out();
    assert.ok(text.includes("Unlocks when payments are connected"));
    assert.ok(text.includes(">Undo skip<"));
    assert.equal(count(text, /<button[^>]*disabled/g), 0);
  });

  test("Connecting is a word with no button, announced", () => {
    const text = html("SetupGuide", { title: "Set up billing", tasks, onIntegrationConnect() {}, connectingId: "stripe" });
    assert.ok(text.includes("Connecting…"));
    assert.match(text, /role="status"[^>]*>Connecting Stripe/);
    assert.equal(count(text, />Connect</g), 1);
  });

  test("without tiles the current task gets Continue", () => {
    const plain = tasks.map((task) => (task.id === "payments" ? { ...task, integrations: undefined } : task));
    assert.ok(html("SetupGuide", { title: "Set up billing", tasks: plain, onTaskAction() {} }).includes(">Continue<"));
  });
});

describe("IntegrationPicker", () => {
  test("logic: filter by Connected, status words, drawer state", () => {
    assert.deepEqual(pickerLogic.filterItems(apps, pickerLogic.CONNECTED_CATEGORY, "").map((a) => a.id), ["ledger"]);
    assert.deepEqual(pickerLogic.filterItems(apps, "all", "crm").map((a) => a.id), ["crm"]);
    assert.equal(pickerLogic.statusWord(pickerLogic.tileState(apps[1], "chat")), "Connecting…");
    assert.equal(pickerLogic.statusWord(pickerLogic.tileState(apps[3])), "Coming soon");
    assert.deepEqual(pickerLogic.drawerState(apps[0]), { label: "Connected", tone: "success", action: "disconnect" });
    assert.equal(pickerLogic.drawerState(apps[1], "chat").action, "connecting");
    assert.equal(pickerLogic.drawerState(apps[3]).action, "none");
  });

  test("every tile ends in a status word; coming soon has no disabled Connect", () => {
    const text = html("IntegrationPicker", { items: apps, onConnect() {}, onManage() {} });
    assert.equal(count(text, />Not connected</g), 2);
    assert.ok(text.includes("Coming soon") && text.includes(">Manage<"));
    assert.equal(count(text, /<button[^>]*disabled/g), 0);
    assert.ok(text.includes("1 connected"));
  });

  test("showConnected adds a Connected segment with its count", () => {
    const text = html("IntegrationPicker", { items: apps, onConnect() {}, showConnected: true, category: "connected" });
    assert.ok(text.includes("Connected 1"));
    assert.ok(text.includes("Ledger (example)") && !text.includes("Chat (example)"));
  });

  test("connectFlow detail with compact tiles keeps one action per tile", () => {
    const text = html("IntegrationPicker", { items: apps, onConnect() {}, connectFlow: "detail", tileSize: "compact" });
    assert.equal(count(text, />Connect</g), 2);
    assert.equal(count(text, />Manage</g), 1);
  });
});

describe("AppDirectory (deprecated)", () => {
  test("renders IntegrationPicker with Connected as a segment", () => {
    const text = html("AppDirectory", { apps, onConnect() {}, onDisconnect() {} });
    assert.match(text, /<h3[^>]*>Apps<\/h3>/);
    assert.ok(text.includes("Connected 1"));
    for (const app of apps) assert.ok(text.includes(app.name), app.name);
  });

  test("connectedOnly shows connected apps only", () => {
    const text = html("AppDirectory", { apps, connectedOnly: true, onConnect() {}, onDisconnect() {} });
    assert.ok(text.includes("Ledger (example)") && !text.includes("Chat (example)"));
  });

  test("the catalog still lists it as a block", async () => {
    const { getComponent, listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "appdirectory");
    assert.equal(row?.name, "AppDirectory");
    assert.equal(row.kind, "block");
    const { component } = getComponent("AppDirectory");
    assert.equal(component.import, 'import { AppDirectory } from "agentic-ds-kit";');
  });
});
