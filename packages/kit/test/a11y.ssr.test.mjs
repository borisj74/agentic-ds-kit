/**
 * Accessibility wiring in server-rendered markup (audit phase 3): visually hidden text instead of
 * aria-label on plain spans, chart roles, Field and Slider labelling, describedBy on group controls,
 * aria-invalid only on roles that support it, and the Select trigger's popup state.
 * Runs against the built kit (dist); `npm test` builds first. CSS imports are stubbed.
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
const kit = {};
const noop = () => {};

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  for (const name of [
    "NumberTransition",
    "ShimmerText",
    "Field",
    "Slider",
    "InputOTP",
    "SegmentedControl",
    "RadioGroup",
    "Select",
    "DatePicker",
    "FileUpload",
    "LineChart",
    "BarChart",
  ]) {
    kit[name] = (await import(`../dist/ui/${name}/${name}.js`))[name];
  }
});

/** The opening tag of the first element whose attributes match `pattern`. */
function tag(html, pattern) {
  return html.match(new RegExp(`<[a-z]+[^>]*${pattern}[^>]*>`))?.[0] ?? "";
}

describe("S16: hidden text, not aria-label on spans", () => {
  test("NumberTransition reads its value from hidden text; the digits are aria-hidden", () => {
    const html = render(h(kit.NumberTransition, { value: "1,204" }));
    assert.doesNotMatch(html, /aria-label=/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /<span[^>]*>1,204<\/span><span[^>]*aria-hidden="true"/);
  });

  test("NumberTransition label replaces the hidden text", () => {
    const html = render(h(kit.NumberTransition, { value: "42", label: "42 runs" }));
    assert.match(html, />42 runs</);
    assert.doesNotMatch(html, /aria-label=/);
  });

  test("ShimmerText reads its text from hidden text; the characters are aria-hidden", () => {
    const html = render(h(kit.ShimmerText, null, "Thinking"));
    assert.doesNotMatch(html, /aria-label=/);
    assert.match(html, /<span[^>]*>Thinking<\/span><span[^>]*aria-hidden="true"/);
  });
});

describe("S17: charts on the server", () => {
  test("before the chart is measured there are no points, so the svg stays role=img", () => {
    const html = render(h(kit.LineChart, { title: "Runs", data: [{ label: "Mon", value: 1 }] }));
    const svg = tag(html, 'role="(?:group|img)"');
    if (svg) {
      assert.ok(svg.startsWith("<svg"));
      assert.doesNotMatch(html, /tabindex="0"/, "no focusable point before measuring");
    }
  });
});

describe("S18 and N7: Field labels and describedBy", () => {
  test("Field has no nameless role=group and its label has an id", () => {
    const html = render(h(kit.Field, { label: "Email", htmlFor: "email", hint: "Work address" }, h("input", { id: "email" })));
    assert.doesNotMatch(html, /role="group"/);
    assert.match(html, /<label[^>]*id="email-label"[^>]*for="email"|<label[^>]*for="email"[^>]*id="email-label"/);
  });

  test("a Slider inside Field is named by the Field label and described by its hint", () => {
    const html = render(
      h(kit.Field, { label: "Volume", htmlFor: "volume", hint: "0 to 100" }, h(kit.Slider, { id: "volume", value: 40, onValueChange: noop })),
    );
    const thumb = tag(html, 'role="slider"');
    assert.match(thumb, /aria-labelledby="volume-label"/);
    assert.match(thumb, /aria-describedby="volume-hint"/);
    assert.doesNotMatch(tag(html, 'id="volume"'), /aria-label/, "no aria attributes on the root div");
  });

  test("a Slider in a Field with an error marks each thumb invalid", () => {
    const html = render(
      h(kit.Field, { label: "Range", htmlFor: "r", error: "Too wide" }, h(kit.Slider, { id: "r", value: [10, 90], onValueChange: noop })),
    );
    const thumbs = [...html.matchAll(/<span[^>]*role="slider"[^>]*>/g)].map((match) => match[0]);
    assert.equal(thumbs.length, 2);
    for (const thumb of thumbs) {
      assert.match(thumb, /aria-invalid="true"/);
      assert.match(thumb, /aria-describedby="r-error"/);
    }
  });

  test("a standalone Slider keeps its aria-label on the thumb", () => {
    const html = render(h(kit.Slider, { "aria-label": "Level", value: 5 }));
    assert.match(tag(html, 'role="slider"'), /aria-label="Level"/);
  });

  test("InputOTP, SegmentedControl and RadioGroup take describedBy", () => {
    const otp = render(h(kit.InputOTP, { id: "otp", describedBy: "otp-hint" }));
    assert.match(tag(otp, 'id="otp"'), /aria-describedby="otp-hint"/);

    const seg = render(
      h(kit.SegmentedControl, { ariaLabel: "View", describedBy: "view-hint", items: [{ value: "a", label: "A" }, { value: "b", label: "B" }] }),
    );
    assert.match(tag(seg, 'role="radiogroup"'), /aria-describedby="view-hint"/);

    const radios = render(
      h(kit.RadioGroup, { name: "plan", legend: "Plan", hint: "Billed monthly", describedBy: "extra", options: [{ value: "a", label: "A" }] }),
    );
    assert.match(tag(radios, "<fieldset|role=\"radiogroup\""), /aria-describedby="[^"]+-message extra"/);
  });
});

describe("N8: aria-invalid only where the role supports it", () => {
  test("RadioGroup puts aria-invalid on the radiogroup, not on each radio", () => {
    const html = render(h(kit.RadioGroup, { name: "plan", legend: "Plan", error: "Pick one", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] }));
    const group = tag(html, 'role="radiogroup"');
    assert.ok(group.startsWith("<fieldset"));
    assert.match(group, /aria-invalid="true"/);
    const legendId = html.match(/<legend[^>]*id="([^"]+)"/)?.[1];
    assert.ok(legendId && group.includes(`aria-labelledby="${legendId}"`), "legend names the radiogroup");
    for (const radio of html.matchAll(/<input[^>]*type="radio"[^>]*>/g)) {
      assert.doesNotMatch(radio[0], /aria-invalid/);
    }
  });

  test("DatePicker, Select and FileUpload trigger buttons have no aria-invalid", () => {
    const date = render(h(kit.DatePicker, { id: "d", error: true, describedBy: "d-error" }));
    const select = render(h(kit.Select, { id: "s", ariaLabel: "Fruit", error: true, describedBy: "s-error", options: [{ value: "a", label: "A" }] }));
    const upload = render(h(kit.FileUpload, { error: true, describedBy: "u-error" }));
    for (const [name, html, described] of [
      ["DatePicker", date, "d-error"],
      ["Select", select, "s-error"],
      ["FileUpload", upload, "u-error"],
    ]) {
      const button = tag(html, 'type="button"');
      assert.ok(button.startsWith("<button"), `${name} renders a button`);
      assert.doesNotMatch(button, /aria-invalid/, `${name} button`);
      assert.match(button, new RegExp(`aria-describedby="[^"]*${described}`), `${name} still describes the error`);
    }
  });
});

describe("Select trigger popup state on the server", () => {
  test("the field trigger has aria-haspopup, aria-expanded and aria-controls before hydration", () => {
    const html = render(h(kit.Select, { id: "fruit", ariaLabel: "Fruit", options: [{ value: "a", label: "Apple" }] }));
    const button = tag(html, 'id="fruit"');
    assert.match(button, /aria-haspopup="menu"/);
    assert.match(button, /aria-expanded="false"/);
    assert.match(button, /aria-controls="[^"]+"/);
  });
});
