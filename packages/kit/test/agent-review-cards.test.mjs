/**
 * Agent review cards redesign: one yes key (⌘/Ctrl+Enter) and one no key (Escape) on ApprovalCard,
 * PermissionRequest, DecisionCard, InlineDiff, PlanReview and ChangeReview; ApprovalCard facts;
 * scope limit; disabled DecisionCard options; counts in words; one shared resolved row.
 * Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

let React;
let renderToStaticMarkup;
let kit = {};

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  for (const name of ["ApprovalCard", "PermissionRequest", "DecisionCard", "InlineDiff", "PlanReview", "ChangeReview"]) {
    kit[name] = (await import(`../dist/ui/${name}/${name}.js`))[name];
  }
});

const html = (name, props) => renderToStaticMarkup(React.createElement(kit[name], props));

/** Call the component inside a render so hooks work, and hand back its root element. */
function tree(name, props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = kit[name](props);
      return out;
    }),
  );
  return out;
}

function key(node, init) {
  const root = {};
  node.props.onKeyDown({
    target: root,
    currentTarget: root,
    metaKey: false,
    ctrlKey: false,
    defaultPrevented: false,
    preventDefault() {},
    ...init,
  });
}

const command = { kind: "command", command: "dunning send --invoice INV-1842 --template overdue-2", target: "northwind / billing" };

describe("ApprovalCard", () => {
  test("plain Enter never approves; ⌘/Ctrl+Enter does; Escape denies", () => {
    const calls = [];
    const node = tree("ApprovalCard", { title: "Send a second reminder for INV-1842?", action: command, onApprove: () => calls.push("yes"), onDeny: () => calls.push("no") });
    key(node, { key: "Enter" });
    assert.deepEqual(calls, []);
    key(node, { key: "Enter", metaKey: true });
    key(node, { key: "Enter", ctrlKey: true });
    key(node, { key: "Escape" });
    assert.deepEqual(calls, ["yes", "yes", "no"]);
  });

  test("Escape on another control does not deny", () => {
    const calls = [];
    const node = tree("ApprovalCard", { title: "Send?", action: command, onDeny: () => calls.push("no") });
    const button = { closest: () => button };
    node.props.onKeyDown({ key: "Escape", target: button, currentTarget: {}, defaultPrevented: false, preventDefault() {} });
    assert.deepEqual(calls, []);
  });

  test("facts render as a dl; the key hint replaces the chips", () => {
    const out = html("ApprovalCard", {
      title: "Send a second reminder for INV-1842?",
      action: command,
      facts: [
        { label: "Will do", value: "Email ap@northwind.com" },
        { label: "Why medium", value: "Goes to the customer. Can't unsend." },
      ],
      onApprove() {},
      onDeny() {},
    });
    assert.match(out, /<dl[^>]*>.*<dt[^>]*>Will do<\/dt><dd[^>]*>Email ap@northwind.com<\/dd>/);
    assert.match(out, /⌘⏎ approve · Esc deny/);
    assert.match(out, /aria-keyshortcuts="Meta\+Enter Control\+Enter"/);
    assert.doesNotMatch(out, /aria-keyshortcuts="Enter"/);
    assert.equal((out.match(/Exact command/g) ?? []).length, 1);
  });

  test("resolved is one solid row, expired included", () => {
    const out = html("ApprovalCard", { title: "Send?", action: command, status: "expired" });
    assert.match(out, /aria-label="Expired: Send\?"/);
    assert.match(out, /auto-denied/);
  });
});

describe("PermissionRequest", () => {
  const scope = { id: "refunds", resource: "Stripe refunds", access: "write", limit: "$500 per refund", expiry: "Ends 22 Dec" };

  test("shows the limit and the access word", () => {
    const out = html("PermissionRequest", { title: "Let Billing agent issue refunds on its own?", scopes: [scope], onGrant() {}, onDeny() {} });
    assert.match(out, /Limit: \$500 per refund/);
    assert.match(out, />Write</);
    assert.match(out, />Deny<\/span>[\s\S]*?>Esc</, "Deny shows Esc");
    assert.match(out, />Grant<\/span>[\s\S]*?>⌘⏎</, "Grant shows ⌘⏎");
  });

  test("error Retry is a kit Button", () => {
    const out = html("PermissionRequest", { scopes: [scope], status: "error", onGrant() {} });
    assert.match(out, /role="alert"/);
    assert.match(out, /<button[^>]*type="button"[^>]*>.*Retry/);
  });

  test("⌘/Ctrl+Enter grants, Escape denies", () => {
    const calls = [];
    const node = tree("PermissionRequest", { scopes: [scope], onGrant: () => calls.push("yes"), onDeny: () => calls.push("no") });
    key(node, { key: "Enter" });
    key(node, { key: "Enter", metaKey: true });
    key(node, { key: "Escape" });
    assert.deepEqual(calls, ["yes", "no"]);
  });
});

