/**
 * NotificationStack and CommentThread from the redesign board: groups, row actions, the rail marker
 * and New badge, mentions and the @ member list. Runs against the built kit (dist); `npm test` builds first.
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
let NotificationStack;
let groupItems;
let CommentThread;
let splitMentions;
let mentionQuery;
let matchMembers;

const noop = () => {};
const ITEMS = [
  { id: "a", title: "Payment failed", body: "INV-1842", createdAt: "09:42", read: false, tone: "danger", group: "Today", action: { label: "Retry payment", onClick: noop } },
  { id: "b", title: "Invoice paid", createdAt: "16:20", read: true, tone: "success", group: "Yesterday" },
  { id: "c", title: "Dispute opened", createdAt: "08:15", read: false, tone: "warning", group: "Today" },
];
const PRIYA = { id: "p", name: "Priya Shah" };
const DANIEL = { id: "d", name: "Daniel Okafor" };
const MEMBERS = [
  { ...PRIYA, role: "Billing ops" },
  { id: "n", name: "Paul Nguyen", role: "Support" },
];

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  ({ NotificationStack, groupItems } = await import("../dist/ui/NotificationStack/NotificationStack.js"));
  ({ CommentThread, splitMentions, mentionQuery, matchMembers } = await import("../dist/ui/CommentThread/CommentThread.js"));
});

describe("NotificationStack", () => {
  test("groupItems gathers by group in first-seen order", () => {
    const sections = groupItems(ITEMS);
    assert.deepEqual(
      sections.map((s) => [s.heading, s.items.map((i) => i.id)]),
      [
        ["Today", ["a", "c"]],
        ["Yesterday", ["b"]],
      ],
    );
    assert.deepEqual(groupItems([{ id: "x", title: "x", createdAt: "1m", read: true }]).map((s) => s.heading), [undefined]);
  });

  test("inline renders group headings, New badges, the row action and ghost/outline buttons", () => {
    const html = render(h(NotificationStack, { inline: true, items: ITEMS, onItemClick: noop, onMarkAll: noop, onViewAll: noop }));
    assert.match(html, /<h4[^>]*>Today<\/h4>/);
    assert.match(html, /<h4[^>]*>Yesterday<\/h4>/);
    assert.equal((html.match(/>New<\/span>/g) ?? []).length, 2, "one New badge per unread item");
    assert.equal((html.match(/New\. <\/span>/g) ?? []).length, 2, "unread rows say New to screen readers");
    assert.match(html, />Retry payment</);
    assert.match(html, />Mark all read</);
    assert.match(html, />View all notifications</);
    assert.match(html, /aria-live="polite"/);
    // The row action is a sibling of the row button, never nested in it.
    assert.doesNotMatch(html, /<button[^>]*>(?:(?!<\/button>).)*<button/s);
  });

  test("the bell is named with the unread count", () => {
    const html = render(h(NotificationStack, { items: ITEMS }));
    assert.match(html, /aria-label="Notifications, 2 unread"/);
  });
});

describe("CommentThread mentions", () => {
  test("splitMentions marks known full names only", () => {
    const parts = splitMentions("@Daniel Okafor the card failed. @Mara call me", ["Daniel Okafor", "Priya Shah"]);
    assert.deepEqual(
      parts.filter((p) => p.mention).map((p) => p.text),
      ["@Daniel Okafor"],
    );
    assert.equal(parts.map((p) => p.text).join(""), "@Daniel Okafor the card failed. @Mara call me");
  });

  test("mentionQuery reads the @word before the caret", () => {
    assert.deepEqual(mentionQuery("Card is on file. @P", 19), { start: 17, query: "P" });
    assert.deepEqual(mentionQuery("@Priya S", 8), { start: 0, query: "Priya S" });
    assert.equal(mentionQuery("mail me at a@b.co", 17), null);
    assert.equal(mentionQuery("no mention", 10), null);
  });

  test("matchMembers matches the start of any word", () => {
    assert.deepEqual(matchMembers(MEMBERS, "p").map((m) => m.id), ["p", "n"]);
    assert.deepEqual(matchMembers(MEMBERS, "ngu").map((m) => m.id), ["n"]);
    assert.equal(matchMembers(MEMBERS, "").length, 2);
  });

  test("renders mentions as styled spans, Reply as a Button, and the composer as a combobox with members", () => {
    const comments = [
      { id: "c1", author: PRIYA, createdAt: "Nov 20, 09:12", body: "@Daniel Okafor can you check?" },
      { id: "c2", author: DANIEL, createdAt: "Nov 20, 10:03", body: "Yes.", parentId: "c1" },
    ];
    const html = render(h(CommentThread, { comments, members: MEMBERS, currentUserId: "p", value: "", onValueChange: noop, onSubmit: noop, onReply: noop, onEdit: noop, onDelete: noop }));
    assert.match(html, /<span class="[^"]*mention[^"]*">@Daniel Okafor<\/span>/);
    assert.equal((html.match(/data-action="reply"/g) ?? []).length, 1, "one Reply per top-level thread");
    // Reply is described by the author's name, so it says whom it replies to.
    const describedBy = html.match(/data-action="reply"[^>]*aria-describedby="([^"]+)"|aria-describedby="([^"]+)"[^>]*data-action="reply"/);
    assert.ok(describedBy, "Reply has aria-describedby");
    const id = describedBy[1] ?? describedBy[2];
    assert.match(html, new RegExp(`id="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>Priya Shah<`));
    assert.match(html, /role="combobox"/);
    assert.match(html, /aria-label="More actions on your comment"/);
    assert.match(html, /to send/);
  });
});

describe("CommentsPanel follow-up", () => {
  let CommentsPanel;
  const THREADS = [
    { id: "t1", title: "Card declined", context: "INV-1842", preview: "Holding.", count: 3, updatedAt: "Nov 20, 10:26" },
    { id: "t2", title: "Due date", preview: "Moved.", count: 1, updatedAt: "Nov 14, 11:05", resolved: true },
  ];
  before(async () => {
    ({ CommentsPanel } = await import("../dist/ui/CommentsPanel/CommentsPanel.js"));
  });

  test("the open thread's meta line leads with its context", () => {
    const html = render(h(CommentsPanel, { inline: true, threads: THREADS, open: true, onOpenChange: noop, selectedId: "t1", onSelect: noop }));
    assert.match(html, />INV-1842 · 3 comments · Open</);
    const plain = render(h(CommentsPanel, { inline: true, threads: THREADS, open: true, onOpenChange: noop, selectedId: "t2", onSelect: noop }));
    assert.match(plain, />1 comment · Resolved</);
  });

  test("inline is a complementary region named by label", () => {
    const html = render(h(CommentsPanel, { inline: true, threads: THREADS, open: true, onOpenChange: noop, onSelect: noop }));
    assert.match(html, /role="complementary"[^>]*aria-label="Comments"|aria-label="Comments"[^>]*role="complementary"/);
  });

  test("inline=\"auto\" renders the trigger and no docked panel on the server (narrow markup)", () => {
    const html = render(h(CommentsPanel, { inline: "auto", threads: THREADS, open: true, onOpenChange: noop, onSelect: noop }));
    assert.doesNotMatch(html, /role="complementary"/);
    assert.match(html, />Comments</);
    assert.match(html, />1 open</);
  });
});
