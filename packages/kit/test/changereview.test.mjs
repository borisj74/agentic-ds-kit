/**
 * ChangeReview: files list, selected file's diff and comments, per-file verdicts and Accept all.
 * Logic, SSR render through the CSS stub, one solid primary, keys and callbacks. Runs against
 * the built kit (dist): build first (npm run build -w agentic-ds-kit).
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

const files = [
  {
    id: "f1",
    path: "src/middleware/rateLimit.ts",
    kind: "added",
    lines: [
      { type: "add", text: "export const limit = 100;", newNo: 1 },
      { type: "add", text: "export function rateLimit() {}", newNo: 2 },
    ],
    reviewed: true,
  },
  {
    id: "f2",
    path: "src/app.ts",
    lines: [
      { type: "context", text: "const app = express();", oldNo: 4, newNo: 4 },
      { type: "remove", text: "app.use(cors());", oldNo: 5 },
      { type: "add", text: "app.use(cors(), rateLimit());", newNo: 5 },
    ],
    verdict: "accepted",
  },
  { id: "f3", path: "README.md", additions: 4, deletions: 0, lines: [{ type: "add", text: "## Rate limits", newNo: 40 }] },
];

const me = { id: "u1", name: "Maya Chen" };
const comments = [
  { id: "c1", fileId: "f1", line: 1, author: me, createdAt: "2m", body: "Make this configurable." },
  { id: "c2", fileId: "f2", author: me, createdAt: "1m", body: "Looks right." },
];

let logic;
let React;
let renderToStaticMarkup;
let ChangeReview;
let Button;
let ListView;
let CommentThread;
let Checkbox;
let InlineDiff;

before(async () => {
  logic = await import("../dist/ui/ChangeReview/changeReview.logic.js");
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ ChangeReview } = await import("../dist/ui/ChangeReview/ChangeReview.js"));
  ({ Button } = await import("../dist/ui/Button/Button.js"));
  ({ ListView } = await import("../dist/ui/ListView/ListView.js"));
  ({ CommentThread } = await import("../dist/ui/CommentThread/CommentThread.js"));
  ({ Checkbox } = await import("../dist/ui/Checkbox/Checkbox.js"));
  ({ InlineDiff } = await import("../dist/ui/InlineDiff/InlineDiff.js"));
});

const handlers = { onAccept() {}, onReject() {}, onAcceptAll() {}, onComment() {}, onReviewedChange() {} };

function render(props) {
  return renderToStaticMarkup(React.createElement(ChangeReview, { files, comments, ...props }));
}

function tree(props) {
  let out;
  renderToStaticMarkup(
    React.createElement(function Probe() {
      out = ChangeReview({ files, comments, ...props });
      return out;
    }),
  );
  return out;
}

function findAll(node, type, hits = []) {
  if (!node || typeof node !== "object") return hits;
  if (Array.isArray(node)) {
    for (const child of node) findAll(child, type, hits);
    return hits;
  }
  if (node.type === type) hits.push(node);
  findAll(node.props?.children, type, hits);
  return hits;
}

const solidPrimaries = (html) => (html.match(/_solid_\w+ _primary_/g) ?? []).length;

describe("ChangeReview logic", () => {
  test("counts, names and rows", () => {
    assert.deepEqual(logic.lineCounts(files[1]), { additions: 1, deletions: 1 });
    assert.deepEqual(logic.lineCounts(files[2]), { additions: 4, deletions: 0 });
    assert.equal(logic.fileName(files[0].path), "rateLimit.ts");
    assert.equal(logic.folderOf("README.md"), "");
    const rows = logic.fileItems(files);
    assert.equal(rows[0].secondary, "New file · src/middleware · +2 −0 · Reviewed");
    assert.equal(rows[0].icon, "FilePlus");
    assert.equal(rows[1].secondary, "src · +1 −1 · Accepted");
    assert.equal(rows[1].badgeTone, "success");
    assert.equal(rows[2].secondary, "root · +4 −0 · Not reviewed");
    assert.equal(rows[2].badge, undefined);
  });

  test("summary, undecided files and neighbours", () => {
    assert.equal(logic.reviewSummary(files, "Backend agent"), "Backend agent changed 3 files · +7 −1 · 1 of 3 reviewed");
    assert.deepEqual(logic.undecided(files).map((f) => f.id), ["f1", "f3"]);
    assert.equal(logic.neighbour(files, "f1", 1), "f2");
    assert.equal(logic.neighbour(files, "f1", -1), null);
    assert.equal(logic.neighbour(files, "f3", 1), null);
  });

  test("diff status, thread and line targets", () => {
    assert.equal(logic.diffStatus(files[0]), "pending");
    assert.equal(logic.diffStatus(files[1]), "accepted");
    assert.equal(logic.threadFor(comments, "f1")[0].body, "Line 1 · Make this configurable.");
    assert.equal(logic.threadFor(comments, "f2")[0].body, "Looks right.");
    assert.deepEqual(logic.lineTargets(files[1]).map((o) => o.value), ["file", "5", "5"]);
    assert.match(logic.lineTargets(files[1])[1].label, /^Line 5 − app\.use/);
  });

  test("keys never fire while typing", () => {
    assert.equal(logic.reviewKey("j", { tagName: "DIV" }), "next");
    assert.equal(logic.reviewKey("k", { tagName: "BUTTON" }), "previous");
    assert.equal(logic.reviewKey("r", null), "reviewed");
    assert.equal(logic.reviewKey("j", { tagName: "TEXTAREA" }), null);
    assert.equal(logic.reviewKey("r", { tagName: "INPUT" }), null);
    assert.equal(logic.reviewKey("x", { tagName: "DIV" }), null);
  });
});

describe("ChangeReview render", () => {
  test("a labelled section with the list, the selected file and its comments", () => {
    const html = render(handlers);
    assert.match(html, /<section[^>]*aria-labelledby="[^"]+"[^>]*aria-describedby="[^"]+"/);
    assert.match(html, /<h2[^>]*>Change review<\/h2>/);
    for (const text of ["Changed files, 3 · 1 reviewed", "rateLimit.ts", "File 1 of 3", "Comments on rateLimit.ts", "Line 1 · Make this configurable.", "Accept all 2 files", "Reject file", "Accept file"]) {
      assert.ok(html.includes(text), text);
    }
    assert.ok(!html.includes("Looks right."), "only the selected file's comments");
  });

  test("Accept all is the one solid primary; the thread's Comment goes soft", () => {
    assert.equal(solidPrimaries(render(handlers)), 1);
    const node = tree(handlers);
    assert.equal(findAll(node, CommentThread)[0].props.submitAppearance, "soft");
    assert.equal(findAll(node, InlineDiff)[0].props.onAccept, undefined);
  });

  test("an accepted file shows InlineDiff's resolved row and a pressed Accept", () => {
    const html = render({ ...handlers, defaultSelectedFileId: "f2" });
    assert.ok(html.includes("File 2 of 3"));
    const node = tree({ ...handlers, defaultSelectedFileId: "f2" });
    const accept = findAll(node, Button).find((b) => b.props.children === "Accept file");
    assert.equal(accept.props["aria-pressed"], true);
    assert.equal(findAll(node, InlineDiff)[0].props.status, "accepted");
  });

  test("all decided: Accept all is disabled", () => {
    const decided = files.map((f) => ({ ...f, verdict: "accepted" }));
    const node = tree({ ...handlers, files: decided });
    const all = findAll(node, Button).find((b) => b.props.children === "All files decided");
    assert.equal(all.props.disabled, true);
  });
});

describe("ChangeReview callbacks", () => {
  test("select, reviewed, accept, reject, accept all and comment reach the props", () => {
    const calls = [];
    const node = tree({
      selectedFileId: "f1",
      onSelectFile: (id) => calls.push(["select", id]),
      onReviewedChange: (id, value) => calls.push(["reviewed", id, value]),
      onAccept: (id) => calls.push(["accept", id]),
      onReject: (id) => calls.push(["reject", id]),
      onAcceptAll: () => calls.push(["all"]),
      onComment: (id, body, options) => calls.push(["comment", id, body, options.line]),
    });
    findAll(node, ListView)[0].props.onSelectedChange(["f3"]);
    findAll(node, Checkbox)[0].props.onChange(false);
    const buttons = findAll(node, Button);
    buttons.find((b) => b.props.children === "Accept file").props.onClick();
    buttons.find((b) => b.props.children === "Reject file").props.onClick();
    buttons.find((b) => b.props.children === "Accept all 2 files").props.onClick();
    buttons.find((b) => b.props.ariaLabel === "Next file: app.ts").props.onClick();
    assert.deepEqual(calls, [["select", "f3"], ["reviewed", "f1", false], ["accept", "f1"], ["reject", "f1"], ["all"], ["select", "f2"]]);
  });

  test("J / K / R on the block move and mark the file", () => {
    const calls = [];
    const node = tree({ selectedFileId: "f2", onSelectFile: (id) => calls.push(["select", id]), onReviewedChange: (id, v) => calls.push(["reviewed", id, v]) });
    const press = (key) => node.props.onKeyDown({ key, target: { tagName: "DIV" }, preventDefault() {}, defaultPrevented: false });
    press("j");
    press("k");
    press("r");
    node.props.onKeyDown({ key: "j", target: { tagName: "TEXTAREA" }, preventDefault() {}, defaultPrevented: false });
    assert.deepEqual(calls, [["select", "f3"], ["select", "f1"], ["reviewed", "f2", true]]);
  });
});

describe("ChangeReview in the catalog (MCP)", () => {
  test("list_components returns it as an Agents block", async () => {
    const { listComponents } = await import("../bin/catalog.mjs");
    const row = listComponents().components.find((item) => item.id === "changereview");
    assert.equal(row?.name, "ChangeReview");
    assert.equal(row.kind, "block");
    assert.equal(row.block.category, "Agents");
  });
});
