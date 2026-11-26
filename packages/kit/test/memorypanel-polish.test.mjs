/**
 * MemoryPanel polish: each row has a Brain mark, the age is its own span, "used here"
 * is a primary Badge, Forget's row button is neutral, and loading rows have a circle.
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
let MemoryPanel;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ MemoryPanel } = await import("../dist/ui/MemoryPanel/MemoryPanel.js"));
});

const ITEMS = [
  { id: "a", content: "Prefers sentence case for headings", source: "from chat · 12 Oct", age: "3w", pinned: true, usedHere: true },
  { id: "b", content: "Uses pnpm, not npm", source: "from repo scan", age: "1d" },
];
const noop = () => {};
const html = (props) => renderToStaticMarkup(React.createElement(MemoryPanel, props));

describe("MemoryPanel polish", () => {
  test("rows: Brain mark, age in its own span, used here as a primary Badge", () => {
    const out = html({ items: ITEMS, onPin: noop, onEdit: noop, onDelete: noop });
    const rows = out.split("<li").slice(1);
    assert.equal(rows.length, 2);
    for (const row of rows) assert.match(row, /lucide-brain/, "Brain mark on every row");
    assert.match(rows[0], /<span>from chat · 12 Oct<\/span><span aria-hidden="true">·<\/span><span class="[^"]*_age_[^"]*">3w<\/span>/);
    assert.match(rows[0], /class="[^"]*_primary_[^"]*"[^>]*>Used here</);
    assert.doesNotMatch(out, /lucide-book-marked/);
  });

  test("Forget row button is neutral, not danger", () => {
    const out = html({ items: ITEMS, onDelete: noop });
    const forget = out.match(/<button[^>]*aria-label="Forget: Uses pnpm, not npm"[^>]*>/)[0];
    assert.match(forget, /_neutral_/);
    assert.doesNotMatch(forget, /_danger_/);
  });

  test("loading rows start with a circle", () => {
    const out = html({ items: [], loading: true });
    assert.equal((out.match(/_circle_/g) ?? []).length, 3);
  });
});
