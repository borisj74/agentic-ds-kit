/**
 * ApprovalCard compact: with waitingSec and countdownSec both set, the countdown shows its
 * "Auto-deny in" words so the two clocks read apart; alone it keeps them for screen readers only.
 * The description is one element with the full text (CSS clamps it to one line).
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
let ApprovalCard;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ApprovalCard } = await import("../dist/ui/ApprovalCard/ApprovalCard.js"));
});

const noop = () => {};
const DESCRIPTION = "Drops column invoices.legacy_total on staging. Reversible from the 0041 snapshot.";
const base = {
  variant: "compact",
  title: "Waiting for your OK",
  description: DESCRIPTION,
  risk: "high",
  action: { kind: "command", command: "psql $STAGING_URL -f migrations/0042_drop_legacy.sql", target: "staging" },
  onApprove: noop,
  onDeny: noop,
};
const html = (props) => renderToStaticMarkup(React.createElement(ApprovalCard, { ...base, ...props }));
const autoDeny = (out) => out.match(/<span( class="[^"]*")?>Auto-deny in <\/span>/);

describe("ApprovalCard compact timers", () => {
  test("both timers: Auto-deny in is visible beside waiting", () => {
    const out = html({ waitingSec: 31, countdownSec: 60 });
    assert.match(out, />waiting /);
    const label = autoDeny(out);
    assert.ok(label, "the Auto-deny words are there");
    assert.doesNotMatch(label[0], /srOnly/, "and visible");
  });

  test("countdown alone: Auto-deny in stays screen-reader only", () => {
    const label = autoDeny(html({ countdownSec: 60 }));
    assert.ok(label);
    assert.match(label[0], /srOnly/);
  });

  test("description keeps its full text in one element", () => {
    const out = html({});
    assert.match(out, new RegExp(`<p id="[^"]+" class="[^"]*_compactDescription_[^"]*">${DESCRIPTION.replace(/[.$]/g, "\\$&")}</p>`));
  });
});
