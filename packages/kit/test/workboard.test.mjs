/**
 * WorkBoard: cards resolve their assignee, moves are pure, and the drawer's Status, Assignee and
 * comments reach the block's onMove / onUpdate / onComment. Runs against the built kit (dist):
 * build first (npm run build -w agentic-ds-kit). CSS imports are stubbed so the block renders on
 * the server with react-dom/server.
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

const people = [
  { id: "maya", name: "Maya Chen" },
  { id: "omar", name: "Omar Haddad", initials: "OH" },
];

const columns = [
  { id: "todo", label: "To do", cardIds: ["t1", "t2"] },
  { id: "doing", label: "In progress", cardIds: ["t3"] },
  { id: "done", label: "Done", cardIds: [] },
];

const tasks = [
  { id: "t1", title: "Draft dunning emails", assigneeId: "maya", dueOn: "14 Nov", comments: [{ id: "c1", author: people[1], createdAt: "2h", body: "Use the new tone guide." }] },
  { id: "t2", title: "Tax rates for EU", tags: ["Billing"] },
  { id: "t3", title: "Invoice PDF footer", assigneeId: "omar" },
];

let logic;
let React;
let renderToStaticMarkup;
let WorkBoard;

before(async () => {
  logic = await import("../dist/ui/WorkBoard/workBoard.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ WorkBoard } = await import("../dist/ui/WorkBoard/WorkBoard.js"));
});

function render(props) {
  return renderToStaticMarkup(React.createElement(WorkBoard, { columns, tasks, people, onMove() {}, ...props }));
}

describe("WorkBoard logic", () => {
  test("cards carry the assignee from people", () => {
    const cards = logic.cardsFor(tasks, people);
    assert.equal(cards[0].assignee.name, "Maya Chen");
    assert.equal(cards[1].assignee, undefined);
    assert.equal(cards[2].assignee.initials, "OH");
  });

  test("moveWorkBoardTask moves a task between and within columns", () => {
    const moved = logic.moveWorkBoardTask(columns, "t1", "done", 0);
    assert.deepEqual(moved.map((c) => c.cardIds), [["t2"], ["t3"], ["t1"]]);
    const reordered = logic.moveWorkBoardTask(columns, "t2", "todo", 0);
    assert.deepEqual(reordered[0].cardIds, ["t2", "t1"]);
    assert.deepEqual(columns[0].cardIds, ["t1", "t2"], "input is not mutated");
  });

  test("the drawer description says column, due date and comment count", () => {
    assert.equal(logic.taskMeta(tasks[0], columns[0]), "Status: To do · due 14 Nov · 1 comment");
    assert.equal(logic.taskMeta(tasks[1], columns[0]), "Status: To do · 0 comments");
  });
});

describe("WorkBoard render", () => {
  test("a labelled section with an h2, the count and the board", () => {
    const html = render();
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"/);
    assert.match(html, /<h2[^>]*>Work board<\/h2>/);
    assert.ok(html.includes("3 tasks · 0 in Done"));
    for (const task of tasks) assert.ok(html.includes(task.title), task.title);
    assert.ok(html.includes("Maya Chen"));
  });
});

describe("WorkBoard callbacks", () => {
  test("Status moves to the end of the column, Assignee updates, posts carry the reply", () => {
    const calls = [];
    const handlers = logic.workBoardHandlers(columns, {
      onMove: (...args) => calls.push(["move", ...args]),
      onUpdate: (...args) => calls.push(["update", ...args]),
      onComment: (...args) => calls.push(["comment", ...args]),
    });
    handlers.status("t1", "doing");
    handlers.status("t1", "todo"); // already there: no move
    handlers.assignee("t2", "omar");
    handlers.assignee("t1", logic.UNASSIGNED);
    assert.equal(handlers.post("t1", "  On it  ", "c1"), true);
    assert.equal(handlers.post("t1", "   "), false);
    assert.deepEqual(calls, [
      ["move", "t1", "doing", 1],
      ["update", "t2", { assigneeId: "omar" }],
      ["update", "t1", { assigneeId: null }],
      ["comment", "t1", "On it", "c1"],
    ]);
  });

  test("missing callbacks are safe", () => {
    const handlers = logic.workBoardHandlers(columns, {});
    assert.doesNotThrow(() => {
      handlers.status("t1", "done");
      handlers.assignee("t1", "maya");
      handlers.post("t1", "hi");
    });
  });
});

describe("WorkBoard in the catalog (MCP)", () => {
  test("list_components and get_component return it as a block", async () => {
    const { getComponent, listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "workboard");
    assert.equal(row?.name, "WorkBoard");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Productivity");
    const { component } = getComponent("WorkBoard");
    assert.equal(component.import, 'import { WorkBoard } from "agentic-ds-kit";');
  });
});