describe("DecisionCard", () => {
  const options = [
    { id: "pair", label: "INV-1842 and INV-1857", recommended: true },
    { id: "1799", label: "INV-1799", description: "Over 60 days late", disabled: true, disabledReason: "Unavailable: in collections since 2 Nov" },
  ];

  test("a disabled option stays in the group with its reason", () => {
    const out = html("DecisionCard", { title: "Dunning agent asks", question: "Which invoices should I chase?", options, value: "pair", onConfirm() {}, onSkip() {} });
    assert.match(out, /Unavailable: in collections since 2 Nov/);
    assert.doesNotMatch(out, /Over 60 days late/);
    assert.match(out, /value="1799"[^>]*disabled|disabled[^>]*value="1799"/);
    assert.match(out, />Skip for now</);
    assert.match(out, />Confirm<\/span>[\s\S]*?>⌘⏎</, "Confirm shows its key chip");
    assert.doesNotMatch(out, /⌘⏎ confirm · Esc skip/, "no hint line");
    assert.match(out, /<button[^>]*class="[^"]*_ghost_[^"]*"[^>]*><span>Skip for now<\/span>/, "Skip for now is ghost");
    assert.doesNotMatch(out, /lucide-check[\s\S]*?>Confirm</, "Confirm has no Check icon");
  });

  test("Escape skips, ⌘/Ctrl+Enter confirms", () => {
    const calls = [];
    const node = tree("DecisionCard", { title: "Asks", question: "?", options, value: "pair", onConfirm: () => calls.push("yes"), onSkip: () => calls.push("no") });
    key(node, { key: "Escape" });
    key(node, { key: "Enter", ctrlKey: true });
    assert.deepEqual(calls, ["no", "yes"]);
  });
});

describe("InlineDiff", () => {
  const lines = [
    { type: "remove", text: "terms: net-30", oldNo: 13 },
    { type: "remove", text: "amount: 2400.00", oldNo: 14 },
    { type: "add", text: "terms: net-15", newNo: 13 },
    { type: "add", text: "amount: 2180.00", newNo: 14 },
  ];

  test("counts read in words", () => {
    const out = html("InlineDiff", { title: "Change terms and amount on INV-1842?", file: "ledger/INV-1842.yaml", lines, onAccept() {}, onReject() {} });
    assert.match(out, /2 added, 2 removed/);
    assert.match(out, /<span aria-hidden="true">\+2 −2<\/span>/, "+2 −2 shown, words for screen readers");
  });

  test("footer: Reject with Esc, Accept all, then Accept with ⌘⏎ and no Check icon", () => {
    const out = html("InlineDiff", { title: "Edit", lines, onAccept() {}, onReject() {}, onAcceptAll() {} });
    const reject = out.indexOf(">Reject<");
    const all = out.indexOf(">Accept all<");
    const accept = out.lastIndexOf(">Accept<");
    assert.ok(reject > -1 && reject < all && all < accept, "Reject, Accept all, Accept");
    assert.match(out, />Esc</);
    assert.match(out, />⌘⏎</);
    assert.doesNotMatch(out, /lucide-check\b/);
    assert.doesNotMatch(out, /⌘⏎ accept · Esc reject/);
  });

  test("accepted row says the counts in words", () => {
    const out = html("InlineDiff", { title: "Edit", lines, status: "accepted" });
    assert.match(out, /Accepted/);
    assert.match(out, /2 added, 2 removed/);
  });
});

describe("PlanReview", () => {
  const steps = [{ id: "s1", label: "Match Stripe payout po_1Q8 to INV-1842" }];

  test("⌘/Ctrl+Enter approves, Escape rejects; text fields keep their keys", () => {
    const calls = [];
    const node = tree("PlanReview", {
      title: "Run this plan to close INV-1842?",
      planTitle: "Close INV-1842",
      steps,
      onApprove: () => calls.push("yes"),
      onReject: () => calls.push("no"),
    });
    key(node, { key: "Enter", metaKey: true });
    key(node, { key: "Escape" });
    const field = { closest: () => field };
    node.props.onKeyDown({ key: "Enter", metaKey: true, target: field, currentTarget: {}, defaultPrevented: false, preventDefault() {} });
    assert.deepEqual(calls, ["yes", "no"]);
  });

  test("Reject is outline neutral", () => {
    const out = html("PlanReview", { planTitle: "Close INV-1842", steps, onApprove() {}, onReject() {} });
    assert.match(out, /⌘⏎ approve plan · Esc reject/);
    assert.doesNotMatch(out, /data-mode="danger"|mode-danger|_danger/);
  });
});

