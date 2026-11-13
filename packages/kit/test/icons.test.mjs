/**
 * Icons (audit S9): curated names render statically; other Lucide names render only after the
 * opt-in `agentic-ds-kit/icons-on-demand` entry registers its renderer; the main entry never
 * reaches lucide-react/dynamic. Runs against the built kit (dist).
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { register } from "node:module";
import { join } from "node:path";
import { before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "", shortCircuit: true };
  return next(url, context);
}`),
);

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
let h;
let render;
let Button;
let registry;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
  registry = await import("../dist/ui/Button/iconRegistry.js");
});

describe("icons", () => {
  test("a curated name renders an svg without the opt-in", () => {
    registry.setOnDemandIconRenderer(null);
    assert.match(render(h(Button, { iconStart: "Plus" }, "Add")), /<svg/);
    assert.match(render(h(Button, { iconStart: "rocket" }, "Launch")), /<svg/, "kebab/lowercase curated names work");
  });

  test("an uncurated name renders nothing (and warns) without the opt-in", () => {
    registry.setOnDemandIconRenderer(null);
    const warn = console.warn;
    const warnings = [];
    console.warn = (message) => warnings.push(String(message));
    try {
      assert.doesNotMatch(render(h(Button, { iconStart: "Telescope" }, "Explore")), /<svg|<span aria-hidden/);
    } finally {
      console.warn = warn;
    }
    assert.ok(warnings.some((message) => message.includes("icons-on-demand")));
  });

  test("the icons-on-demand entry registers the on-demand renderer", async () => {
    registry.setOnDemandIconRenderer(null);
    await import("../dist/src/icons-on-demand.js");
    assert.equal(typeof registry.getOnDemandIconRenderer(), "function");
    // On the server the icon chunk has not loaded yet, so the icon box is reserved.
    assert.match(render(h(Button, { iconStart: "Telescope" }, "Explore")), /<span aria-hidden="true"[^>]*style="display:inline-block/);
    registry.setOnDemandIconRenderer(null);
  });

  test("only the opt-in entry's module graph reaches lucide-react/dynamic", () => {
    const files = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (path.endsWith(".js")) files.push(path);
      }
    };
    walk(dist);
    const dynamic = files.filter((file) => readFileSync(file, "utf8").includes("lucide-react/dynamic"));
    assert.deepEqual(dynamic.map((file) => file.slice(dist.length)), ["ui/Button/LucideOnDemand.js"]);
    assert.doesNotMatch(readFileSync(join(dist, "ui/Button/lucideName.js"), "utf8"), /LucideOnDemand/);
    assert.match(readFileSync(join(dist, "src/icons-on-demand.js"), "utf8"), /LucideOnDemand/);
  });
});
