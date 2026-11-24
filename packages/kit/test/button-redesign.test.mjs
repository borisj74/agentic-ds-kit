/**
 * Button on the control-height scale, Button loading, the danger default icon, IconButton and
 * SplitButton. Server-rendered against dist (`npm test` builds first); CSS imports are stubbed,
 * and the stylesheets are read as text for the token checks.
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

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const json = (path) => JSON.parse(read(path));

let h;
let render;
let Button;
let IconButton;
let SplitButton;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
  ({ IconButton } = await import("../dist/ui/IconButton/IconButton.js"));
  ({ SplitButton } = await import("../dist/ui/SplitButton/SplitButton.js"));
});

const groups = [{ items: [{ id: "send", label: "Save and send" }, { id: "draft", label: "Save as draft" }] }];

describe("control-height tokens", () => {
  test("sm 32, md 36, lg 40 in tokens.json and tokens.css", () => {
    const tokens = json("tokens/tokens.json");
    assert.deepEqual(tokens.semantic.controlHeight, { sm: "primitive.space.8", md: "36px", lg: "primitive.space.10" });
    assert.equal(tokens.primitive.space["8"], "32px");
    assert.equal(tokens.primitive.space["10"], "40px");
    const css = read("lib/tokens.css");
    assert.match(css, /--control-height-sm: var\(--space-8\);/);
    assert.match(css, /--control-height-md: 36px;/);
    assert.match(css, /--control-height-lg: var\(--space-10\);/);
  });

  test("Button, the shared field classes, Select's field trigger and FilterButton read them", () => {
    for (const path of [
      "ui/Button/Button.module.css",
      "ui/shared/controls.module.css",
      "ui/DropdownMenu/DropdownMenu.module.css",
      "ui/FilterButton/FilterButton.module.css",
    ]) {
      const css = read(path);
      for (const step of ["sm", "md"]) assert.ok(css.includes(`var(--control-height-${step})`), `${path} ${step}`);
    }
  });

  test("an icon-only Button is a square of the control height", () => {
    const css = read("ui/Button/Button.module.css");
    for (const step of ["sm", "md", "lg"]) {
      assert.match(css, new RegExp(`\\.${step} \\{[^}]*--button-height: var\\(--control-height-${step}\\);`));
    }
    assert.match(css, /^\.button \{[^}]*min-height: var\(--button-height\);/);
    // One class only: `block` and a parent's width rule (Card footer) must still win.
    assert.match(css, /\n\.iconOnly \{\s*width: var\(--button-height\);\s*padding: 0;/);
    assert.doesNotMatch(css, /\.iconOnly\.(sm|md|lg)/);
    assert.ok(css.indexOf("\n.iconOnly {") < css.indexOf("\n.block {"));
  });
});

describe("Button styles", () => {
  test("disabled uses its own tokens, not opacity", () => {
    const css = read("ui/Button/Button.module.css");
    const disabled = css.match(/\.button:disabled \{([^}]*)\}/)[1];
    assert.match(disabled, /color: var\(--text-fg-disabled\);/);
    assert.match(disabled, /border-color: var\(--border-disabled\);/);
    assert.match(disabled, /background-color: var\(--surface-muted\);/);
    assert.doesNotMatch(css, /opacity-disabled/);
  });

  test("the default fill and border do not use the transparent keyword", () => {
    const base = read("ui/Button/Button.module.css").match(/^\.button \{([^}]*)\}/)[1];
    assert.doesNotMatch(base, /transparent/);
    assert.match(base, /border: var\(--border-control\) solid var\(--bg-control\);/);
  });
});

describe("Button loading", () => {
  test("sets aria-busy, keeps the label and shows a spinner", () => {
    const html = render(h(Button, { loading: true }, "Save invoice"));
    assert.match(html, /^<button[^>]*aria-busy="true"/);
    assert.match(html, /aria-disabled="true"/);
    assert.doesNotMatch(html, /^<button[^>]* disabled=""/);
    assert.match(html, /lucide-loader-circle/);
    assert.match(html, /<span>Save invoice<\/span>/);
  });

  test("the spinner takes the leading icon's place", () => {
    const html = render(h(Button, { loading: true, iconStart: "Download" }, "Export"));
    assert.match(html, /lucide-loader-circle/);
    assert.doesNotMatch(html, /lucide-download/);
  });

  test("icon-only keeps its name and one icon", () => {
    const html = render(h(Button, { loading: true, iconEnd: "Download", ariaLabel: "Download" }));
    assert.match(html, /aria-label="Download"/);
    assert.equal(html.match(/<svg/g).length, 1);
  });

  test("disabled wins over loading", () => {
    const html = render(h(Button, { loading: true, disabled: true }, "Save"));
    assert.match(html, /^<button[^>]* disabled=""/);
    assert.doesNotMatch(html, /aria-busy/);
    assert.doesNotMatch(html, /lucide-loader-circle/);
  });

  test("not loading: no aria-busy, and one passed in still lands", () => {
    assert.doesNotMatch(render(h(Button, null, "Save")), /aria-busy/);
    assert.match(render(h(Button, { "aria-busy": true }, "Save")), /aria-busy="true"/);
  });
});

describe("danger default icon", () => {
  test("solid, outline and soft danger get a warning icon when iconStart is empty", () => {
    for (const appearance of ["solid", "outline", "soft"]) {
      assert.match(render(h(Button, { mode: "danger", appearance }, "Revoke access")), /lucide-triangle-alert/);
    }
  });

  test("ghost danger, other modes and icon-only do not", () => {
    assert.doesNotMatch(render(h(Button, { mode: "danger", appearance: "ghost" }, "Remove")), /<svg/);
    assert.doesNotMatch(render(h(Button, { mode: "neutral", appearance: "outline" }, "Cancel")), /<svg/);
    const iconOnly = render(h(Button, { mode: "danger", iconEnd: "Trash2", ariaLabel: "Delete" }));
    assert.equal(iconOnly.match(/<svg/g).length, 1);
  });

  test("a given iconStart wins", () => {
    const html = render(h(Button, { mode: "danger", iconStart: "Trash2" }, "Delete invoice"));
    assert.match(html, /lucide-trash-2/);
    assert.doesNotMatch(html, /lucide-triangle-alert/);
  });
});

describe("IconButton", () => {
  test("renders the kit Button with the icon and the name", () => {
    const html = render(h(IconButton, { icon: "Download", ariaLabel: "Download", appearance: "outline", mode: "neutral" }));
    assert.match(html, /^<button[^>]*aria-label="Download"/);
    assert.match(html, /lucide-download/);
    assert.equal(html, render(h(Button, { iconStart: "Download", ariaLabel: "Download", appearance: "outline", mode: "neutral" })));
  });

  test("the contract requires icon and ariaLabel, and FilterButton allows SplitButton", () => {
    const contract = json("contracts/iconbutton.json");
    assert.equal(contract.props.icon.required, true);
    assert.equal(contract.props.ariaLabel.required, true);
    const filter = json("contracts/filterbutton.json");
    assert.ok(!filter.doNot.some((line) => /Do not invent[^—]*SplitButton/.test(line)));
    assert.ok(filter.doNot.some((line) => line.includes("SplitButton is the one for actions")));
  });
});

describe("SplitButton", () => {
  test("a main button and a chevron button that opens a menu", () => {
    const html = render(h(SplitButton, { groups }, "Save invoice"));
    assert.equal(html.match(/<button/g).length, 2);
    assert.match(html, /<span>Save invoice<\/span>/);
    assert.match(html, /<button[^>]*aria-label="Save invoice options"/);
    // aria-haspopup and aria-expanded are set by DropdownMenu on the client, as for every menu trigger.
    assert.match(html, /lucide-chevron-down/);
  });

  test("menuLabel names the chevron; disabled reaches both parts; loading only the main one", () => {
    assert.match(render(h(SplitButton, { groups, menuLabel: "More save actions" }, "Save")), /aria-label="More save actions"/);
    assert.equal(render(h(SplitButton, { groups, disabled: true }, "Save")).match(/ disabled=""/g).length, 2);
    const loading = render(h(SplitButton, { groups, loading: true }, "Save"));
    assert.equal(loading.match(/aria-busy="true"/g).length, 1);
    assert.doesNotMatch(loading, / disabled=""/);
  });
});
