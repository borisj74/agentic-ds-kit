/**
 * Badge and Avatar redesign: Delta atom, Avatar sizes / shape / presence, Badge tone icon,
 * Cell and Scorecard deltas through Delta, MultiSelect +N as Count, AvatarGroup +N name.
 * Runs against the built kit (dist); `npm test` builds first.
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
    ...(await import("../dist/ui/Delta/Delta.js")),
    ...(await import("../dist/ui/Avatar/Avatar.js")),
    ...(await import("../dist/ui/AvatarGroup/AvatarGroup.js")),
    ...(await import("../dist/ui/Badge/Badge.js")),
    ...(await import("../dist/ui/Cell/Cell.js")),
    ...(await import("../dist/ui/Scorecard/Scorecard.js")),
    ...(await import("../dist/ui/MultiSelect/MultiSelect.js")),
    ...(await import("../dist/ui/shared/labels.js")),
  };
});

describe("Delta", () => {
  test("shows the signed value with an aria-hidden arrow", () => {
    const html = render(h(kit.Delta, { value: "+$600", direction: "up" }));
    assert.match(html, /\+\$600/);
    assert.match(html, /<svg[^>]*aria-hidden="true"/);
  });

  test("each direction draws a different arrow", () => {
    const up = render(h(kit.Delta, { value: "+1", direction: "up" }));
    const down = render(h(kit.Delta, { value: "−1", direction: "down" }));
    const flat = render(h(kit.Delta, { value: "No change", direction: "flat" }));
    assert.notEqual(up.match(/<svg[\s\S]*<\/svg>/)[0], down.match(/<svg[\s\S]*<\/svg>/)[0]);
    assert.notEqual(up.match(/<svg[\s\S]*<\/svg>/)[0], flat.match(/<svg[\s\S]*<\/svg>/)[0]);
  });
});

describe("Avatar", () => {
  test("presence word joins the accessible name", () => {
    const html = render(h(kit.Avatar, { name: "Ana Ruiz", presence: "online" }));
    assert.match(html, /aria-label="Ana Ruiz, Online"/);
  });

  test("presence words are translatable", () => {
    const html = render(
      h(kit.KitLabelsProvider, { labels: { away: "Abwesend" } }, h(kit.Avatar, { name: "Mira Chen", presence: "away" })),
    );
    assert.match(html, /aria-label="Mira Chen, Abwesend"/);
  });

  test("photo alt carries presence too", () => {
    const html = render(h(kit.Avatar, { name: "Leo Sato", src: "/leo.jpg", presence: "offline" }));
    assert.match(html, /alt="Leo Sato, Offline"/);
  });

  test("no presence keeps the plain name", () => {
    const html = render(h(kit.Avatar, { name: "Northwind Traders", shape: "square", size: "xs" }));
    assert.match(html, /aria-label="Northwind Traders"/);
    assert.match(html, />NT</);
  });

  test("the same name always gets the same tint class", () => {
    const a = render(h(kit.Avatar, { name: "Ana Ruiz" }));
    const b = render(h(kit.Avatar, { name: "Ana Ruiz" }));
    assert.equal(a, b);
  });
});

describe("AvatarGroup", () => {
  test("+N is a named image", () => {
    const items = ["A B", "C D", "E F", "G H", "I J"].map((name) => ({ name }));
    const html = render(h(kit.AvatarGroup, { items, max: 3, size: "xs" }));
    assert.match(html, /role="img" aria-label="2 more"|aria-label="2 more"[^>]*role="img"/);
  });
});

describe("KitLabels for overflow counts", () => {
  test("AvatarGroup +N uses moreAvatars", () => {
    const items = ["A B", "C D", "E F", "G H"].map((name) => ({ name }));
    const html = render(
      h(kit.KitLabelsProvider, { labels: { moreAvatars: (n) => `${n} weitere` } }, h(kit.AvatarGroup, { items, max: 2 })),
    );
    assert.match(html, /aria-label="2 weitere"/);
  });

  test("MultiSelect overflow uses moreSelected", () => {
    const options = ["Design", "Finance", "Legal"].map((v) => ({ value: v, label: v }));
    const html = render(
      h(
        kit.KitLabelsProvider,
        { labels: { moreSelected: "weitere ausgewählt" } },
        h(kit.MultiSelect, { id: "t", options, defaultValue: ["Design", "Finance", "Legal"], maxVisible: 1 }),
      ),
    );
    assert.match(html, /2 weitere ausgewählt/);
  });
});

describe("Badge", () => {
  test("tone icon is aria-hidden and the word stays", () => {
    const html = render(h(kit.Badge, { tone: "danger", icon: "CircleX" }, "Overdue"));
    assert.match(html, /<svg[^>]*aria-hidden="true"/);
    assert.match(html, /Overdue/);
  });

  test("no icon by default", () => {
    const html = render(h(kit.Badge, {}, "Admin"));
    assert.doesNotMatch(html, /<svg/);
  });
});

describe("Cell and Scorecard compose Delta", () => {
  test("Cell trendPositive renders a Delta with the value", () => {
    const html = render(h(kit.Cell, { type: "trendPositive", value: "+$600" }));
    assert.match(html, /lucide-arrow-up/);
    assert.match(html, /\+\$600/);
  });

  test("Cell trend with text false keeps the root aria-label", () => {
    const html = render(h(kit.Cell, { type: "trendNegative", value: "−$90", text: false }));
    assert.match(html, /aria-label="Down −\$90"/);
  });

  test("Scorecard delta renders a Delta", () => {
    const html = render(h(kit.Scorecard, { label: "MRR", value: "$412.6k", delta: "+10.9%", trend: "up" }));
    assert.match(html, /lucide-arrow-up/);
  });

  test("Scorecard status delta (trend neutral + deltaTone) is not a Delta", () => {
    const html = render(h(kit.Scorecard, { label: "Overdue", value: "$12.4k", delta: "3 urgent", deltaTone: "warning" }));
    assert.doesNotMatch(html, /lucide-arrow/);
    assert.match(html, /3 urgent/);
  });
});

describe("MultiSelect", () => {
  test("overflow is a kit Count, not a Badge", () => {
    const options = ["Design", "Finance", "Legal", "Sales"].map((v) => ({ value: v, label: v }));
    const html = render(
      h(kit.MultiSelect, { id: "teams", options, defaultValue: ["Design", "Finance", "Legal", "Sales"], maxVisible: 2 }),
    );
    assert.match(html, /2 more selected/);
    assert.match(html, /aria-hidden="true">\+2</);
  });
});
