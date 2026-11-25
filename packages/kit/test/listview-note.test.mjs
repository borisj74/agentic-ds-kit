/**
 * ListView note, noteTone, valueIcon and the warning tone. SSR render through the CSS stub. Runs against
 * the built kit (dist): build first (npm run build -w agentic-ds-kit).
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
let ListView;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ListView } = await import("../dist/ui/ListView/ListView.js"));
});

const items = [
  { id: "refunds", primary: "Issue refunds", secondary: "Collections", note: "$500 asked", noteTone: "warning", value: "Up to $250", valueIcon: "Play" },
  { id: "pause", primary: "Pause subscriptions", secondary: "Subscriptions agent", value: "Asks first", valueIcon: "Hand" },
  { id: "late", primary: "Pinecrest", note: "Waiting on finance", meta: "17 days late", metaTone: "warning" },
];

const render = () => renderToStaticMarkup(React.createElement(ListView, { label: "Actions", items }));

describe("ListView note and valueIcon", () => {
  test("note ends the secondary line after a middle dot, in the warning tone", () => {
    const html = render();
    assert.match(html, /Collections · <span class="[^"]*note[^"]*warning[^"]*">\$500 asked<\/span>/);
  });

  test("note joins the row name after the secondary line", () => {
    const html = render();
    assert.ok(html.includes('aria-label="Issue refunds, Collections, $500 asked, Up to $250"'));
  });

  test("a note without secondary stands alone, and metaTone warning colours meta", () => {
    const html = render();
    assert.match(html, /<span class="[^"]*note[^"]*">Waiting on finance<\/span>/);
    assert.doesNotMatch(html, / · <span class="[^"]*note[^"]*">Waiting/);
    assert.match(html, /<span class="[^"]*meta[^"]*warning[^"]*">17 days late<\/span>/);
  });

  test("valueIcon renders an aria-hidden svg before the value, and a row without note has no note span", () => {
    const html = render();
    assert.match(html, /<span class="[^"]*valueIcon[^"]*" aria-hidden="true"><svg[^>]*>.*?<\/svg><\/span>Up to \$250/);
    assert.match(html, /<\/svg><\/span>Asks first/);
    const pause = html.slice(html.indexOf("Pause subscriptions"), html.indexOf("Asks first"));
    assert.doesNotMatch(pause, /class="[^"]*note/);
  });
});
