/**
 * Chat context: the Tag above the composer, the composer's description, the removable X, and no
 * chip when context is unset. SSR through the CSS stub. Runs against the built kit (dist): build
 * first (npm run build -w agentic-ds-kit).
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
let Chat;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Chat } = await import("../dist/ui/Chat/Chat.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(Chat, { title: "Ask", messages: [], ...props }));
}

describe("Chat context", () => {
  test("no context renders no chip and no description", () => {
    const html = render({});
    assert.ok(!html.includes("Asking about"));
    assert.ok(!/<input[^>]*aria-describedby/.test(html));
  });

  test("context shows the label and describes the composer", () => {
    const html = render({ context: { label: "Plan mix · Last 12 months" } });
    const id = html.match(/<span id="([^"]+)"[^>]*>Asking about Plan mix · Last 12 months<\/span>/)?.[1];
    assert.ok(id, "hidden description span");
    assert.match(html, new RegExp(`<input[^>]*aria-describedby="${id}"`));
    assert.match(html, />Plan mix · Last 12 months</);
    assert.ok(!html.includes("Remove Plan mix"), "not removable without onRemove");
  });

  test("onRemove makes the Tag removable with a named button", () => {
    const html = render({ context: { label: "Signups", onRemove: () => {} } });
    assert.match(html, /<button[^>]*aria-label="Remove Signups"/);
  });

  test("context sits after suggestions and before the composer", () => {
    const html = render({ suggestions: ["Why the dip?"], context: { label: "Signups" } });
    const suggestion = html.indexOf("Why the dip?");
    const chip = html.indexOf(">Signups<");
    const form = html.indexOf("<form");
    assert.ok(suggestion < chip && chip < form);
  });
});
