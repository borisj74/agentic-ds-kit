/**
 * SideNav.Item renderControl: wraps the row control inside the li (the compose twin of the preset's
 * renderItem), so a Popover or similar can anchor on it without breaking the list markup.
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
let SideNav;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  SideNav = await import("../dist/ui/SideNav/SideNavBlocks.js");
});

describe("SideNav.Item renderControl", () => {
  test("wraps the row control inside the li and keeps the control's attributes", () => {
    const html = render(
      h(
        SideNav.SideNavRoot,
        { "aria-label": "Workspace" },
        h(
          SideNav.SideNavNav,
          null,
          h(
            SideNav.SideNavSection,
            null,
            h(SideNav.SideNavItem, {
              label: "Notifications",
              icon: "Bell",
              badge: "3",
              "aria-expanded": false,
              renderControl: (control) => h("span", { "data-anchor": "notify" }, control),
            }),
          ),
        ),
      ),
    );
    assert.match(html, /<li[^>]*><span data-anchor="notify"><button[^>]*aria-expanded="false"/);
    assert.match(html, /Notifications/);
  });

  test("without renderControl the control sits straight in the li", () => {
    const html = render(
      h(
        SideNav.SideNavRoot,
        { "aria-label": "Workspace" },
        h(SideNav.SideNavNav, null, h(SideNav.SideNavSection, null, h(SideNav.SideNavItem, { label: "Tasks", icon: "Check" }))),
      ),
    );
    assert.match(html, /<li[^>]*><button/);
  });
});
