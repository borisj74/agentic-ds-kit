/**
 * Chat embedded (no header, title still names the section, header-only parts hidden) and Tabs fill
 * (class only with a panel). SSR through the CSS stub. Runs against the built kit (dist): build first
 * (npm run build -w agentic-ds-kit).
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

let h;
let Chat;
let Tabs;

before(async () => {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  h = (type, props) => renderToStaticMarkup(React.createElement(type, props));
  ({ Chat } = await import("../dist/ui/Chat/Chat.js"));
  ({ Tabs } = await import("../dist/ui/Tabs/Tabs.js"));
});

describe("Chat embedded", () => {
  test("no header, but the section keeps its name", () => {
    const html = h(Chat, { title: "Ask about revenue", embedded: true, status: "Online", onClose() {}, messages: [] });
    assert.match(html, /<section[^>]*aria-label="Ask about revenue"/);
    assert.ok(!html.includes("<header"));
    assert.ok(!html.includes("Online"));
    assert.ok(!html.includes('aria-label="Close"'));
    assert.match(html, /class="[^"]*embedded/);
  });

  test("default Chat keeps its header", () => {
    const html = h(Chat, { title: "Assistant", messages: [] });
    assert.match(html, /<header/);
    assert.ok(!/class="[^"]*embedded/.test(html));
  });
});

describe("Tabs fill", () => {
  const items = [
    { id: "a", label: "A", content: "Alpha" },
    { id: "b", label: "B", content: "Beta" },
  ];
  test("adds the fill class with a panel", () => {
    assert.match(h(Tabs, { items, fill: true }), /^<div class="[^"]*fill/);
  });
  test("no fill class without it, or with a list only", () => {
    assert.ok(!/^<div class="[^"]*fill/.test(h(Tabs, { items })));
    assert.ok(!/^<div class="[^"]*fill/.test(h(Tabs, { items: items.map(({ id, label }) => ({ id, label })), fill: true })));
  });
});
