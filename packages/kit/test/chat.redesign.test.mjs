/**
 * Chat redesign: data-answer parts, guided empty state, step lists, Stop, streaming and error.
 * SSR through the CSS stub. Runs against the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

let React;
let renderToStaticMarkup;
let Chat;
let formatStepDuration;
let totalStepDuration;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ Chat, formatStepDuration, totalStepDuration } = await import("../dist/ui/Chat/Chat.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(Chat, { title: "Assistant", messages: [], ...props }));
}

const ANSWER = {
  role: "assistant",
  content: "MRR grew to $412.6k.",
  parts: [
    { type: "metrics", items: [{ label: "MRR", value: "$412.6k", delta: "+10.9%", trend: "up" }] },
    {
      type: "table",
      columns: [
        { key: "m", header: "Movement" },
        { key: "a", header: "Amount", align: "end", numeric: true },
      ],
      rows: [{ m: "New", a: "$79.8k" }],
      footer: { label: "Net new MRR", value: "$40.7k" },
    },
    { type: "chart", label: "MRR · weekly", range: "Aug 28 – Nov 20", data: [{ label: "A", value: 1 }, { label: "B", value: 2 }] },
    { type: "sources", label: "Sources: MRR movements" },
    { type: "followups", items: ["Churn by plan"] },
  ],
};

describe("Chat data answers", () => {
  test("parts render in order under the text", () => {
    const html = render({ messages: [ANSWER] });
    const order = ["MRR grew to", "$412.6k", "Movement", "Net new MRR", "MRR · weekly", "Sources: MRR movements", "Churn by plan"];
    let last = -1;
    for (const text of order) {
      const at = html.indexOf(text, last + 1);
      assert.ok(at > last, `${text} after the part before it`);
      last = at;
    }
    assert.match(html, /<table/);
  });

  test("parts are ignored on user messages", () => {
    const html = render({ messages: [{ ...ANSWER, role: "user" }] });
    assert.ok(!html.includes("Sources: MRR movements"));
  });

  test("steps collapse into one expandable row", () => {
    const html = render({
      messages: [{ ...ANSWER, steps: [{ label: "Read", status: "done", durationMs: 800 }, { label: "Write", status: "done", durationMs: 1600 }] }],
    });
    assert.match(html, /aria-expanded="false"[^>]*>|aria-expanded="false"/);
    assert.ok(html.includes("2 steps · 2.4s"));
  });
});

describe("Chat working states", () => {
  test("thinkingSteps show a live list with the active step marked and status in words", () => {
    const html = render({
      isThinking: true,
      thinkingSteps: [
        { label: "Reading", status: "done", durationMs: 800 },
        { label: "Comparing", status: "active" },
        { label: "Writing", status: "pending" },
      ],
    });
    assert.match(html, /<ol/);
    assert.match(html, /aria-current="step"[^>]*>.*Comparing/s);
    assert.ok(html.includes("(in progress)") && html.includes("(waiting)") && html.includes("(done)"));
    assert.ok(html.includes("0.8s"));
  });

  test("onStop swaps Send for Stop while thinking", () => {
    const html = render({ isThinking: true, onStop: () => {} });
    assert.ok(html.includes(">Stop<"));
    assert.ok(!html.includes('aria-label="Send"'));
    assert.match(html, /placeholder="Working…"/);
  });

  test("without onStop, Send stays", () => {
    const html = render({ isThinking: true });
    assert.ok(html.includes('aria-label="Send"'));
  });

  test("streaming shows a caret and marks the message busy", () => {
    const html = render({ messages: [{ role: "assistant", status: "streaming", content: "MRR grew" }] });
    assert.match(html, /<article[^>]*aria-busy="true"/);
    assert.match(html, /<div role="log"[^>]*aria-busy="true"|aria-busy="true"/);
  });

  test("error shows an alert with title, Retry and Copy details", () => {
    const html = render({
      messages: [
        {
          role: "assistant",
          status: "error",
          content: "",
          error: { title: "Couldn’t read MRR movements", description: "Timed out.", onRetry: () => {}, onCopyDetails: () => {} },
        },
      ],
    });
    assert.match(html, /role="alert"/);
    assert.ok(html.includes("Couldn’t read MRR movements"));
    assert.ok(html.includes(">Retry<") && html.includes(">Copy details<"));
  });
});

describe("Chat guided empty", () => {
  test("greeting, intro, context, rich suggestions and recents", () => {
    const html = render({
      greeting: "Good morning, Ada",
      intro: "Ask about this dashboard.",
      context: { label: "Revenue overview" },
      suggestions: [{ label: "What drove MRR?", hint: "Looks at MRR movements", icon: "TrendingUp" }],
      recent: [{ label: "Compare ARPA by plan", meta: "Yesterday" }],
    });
    const order = ["Good morning, Ada", "Ask about this dashboard.", ">Revenue overview<", "What drove MRR?", "Looks at MRR movements", "Compare ARPA by plan", "<form"];
    let last = -1;
    for (const text of order) {
      const at = html.indexOf(text, last + 1);
      assert.ok(at > last, `${text} in order`);
      last = at;
    }
    assert.ok(!html.includes("Start a conversation."));
  });

  test("empty recent shows recentEmptyLabel", () => {
    const html = render({ greeting: "Hi Ada", recent: [], recentEmptyLabel: "Your recent questions show up here." });
    assert.ok(html.includes("Your recent questions show up here."));
  });

  test("plain strings keep the old Buttons and empty text", () => {
    const html = render({ suggestions: ["Draft an update"] });
    assert.ok(html.includes("Start a conversation."));
    assert.ok(html.includes("Draft an update"));
  });
});

describe("step time helpers", () => {
  test("format and total", () => {
    assert.equal(formatStepDuration(800), "0.8s");
    assert.equal(formatStepDuration(undefined), undefined);
    assert.equal(totalStepDuration([{ label: "a", status: "done", durationMs: 800 }, { label: "b", status: "done" }]), "0.8s");
    assert.equal(totalStepDuration([{ label: "a", status: "pending" }]), undefined);
  });
});

describe("Chat streaming while thinking", () => {
  test("no thinking row under a streaming answer", () => {
    const html = render({ isThinking: true, messages: [{ role: "assistant", status: "streaming", content: "MRR grew" }] });
    assert.ok(!html.includes(">Thinking<"));
  });
});

describe("Chat review fixes", () => {
  test("an error message can carry the failed step as its text, with no step row", () => {
    const html = render({
      messages: [
        {
          role: "assistant",
          status: "error",
          content: "Reading MRR movements · failed at step 1",
          error: { title: "Couldn’t read MRR movements", onRetry: () => {} },
        },
      ],
    });
    assert.ok(html.includes("Reading MRR movements · failed at step 1"));
    assert.ok(!/\d+ steps? ·/.test(html), "no collapsed step row");
    assert.ok(html.indexOf("failed at step 1") < html.indexOf('role="alert"'));
  });

  test("the in-chat chart has no Table toggle", () => {
    const html = render({ messages: [ANSWER] });
    assert.ok(html.includes("MRR · weekly"));
    assert.ok(!/<button[^>]*aria-expanded="false"[^>]*>(?:(?!<\/button>).)*Table/s.test(html), "no Table toggle button");
  });
});
