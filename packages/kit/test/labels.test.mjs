/**
 * KitLabelsProvider: English defaults, partial overrides, nesting, and the Breadcrumb / Field
 * label props. Runs against the built kit (dist); `npm test` builds first.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
let render;
let KitLabelsProvider;
let DEFAULT_KIT_LABELS;
let Pagination;
let Tag;
let Breadcrumb;
let Field;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  ({ KitLabelsProvider, DEFAULT_KIT_LABELS } = await import("../dist/ui/shared/labels.js"));
  ({ Pagination } = await import("../dist/ui/Pagination/Pagination.js"));
  ({ Tag } = await import("../dist/ui/Tag/Tag.js"));
  ({ Breadcrumb } = await import("../dist/ui/Breadcrumb/Breadcrumb.js"));
  ({ Field } = await import("../dist/ui/Field/Field.js"));
});

const pager = () => h(Pagination, { page: 2, pageCount: 10, compact: true, onPageChange() {} });

describe("KitLabelsProvider", () => {
  test("is exported from the package entry (JS and types)", () => {
    const js = readFileSync(new URL("../dist/src/index.js", import.meta.url), "utf8");
    const dts = readFileSync(new URL("../dist/src/index.d.ts", import.meta.url), "utf8");
    assert.match(js, /KitLabelsProvider/);
    assert.match(js, /useKitLabels/);
    assert.match(dts, /KitLabels/);
  });

  test("without a provider, labels are English", () => {
    const html = render(pager());
    assert.match(html, /aria-label="Previous page"/);
    assert.match(html, /aria-label="Next page"/);
    assert.match(html, /Page 2 of 10/);
    assert.match(render(h(Tag, { removable: true }, "Draft")), /aria-label="Remove Draft"/);
  });

  test("overrides only the keys passed; the rest stay English", () => {
    const html = render(
      h(
        KitLabelsProvider,
        { labels: { previousPage: "Vorherige Seite", pageStatus: (p, c) => `Seite ${p} von ${c}` } },
        pager(),
      ),
    );
    assert.match(html, /aria-label="Vorherige Seite"/);
    assert.match(html, /Seite 2 von 10/);
    assert.match(html, /aria-label="Next page"/);
  });

  test("function labels get the item name", () => {
    const html = render(
      h(KitLabelsProvider, { labels: { remove: (name) => `${name} entfernen` } }, h(Tag, { removable: true }, "Draft")),
    );
    assert.match(html, /aria-label="Draft entfernen"/);
  });

  test("nested providers merge: the inner one changes only its own keys", () => {
    const html = render(
      h(
        KitLabelsProvider,
        { labels: { previousPage: "Zurück", nextPage: "Weiter" } },
        h(KitLabelsProvider, { labels: { nextPage: "Vor" } }, pager()),
      ),
    );
    assert.match(html, /aria-label="Zurück"/);
    assert.match(html, /aria-label="Vor"/);
  });

  test("defaults cover every key with a non-empty English value", () => {
    for (const [key, value] of Object.entries(DEFAULT_KIT_LABELS)) {
      const text = typeof value === "function" ? value("x", 3) : value;
      assert.ok(typeof text === "string" && text.length > 0, key);
    }
  });
});

describe("server-rendered label props", () => {
  const items = [{ label: "Home", href: "/" }, { label: "Settings" }];

  test("Breadcrumb names its nav Breadcrumb by default, ariaLabel overrides", () => {
    assert.match(render(h(Breadcrumb, { items })), /<nav[^>]*aria-label="Breadcrumb"/);
    assert.match(render(h(Breadcrumb, { items, ariaLabel: "Fil d'Ariane" })), /<nav[^>]*aria-label="Fil d&#x27;Ariane"/);
  });

  test("Field's help button is Help by default, helpLabel overrides", () => {
    const field = (extra) => h(Field, { label: "Name", htmlFor: "n", help: "Your full name", ...extra }, h("input", { id: "n" }));
    assert.match(render(field({})), /aria-label="Help"/);
    assert.match(render(field({ helpLabel: "Aide" })), /aria-label="Aide"/);
  });
});