describe("ChangeReview", () => {
  const files = [
    { id: "f1", path: "ledger/INV-1842.yaml", lines: [{ type: "add", text: "terms: net-15" }] },
    { id: "f2", path: "ledger/credit-notes/CN-0311.yaml", lines: [{ type: "add", text: "amount: 220.00" }] },
  ];

  test("⌘/Ctrl+Enter accepts all outside text fields", () => {
    const calls = [];
    const node = tree("ChangeReview", { files, onAcceptAll: () => calls.push("all") });
    key(node, { key: "Enter", metaKey: true, target: { tagName: "DIV", closest: () => null } });
    const field = { tagName: "TEXTAREA", closest: () => field };
    key(node, { key: "Enter", metaKey: true, target: field });
    assert.deepEqual(calls, ["all"]);
  });

  test("the keys line and Accept all sit in the footer", () => {
    const out = renderToStaticMarkup(React.createElement(kit.ChangeReview, { files, onAcceptAll() {}, onReject() {} }));
    assert.match(out, /<footer[^>]*>.*⌘⏎ accept all.*Accept all 2 files.*<\/footer>/);
  });
});

describe("ApprovalCard compact (AgentMonitor waiting)", () => {
  const props = { title: "Run a migration on staging?", description: "Drops column invoices.legacy_total on staging.", risk: "high", action: command, onApprove() {}, onDeny() {} };

  test("default is unchanged: risk Badge, heading and full-size buttons", () => {
    const out = html("ApprovalCard", props);
    assert.match(out, />High risk</);
    assert.match(out, /class="[^"]*_title_/);
    assert.doesNotMatch(out, /_compact_/);
  });

  test("compact drops the Badge and heading, keeps the exact command and its tag, and uses small buttons", () => {
    const out = html("ApprovalCard", { ...props, variant: "compact" });
    assert.match(out, /class="[^"]*_compact_/);
    assert.doesNotMatch(out, /_badge_/i, "no risk Badge");
    assert.doesNotMatch(out, /class="[^"]*_title_/, "no big heading");
    assert.match(out, /<h3[^>]*class="[^"]*_compactTitle_[^"]*"[^>]*>Run a migration on staging\?<span class="[^"]*_srOnly_[^"]*">, High risk<\/span><\/h3>/);
    assert.match(out, /dunning send --invoice INV-1842 --template overdue-2/);
    assert.match(out, /northwind \/ billing/);
    assert.match(out, /class="[^"]*_compactActions_[^"]*"[\s\S]*>Deny<[\s\S]*>Approve</);
    assert.equal((out.match(/_sm_/g) ?? []).length >= 2, true, "Deny and Approve are size sm");
    assert.match(out, />Deny<\/span>[\s\S]*?>Esc</, "Deny shows its key chip");
    assert.match(out, />Approve<\/span>[\s\S]*?>⌘⏎</, "Approve shows its key chip");
  });

  test("compact waitingSec shows \"waiting m:ss\" as a timer; hidden when left out and in the default variant", () => {
    const shown = html("ApprovalCard", { ...props, variant: "compact", waitingSec: 31 });
    assert.match(shown, /waiting <span role="timer" aria-live="off">0:31<\/span>/);
    assert.match(html("ApprovalCard", { ...props, variant: "compact", waitingSec: 125.9 }), />2:05</, "whole seconds, rounded down");
    assert.doesNotMatch(html("ApprovalCard", { ...props, variant: "compact" }), /waiting/);
    assert.doesNotMatch(html("ApprovalCard", { ...props, waitingSec: 31 }), /waiting/, "default ignores it");
  });

  test("compact keeps the keys: Escape denies, Meta+Enter approves", () => {
    let approved = 0;
    let denied = 0;
    const node = tree("ApprovalCard", { ...props, variant: "compact", onApprove: () => approved++, onDeny: () => denied++ });
    key(node, { key: "Escape" });
    key(node, { key: "Enter", metaKey: true });
    assert.equal(denied, 1);
    assert.equal(approved, 1);
  });
});
