/**
 * RedactionPreview: what leaves for a model or tool, masked by type. Logic (spans, masking,
 * locked types), SSR render through the CSS stub, one solid primary, resolved rows and the
 * callbacks. Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

const payload = "Mail ana@acme.dev or bo@acme.dev, key k-123.";
const at = (value, type, from = 0) => {
  const start = payload.indexOf(value, from);
  return { start, end: start + value.length, type };
};
const spans = [at("ana@acme.dev", "email"), at("bo@acme.dev", "email"), at("k-123", "apiKey")];

let logic;
let React;
let renderToStaticMarkup;
let RedactionPreview;
let Button;
let Switch;

before(async () => {
  logic = await import("../dist/ui/RedactionPreview/redactionPreview.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ RedactionPreview } = await import("../dist/ui/RedactionPreview/RedactionPreview.js"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
  ({ Switch } = await import("../dist/ui/Switch/Switch.js"));
});

const base = { destination: "Claude", region: "EU", payload, spans };

function render(props) {
  return renderToStaticMarkup(React.createElement(RedactionPreview, { ...base, ...props }));
}

function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = RedactionPreview({ ...base, ...props });
      return out;
    }),
  );
  return out;
}

function findAll(node, type, hits = []) {
  if (!node || typeof node !== "object") return hits;
  if (Array.isArray(node)) {
    for (const child of node) findAll(child, type, hits);
    return hits;
  }
  if (node.type === type) hits.push(node);
  findAll(node.props?.children, type, hits);
  return hits;
}

const solidPrimaries = (html) => (html.match(/_solid_\w+ _primary_/g) ?? []).length;

describe("RedactionPreview logic", () => {
  test("masks by rule; locked types stay masked", () => {
    assert.equal(logic.maskedPayload(payload, spans), "Mail [email] or [email], key [apiKey].");
    assert.equal(logic.maskedPayload(payload, spans, { email: false, apiKey: false }), "Mail ana@acme.dev or bo@acme.dev, key [apiKey].");
    assert.equal(logic.maskedCount(payload, spans, { email: false }), 1);
  });

  test("counts per type, labels, overlaps dropped", () => {
    assert.deepEqual(logic.typeCounts(payload, spans), [{ type: "email", count: 2 }, { type: "apiKey", count: 1 }]);
    assert.equal(logic.typeLabel("apiKey"), "API key");
    assert.equal(logic.typeLabel("taxNumber"), "Tax number");
    assert.equal(logic.cleanSpans(payload, [spans[0], { ...spans[0], start: spans[0].start + 2 }]).length, 1);
  });
});

describe("RedactionPreview render", () => {
  test("a labelled Card with region, type tags, chips, rules and Send", () => {
    const html = render({ onSend() {}, onCancel() {} });
    assert.match(html, /<article[^>]*aria-labelledby="[^"]+"[^>]*>.*<h2[^>]*>Sending to Claude<\/h2>/s);
    for (const text of ["EU region", "Email", "API key", "Mask before sending", "Locked on", "3 values masked", "Send", "Cancel"]) {
      assert.ok(html.includes(text), text);
    }
    assert.match(html, /aria-label="masked email"/);
    assert.match(html, /aria-pressed="false"/);
    assert.ok(!html.includes("ana@acme.dev"), "masked values are not in the markup");
    assert.equal(solidPrimaries(html), 1);
    assert.ok(!html.includes("go out unmasked"));
  });

  test("an unmasked type is marked in words and raises a warning", () => {
    const html = render({ rules: { email: false } });
    assert.ok(html.includes("unmasked email: "));
    assert.ok(html.includes("Some values go out unmasked"));
    assert.ok(html.includes("2 values will reach Claude as written"));
  });

  test("sent and cancelled fold to one line", () => {
    const sent = render({ status: "sent" });
    assert.match(sent, /aria-label="Sent to Claude with 3 values masked"/);
    assert.equal(solidPrimaries(sent), 0);
    assert.ok(render({ status: "cancelled" }).includes("Not sent to Claude"));
  });
});

describe("RedactionPreview callbacks", () => {
  test("Send gets the masked payload; locked Switch is disabled; rules change", () => {
    const calls = [];
    const node = tree({ onSend: (masked) => calls.push(["send", masked]), onRulesChange: (r) => calls.push(["rules", r]) });
    findAll(node, Button).find((b) => b.props.children === "Send").props.onClick();
    const switches = findAll(node, Switch);
    assert.equal(switches.find((s) => s.props.label.startsWith("API key")).props.disabled, true);
    switches.find((s) => s.props.label.startsWith("Email")).props.onChange(false);
    assert.deepEqual(calls, [["send", "Mail [email] or [email], key [apiKey]."], ["rules", { email: false }]]);
  });
});

describe("RedactionPreview in the catalog (MCP)", () => {
  test("list_components returns it as an organism", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "redactionpreview");
    assert.equal(row?.name, "RedactionPreview");
    assert.equal(row.level, "organism");
  });
});
