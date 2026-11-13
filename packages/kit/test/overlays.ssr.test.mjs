/**
 * Overlays and Tabs, server render: Modal, Drawer, AlertDialog, Select, DatePicker and Tabs render on
 * the server without touching `document`, and give the right roles and ARIA wiring.
 * Portaled overlays (Modal without `contained`, Drawer, AlertDialog) render nothing on the server and
 * mount on the client. Runs against the built kit (dist); `npm test` builds first. CSS imports are stubbed.
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
let renderToStaticMarkup;
let Modal;
let Drawer;
let AlertDialog;
let Select;
let DatePicker;
let Tabs;

const noop = () => {};

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Modal } = await import("../dist/ui/Modal/Modal.js"));
  ({ Drawer } = await import("../dist/ui/Drawer/Drawer.js"));
  ({ AlertDialog } = await import("../dist/ui/AlertDialog/AlertDialog.js"));
  ({ Select } = await import("../dist/ui/Select/Select.js"));
  ({ DatePicker } = await import("../dist/ui/DatePicker/DatePicker.js"));
  ({ Tabs } = await import("../dist/ui/Tabs/Tabs.js"));
});

describe("Modal SSR", () => {
  test("contained Modal renders a labelled, described modal dialog", () => {
    const html = renderToStaticMarkup(
      h(Modal, { open: true, contained: true, title: "Rename run", description: "Pick a short name.", onClose: noop }, "Body"),
    );
    assert.match(html, /role="dialog"/);
    assert.match(html, /aria-modal="true"/);
    const labelledBy = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1];
    assert.ok(labelledBy && new RegExp(`id="${labelledBy}"[^>]*>Rename run<`).test(html), "title is the dialog label");
    assert.ok(describedBy && new RegExp(`id="${describedBy}"[^>]*>Pick a short name.<`).test(html), "description is wired");
    assert.match(html, /aria-label="Close"/);
    assert.match(html, />Body</);
  });

  test("closed Modal renders nothing", () => {
    assert.equal(renderToStaticMarkup(h(Modal, { open: false, contained: true, title: "T", onClose: noop }, "x")), "");
  });

  test("portaled Modal renders nothing on the server (mounts on the client)", () => {
    assert.equal(renderToStaticMarkup(h(Modal, { open: true, title: "T", onClose: noop }, "x")), "");
  });
});

describe("Drawer and AlertDialog SSR", () => {
  test("open Drawer renders nothing on the server, without throwing", () => {
    assert.equal(renderToStaticMarkup(h(Drawer, { open: true, title: "Filters", onClose: noop }, "x")), "");
  });

  test("open AlertDialog renders nothing on the server, without throwing", () => {
    const html = renderToStaticMarkup(
      h(AlertDialog, { open: true, title: "Delete?", description: "Gone for good.", actionLabel: "Delete", onCancel: noop, onAction: noop }),
    );
    assert.equal(html, "");
  });
});

describe("Select SSR", () => {
  const options = [
    { value: "apple", label: "Apple" },
    { value: "pear", label: "Pear" },
  ];

  test("renders a closed field trigger with the first option and a hidden form value", () => {
    const html = renderToStaticMarkup(h(Select, { id: "fruit", name: "fruit", ariaLabel: "Fruit", options }));
    assert.match(html, /<input type="hidden" name="fruit" value="apple"\/>/);
    assert.match(html, /<button[^>]*id="fruit"[^>]*aria-label="Fruit"/);
    assert.match(html, />Apple</);
    assert.doesNotMatch(html, /role="menu"/, "panel is not rendered until opened");
  });

  test("placeholder shows when nothing is chosen", () => {
    const html = renderToStaticMarkup(h(Select, { id: "f", ariaLabel: "Fruit", placeholder: "Choose", options }));
    assert.match(html, />Choose</);
  });
});

describe("DatePicker SSR", () => {
  test("renders a closed dialog trigger with the formatted date", () => {
    const html = renderToStaticMarkup(h(DatePicker, { id: "due", "aria-label": "Due date", defaultValue: "2026-11-13" }));
    assert.match(html, /aria-haspopup="dialog"/);
    assert.match(html, /aria-expanded="false"/);
    assert.match(html, /aria-controls="due-calendar"/);
    assert.match(html, />Nov 13, 2026</);
    assert.doesNotMatch(html, /role="dialog"/, "calendar is not rendered until opened");
  });
});

describe("Tabs SSR", () => {
  const items = [
    { id: "a", label: "Alpha", content: "Panel A" },
    { id: "b", label: "Beta", content: "Panel B" },
    { id: "c", label: "Gamma", disabled: true },
  ];

  test("renders a labelled tablist with a roving tabindex and one linked panel", () => {
    const html = renderToStaticMarkup(h(Tabs, { ariaLabel: "Sections", items }));
    assert.match(html, /role="tablist" aria-label="Sections"/);
    const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
    assert.equal(tabs.length, 3);
    assert.match(tabs[0], /aria-selected="true"/);
    assert.match(tabs[0], /tabindex="0"/);
    assert.match(tabs[1], /aria-selected="false"/);
    assert.match(tabs[1], /tabindex="-1"/);
    assert.match(tabs[2], /disabled=""/);
    const panelId = tabs[0].match(/aria-controls="([^"]+)"/)?.[1];
    const tabId = tabs[0].match(/id="([^"]+)"/)?.[1];
    const panel = html.match(new RegExp(`<div[^>]*id="${panelId}"[^>]*>`))?.[0] ?? "";
    assert.match(panel, /role="tabpanel"/);
    assert.ok(panel.includes(`aria-labelledby="${tabId}"`), "panel is linked to its tab");
    assert.match(html, />Panel A</);
    assert.doesNotMatch(html, /Panel B/);
  });

  test("defaultValue picks the selected tab", () => {
    const html = renderToStaticMarkup(h(Tabs, { ariaLabel: "Sections", items, defaultValue: "b" }));
    assert.match(html, />Panel B</);
  });
});
