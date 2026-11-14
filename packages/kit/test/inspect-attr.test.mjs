/**
 * Inspect mode markers: with NEXT_PUBLIC_NISTHA_INSPECT on, kit roots carry data-nistha="<id>";
 * off (the default) and in production they don't. Server-rendered against dist; `npm test`
 * builds first. CSS imports are stubbed. A source scan checks every component in the index
 * calls the helper with its own id.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, afterEach, before, describe, test } from "node:test";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "", shortCircuit: true };
  return next(url, context);
}`),
);

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_KEYS = ["NEXT_PUBLIC_NISTHA_INSPECT", "NEXT_PUBLIC_NISTHA_INSPECT_FORCE", "NODE_ENV"];
const saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function setEnv(values) {
  for (const key of ENV_KEYS) {
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }
}

let h;
let render;
const kit = {};

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  for (const name of ["Button", "Card", "TiltCard", "Select", "NumberInput", "BarChart", "Link", "Table", "Scoreboard"]) {
    kit[name] = (await import(`../dist/ui/${name}/${name}.js`))[name];
  }
});

afterEach(() => setEnv({ NODE_ENV: "test" }));
after(() => setEnv(saved));

const sample = () => [
  render(h(kit.Button, null, "Save")),
  render(h(kit.TiltCard, null, "Hi")),
  render(h(kit.Select, { options: [{ value: "a", label: "A" }], ariaLabel: "Pick" })),
  render(h(kit.NumberInput, { ariaLabel: "Count" })),
  render(h(kit.BarChart, { data: [{ label: "A", value: 1 }], title: "Sales" })),
  render(h(kit.Link, { href: "/docs" }, "Docs")),
  render(h(kit.Table, { columns: [{ key: "a", label: "A" }], rows: [{ id: "1", a: "x" }], caption: "T" })),
];

/** The data-nistha value on the first element that has one. */
const firstMarker = (html) => html.match(/data-nistha="([^"]*)"/)?.[1];

describe("inspect mode off", () => {
  test("no marker by default", () => {
    setEnv({ NODE_ENV: "test" });
    for (const html of sample()) assert.doesNotMatch(html, /data-nistha/);
  });

  test("values other than 1 or true stay off", () => {
    setEnv({ NEXT_PUBLIC_NISTHA_INSPECT: "yes", NODE_ENV: "development" });
    for (const html of sample()) assert.doesNotMatch(html, /data-nistha/);
  });

  test("production stays clean even with the switch on", () => {
    setEnv({ NEXT_PUBLIC_NISTHA_INSPECT: "1", NODE_ENV: "production" });
    for (const html of sample()) assert.doesNotMatch(html, /data-nistha/);
  });
});

describe("inspect mode on", () => {
  test("roots carry the contract id", () => {
    setEnv({ NEXT_PUBLIC_NISTHA_INSPECT: "true", NODE_ENV: "development" });
    const [button, , , number, chart, link, table] = sample();
    assert.match(button, /^<button[^>]*data-nistha="button"/);
    assert.match(number, /^<div[^>]*data-nistha="numberinput"/);
    assert.match(chart, /^<figure[^>]*data-nistha="barchart"/);
    assert.match(link, /^<a[^>]*data-nistha="link"/);
    assert.equal(firstMarker(table), "table");
  });

  test("a kit component built on another writes both ids on the shared node", () => {
    setEnv({ NEXT_PUBLIC_NISTHA_INSPECT: "1", NODE_ENV: "development" });
    const [, tilt, select] = sample();
    assert.match(tilt, /^<article[^>]*data-nistha="tiltcard card"/);
    assert.equal(firstMarker(select), "select dropdownmenu");
    // The Select id stays off the trigger button.
    assert.equal(select.match(/data-nistha=/g).length, 1);
  });

  test("children keep their own markers", () => {
    setEnv({ NEXT_PUBLIC_NISTHA_INSPECT: "1", NODE_ENV: "development" });
    const html = render(h(kit.Scoreboard, { items: [{ label: "A", value: "1" }, { label: "B", value: "2" }] }));
    assert.equal(firstMarker(html), "scoreboard");
    assert.equal(html.match(/data-nistha="scorecard"/g).length, 2);
  });

  test("production with the force flag writes markers", () => {
    setEnv({ NEXT_PUBLIC_NISTHA_INSPECT: "1", NEXT_PUBLIC_NISTHA_INSPECT_FORCE: "1", NODE_ENV: "production" });
    assert.match(render(h(kit.Card, null, "x")), /data-nistha="card"/);
  });
});

describe("coverage", () => {
  const index = JSON.parse(readFileSync(join(root, "contracts/index.json"), "utf8"));
  const components = index.filter((entry) => entry.group === "component");
  const dirs = readdirSync(join(root, "ui")).filter((dir) => dir !== "shared");

  function sourceOf(dir) {
    const out = [];
    const walk = (path) => {
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        const next = join(path, entry.name);
        if (entry.isDirectory()) walk(next);
        else if (entry.name.endsWith(".tsx")) out.push(readFileSync(next, "utf8"));
      }
    };
    walk(join(root, "ui", dir));
    return out.join("\n");
  }

  test("every component in the index calls nisthaAttr with its own id", () => {
    assert.ok(components.length > 100);
    const missing = [];
    for (const { id } of components) {
      const dir = dirs.find((name) => name.toLowerCase() === id);
      assert.ok(dir, `no ui folder for ${id}`);
      if (!sourceOf(dir).includes(`nisthaAttr("${id}"`)) missing.push(id);
    }
    assert.deepEqual(missing, []);
  });

  test("the helper file has no \"use client\"", () => {
    const src = readFileSync(join(root, "ui/shared/inspect.ts"), "utf8");
    assert.doesNotMatch(src, /^\s*["']use client["']/);
  });
});
