/**
 * ActivityFeed: day groups, one sentence per event, filters, empty states and Load more. Runs
 * against the built kit (dist): build first (npm run build -w agentic-ds-kit). CSS imports are
 * stubbed so the block renders on the server with react-dom/server.
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

const NOW = Date.UTC(2026, 10, 12, 15, 0); // Thu 12 Nov 2026, 15:00 UTC
const HOUR = 3_600_000;
const maya = { id: "maya", name: "Maya Chen" };
const tomas = { id: "tomas", name: "Tomás Rivera" };
const relay = { id: "relay", name: "Relay", kind: "agent" };

const events = [
  { id: "e1", type: "comment", actor: maya, verb: "commented on", object: "Pricing page copy", at: NOW - 1 * HOUR, detail: "Can we lead with the yearly price?" },
  { id: "e2", type: "run", actor: relay, verb: "finished a run on", object: "Weekly churn report", at: NOW - 3 * HOUR, status: { label: "Failed", tone: "danger" } },
  { id: "e3", type: "change", actor: tomas, verb: "merged", object: "PR #482", at: NOW - 20 * HOUR },
  { id: "e4", type: "member", actor: maya, verb: "invited", object: "Priya Nair", at: new Date(NOW - 26 * HOUR).toISOString() },
  { id: "e5", type: "billing", actor: tomas, verb: "paid", object: "invoice INV-1042", at: NOW - 4 * 24 * HOUR, status: { label: "Paid", tone: "success" } },
];

let logic;
let React;
let renderToStaticMarkup;
let ActivityFeed;

before(async () => {
  logic = await import("../dist/ui/ActivityFeed/activityFeed.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ActivityFeed } = await import("../dist/ui/ActivityFeed/ActivityFeed.js"));
});

function render(props) {
  return renderToStaticMarkup(
    React.createElement(ActivityFeed, { events, now: NOW, timeZone: "UTC", onOpen() {}, onReply() {}, ...props }),
  );
}

describe("ActivityFeed logic", () => {
  test("newest first, grouped Today, Yesterday, then a date", () => {
    const sorted = logic.visibleEvents(events, logic.NO_FILTERS);
    assert.deepEqual(sorted.map((e) => e.id), ["e1", "e2", "e3", "e4", "e5"]);
    const days = logic.groupByDay(sorted, NOW, "en-GB", "UTC");
    assert.deepEqual(
      days.map((d) => [d.label, d.events.length]),
      [["Today", 2], ["Yesterday", 2], ["Sun 8 Nov", 1]],
    );
  });

  test("a date from another year carries the year", () => {
    assert.equal(logic.dayLabel(Date.UTC(2025, 11, 30, 12), NOW, "en-GB", "UTC"), "Tue 30 Dec 2025");
  });

  test("each event is one sentence, agents named as agents", () => {
    assert.equal(
      logic.eventSentence(events[0], NOW, "en-GB", "UTC"),
      "Maya Chen commented on Pricing page copy. Can we lead with the yearly price? Today at 14:00.",
    );
    assert.equal(
      logic.eventSentence(events[1], NOW, "en-GB", "UTC"),
      "Relay, an agent, finished a run on Weekly churn report: Failed. Today at 12:00.",
    );
  });

  test("filters by type and by person, together", () => {
    const byType = logic.visibleEvents(events, { types: ["comment", "member"], people: [] });
    assert.deepEqual(byType.map((e) => e.id), ["e1", "e4"]);
    const both = logic.visibleEvents(events, { types: ["comment", "member"], people: ["tomas"] });
    assert.deepEqual(both, []);
    assert.equal(logic.isFiltered(logic.NO_FILTERS), false);
  });

  test("people before agents, A–Z; counts per type", () => {
    assert.deepEqual(logic.actorsOf(events).map((a) => a.id), ["maya", "tomas", "relay"]);
    assert.deepEqual(logic.typeCounts(events), { comment: 1, change: 1, run: 1, member: 1, billing: 1 });
  });

  test("chip shows the one value, or a count", () => {
    assert.deepEqual(logic.chipState([], String), {});
    assert.deepEqual(logic.chipState(["comment"], (id) => logic.TYPE_PLURAL[id]), { value: "Comments" });
    assert.deepEqual(logic.chipState(["a", "b"], String), { count: 2 });
  });

  test("count line and the Load more announcement", () => {
    assert.equal(logic.summaryLine(5, 5, false), "5 events across the workspace");
    assert.equal(logic.summaryLine(5, 2, true), "2 of 5 events match the filters");
    assert.equal(logic.loadedMessage(3, 3, false, true), "3 more events loaded.");
    assert.equal(logic.loadedMessage(3, 1, true, false), "3 more events loaded, 1 matches the filters. That's all the activity.");
    assert.equal(logic.loadedMessage(0, 0, false, false), "No more activity.");
  });
});

describe("ActivityFeed render", () => {
  test("a labelled section with an h2, day h3s and the filters", () => {
    const html = render();
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"/);
    assert.match(html, /<h2[^>]*>Activity<\/h2>/);
    assert.ok(html.includes("5 events across the workspace"));
    assert.match(html, /<h3[^>]*>Today<span[^>]*>, 2 events<\/span><\/h3>/);
    assert.match(html, /<h3[^>]*>Yesterday/);
    assert.match(html, /role="group" aria-label="Filter activity"/);
    assert.ok(html.includes(">Type<") && html.includes(">Person<"));
    assert.ok(!html.includes("Clear filters"));
  });

  test("each event reads as its sentence; the visual row is hidden", () => {
    const html = render();
    assert.ok(html.includes("Relay, an agent, finished a run on Weekly churn report: Failed. Today at 12:00."));
    assert.equal((html.match(/<li[^>]*tabindex="-1"/g) ?? []).length, 5);
    assert.ok(html.includes('aria-hidden="true"'));
    assert.ok(html.includes(">Agent<") && html.includes(">Failed<"));
  });

  test("Open on every event, Reply only on comments, both named", () => {
    const html = render();
    assert.equal((html.match(/>Open</g) ?? []).length, 5);
    assert.equal((html.match(/>Reply</g) ?? []).length, 1);
    assert.match(html, /<button[^>]*id="([^"]+)-open"[^>]*aria-labelledby="\1-open \1-object"/);
    assert.ok(html.includes("to Maya Chen"));
    assert.ok(!render({ onOpen: undefined, onReply: undefined }).includes(">Open<"));
  });

  test("filters: a picked type shows on its chip and narrows the feed; Clear filters shows", () => {
    const html = render({ filters: { types: ["comment"], people: [] } });
    assert.ok(html.includes("1 of 5 events match the filters"));
    assert.ok(html.includes("Comments"));
    assert.ok(html.includes("Clear filters"));
    assert.ok(!html.includes("Weekly churn report"));
  });

  test("empty states: nothing yet, and nothing matches", () => {
    const none = render({ events: [] });
    assert.ok(none.includes("No activity yet") && !none.includes("Filter activity"));
    const miss = render({ defaultFilters: { types: ["billing"], people: ["maya"] } });
    assert.ok(miss.includes("Nothing matches these filters"));
  });

  test("loading: skeleton feed, then skeleton rows and Loading… under the list", () => {
    const first = render({ events: [], loading: true });
    assert.ok(first.includes("Loading activity") && !first.includes("No activity yet"));
    const more = render({ loading: true, hasMore: true, onLoadMore() {} });
    assert.ok(more.includes("Loading more activity"));
    assert.match(more, /<button[^>]*aria-busy="true"[^>]*>.*Loading…/);
  });

  test("Load more shows only with hasMore and onLoadMore; a polite status region is there", () => {
    assert.ok(render({ hasMore: true, onLoadMore() {} }).includes("Load more"));
    assert.ok(!render({ hasMore: false, onLoadMore() {} }).includes("Load more"));
    assert.ok(!render({ hasMore: true }).includes("Load more"));
    assert.match(render(), /<p role="status"/);
  });
});

describe("ActivityFeed in the catalog (MCP)", () => {
  test("list_components and get_component return it as a block", async () => {
    const { getComponent, listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "activityfeed");
    assert.equal(row?.name, "ActivityFeed");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Productivity");
    const { component } = getComponent("ActivityFeed");
    assert.equal(component.import, 'import { ActivityFeed } from "agentic-ds-kit";');
  });
});
