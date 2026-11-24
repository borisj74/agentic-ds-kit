/**
 * Form controls redesign: Field optional / required / success, the hint kept under an error, no
 * role=alert, Select lg. SSR against the built kit (dist); `npm test` builds first.
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
let render;
let kit;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  kit = {
    ...(await import("../dist/ui/Field/Field.js")),
    ...(await import("../dist/ui/Input/Input.js")),
    ...(await import("../dist/ui/Select/Select.js")),
    ...(await import("../dist/ui/Switch/Switch.js")),
    ...(await import("../dist/ui/shared/labels.js")),
  };
});

const field = (props, child) => render(h(kit.Field, { label: "VAT number", htmlFor: "vat", ...props }, child));
const input = (props = {}) => h(kit.Input, { id: "vat", ...props });

describe("Field messages", () => {
  test("the hint stays when an error shows, and both ids describe the control in that order", () => {
    const html = field({ hint: "Starts with a country code.", error: "It needs 9 digits after DE." }, input());
    assert.match(html, /id="vat-hint"[^>]*>Starts with a country code\./);
    assert.match(html, /id="vat-error"/);
    assert.match(html, /aria-describedby="vat-hint vat-error"/);
    assert.ok(html.indexOf('id="vat-hint"') < html.indexOf('id="vat-error"'), "hint comes before the error");
    assert.match(html, /data-invalid="true"/);
    assert.match(html, /aria-invalid="true"/);
  });

  test("the error has no role=alert and carries an aria-hidden icon plus words", () => {
    const html = field({ error: "It needs 9 digits after DE." }, input());
    assert.doesNotMatch(html, /role="alert"/);
    assert.match(html, /<p id="vat-error"[^>]*><svg[^>]*aria-hidden="true"[^>]*>.*<\/svg><span>It needs 9 digits after DE\.<\/span><\/p>/);
  });

  test("success shows under the hint with its own id and data-success", () => {
    const html = field({ hint: "We send invoices here.", success: "Email verified." }, input());
    assert.match(html, /id="vat-success"/);
    assert.match(html, /aria-describedby="vat-hint vat-success"/);
    assert.match(html, /data-success="true"/);
    assert.doesNotMatch(html, /data-invalid/);
  });

  test("error wins over success", () => {
    const html = field({ error: "Enter a postcode with 5 digits.", success: "Looks good." }, input());
    assert.doesNotMatch(html, /Looks good/);
    assert.doesNotMatch(html, /data-success/);
    assert.match(html, /aria-describedby="vat-error"/);
  });
});

describe("Field optional and required", () => {
  test("optional adds the muted word inside the label", () => {
    const html = field({ optional: true }, input());
    assert.match(html, /<label id="vat-label"[^>]*>VAT number<span[^>]*> Optional<\/span><\/label>/);
  });

  test("the Optional word comes from KitLabels", () => {
    const html = render(
      h(kit.KitLabelsProvider, { labels: { optional: "Facultatif" } }, h(kit.Field, { label: "TVA", htmlFor: "vat", optional: true }, input())),
    );
    assert.match(html, /> Facultatif<\/span>/);
  });

  test("required sets aria-required on an Input and a Switch, with no asterisk and no Optional", () => {
    const html = field({ required: true, optional: true }, input());
    assert.match(html, /<input[^>]*aria-required="true"/);
    assert.doesNotMatch(html, /Optional|\*/);
    const sw = render(h(kit.Field, { label: "Auto-pay", htmlFor: "auto", required: true }, h(kit.Switch, { id: "auto" })));
    assert.match(sw, /role="switch"[^>]*aria-required="true"|aria-required="true"[^>]*role="switch"/);
  });

  test("required leaves a Select trigger button alone", () => {
    const html = render(
      h(kit.Field, { label: "Country", htmlFor: "country", required: true }, h(kit.Select, { id: "country", options: [{ value: "de", label: "Germany" }] })),
    );
    assert.doesNotMatch(html, /aria-required/);
  });

  test("no aria-required unless required is set", () => {
    assert.doesNotMatch(field({}, input()), /aria-required/);
  });
});

describe("Select lg", () => {
  test("lg reaches the field trigger", () => {
    const html = render(h(kit.Select, { id: "currency", size: "lg", options: [{ value: "eur", label: "Euro · EUR" }] }));
    assert.match(html, /class="[^"]*fieldlg/);
  });
});
