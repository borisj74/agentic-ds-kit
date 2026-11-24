"use client";

import { useState } from "react";
import { CommentThread, CommentsPanel, type CommentThreadSummary } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";
import { MEMBERS, THREAD, THREADS } from "./saasDemoData";

const noop = () => {};
const pageComposer = <CommentThread comments={[]} value="" onValueChange={noop} onSubmit={noop} placeholder="Comment on this page…" emptyTitle="" label="Page comment" className={agentDoc.full} />;

export function CommentsPanelDoc() {
  const [threads, setThreads] = useState<CommentThreadSummary[]>(THREADS);
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const thread = <CommentThread comments={THREAD} value={draft} onValueChange={setDraft} onSubmit={() => setDraft("")} onReply={noop} members={MEMBERS} submitAppearance="soft" />;
  const resolve = (id: string) => {
    setThreads((current) => current.map((t) => (t.id === id ? { ...t, resolved: true } : t)));
    setSelected(null);
  };
  return (
    <AgentDocFrame
      id="commentspanel"
      name="CommentsPanel"
      lede="A side panel hosting a page's comment threads."
      summary="The button opens the Drawer; the inline panel below works the same and docks beside a page at 24rem. Open a thread, Resolve it, or go back to All threads. On a phone, Close, Back and Resolve grow to md (36)."
      preview={
        <div className={agentDoc.stack}>
          <CommentsPanel threads={threads} open={open} onOpenChange={setOpen} selectedId={selected} onSelect={setSelected} onResolve={resolve}>
            {thread}
          </CommentsPanel>
          <CommentsPanel inline threads={threads} open onOpenChange={noop} selectedId={selected} onSelect={setSelected} onResolve={resolve}>
            {thread}
          </CommentsPanel>
        </div>
      }
      usage="CommentsPanel lists threads with an Open / Resolved / All filter and hosts the selected thread: pass a CommentThread (without a title) as children. It opens in a kit Drawer from its trigger; inline renders it in place."
      code={`<CommentsPanel
  threads={threads}
  open={open}
  onOpenChange={setOpen}
  selectedId={selected}
  onSelect={setSelected}
  onResolve={resolve}
>
  <CommentThread comments={comments} value={draft} onValueChange={setDraft} onSubmit={post} />
</CommentsPanel>`}
      variants={[
        {
          title: "Several threads — Open filter",
          about: "Open is the default filter; each thread shows its latest comment and count.",
          code: `<CommentsPanel inline threads={threads} open onOpenChange={setOpen} onSelect={setSelected} />`,
          render: <CommentsPanel inline threads={THREADS} open onOpenChange={noop} onSelect={noop} />,
        },
        {
          title: "One selected — thread open",
          about: "All threads (ghost) goes back; Resolve (outline) marks the thread resolved. The meta line names the record, the count and Open or Resolved in words, e.g. INV-1842 · 3 comments · Open. The thread itself is a CommentThread.",
          code: `<CommentsPanel inline … selectedId="t1" onResolve={resolve}>
  <CommentThread … />
</CommentsPanel>`,
          render: (
            <CommentsPanel inline threads={THREADS} open onOpenChange={noop} selectedId="t1" onSelect={noop} onResolve={noop}>
              <CommentThread comments={THREAD.slice(0, 2)} value="" onValueChange={noop} onSubmit={noop} onReply={noop} />
            </CommentsPanel>
          ),
        },
        {
          title: "Empty — comment on this page",
          about: "No threads: a kit Empty and a page-level composer.",
          code: `<CommentsPanel inline threads={[]} … emptyTitle="No comments on INV-1842" composer={<CommentThread comments={[]} … />} />`,
          render: <CommentsPanel inline threads={[]} open onOpenChange={noop} onSelect={noop} emptyTitle="No comments on INV-1842" composer={pageComposer} />,
        },
        {
          title: "Filtered to none — Resolved",
          about: "Nothing matches the filter.",
          code: `<CommentsPanel inline threads={openThreads} filter="resolved" … />`,
          render: <CommentsPanel inline threads={THREADS.filter((t) => !t.resolved)} filter="resolved" open onOpenChange={noop} onSelect={noop} />,
        },
        {
          title: "Loading and error",
          about: "Skeletons while loading; a load error with Retry.",
          code: `<CommentsPanel inline threads={[]} loading … />
<CommentsPanel inline threads={[]} error="Couldn't load comments." onRetry={retry} … />`,
          render: (
            <div className={agentDoc.stack}>
              <CommentsPanel inline threads={[]} loading open onOpenChange={noop} onSelect={noop} />
              <CommentsPanel inline threads={[]} error="Couldn’t load comments." onRetry={noop} open onOpenChange={noop} onSelect={noop} />
            </div>
          ),
        },
        {
          title: "Docked on wide screens — inline=\"auto\"",
          about: "From --grid-breakpoint-lg (80rem) the open panel docks beside the page as a complementary region; Close swaps it for the trigger. Narrower, the same trigger opens the Drawer. On a phone the back button reads Threads.",
          code: `<CommentsPanel inline="auto" threads={threads} open={open} onOpenChange={setOpen} selectedId={selected} onSelect={setSelected} onResolve={resolve}>
  <CommentThread … submitAppearance="soft" />
</CommentsPanel>`,
          render: <AutoDockDemo />,
        },
        {
          title: "Closed — trigger with count",
          about: "The trigger is a kit Button described by the open count; the Drawer slides in from the right.",
          code: `<CommentsPanel threads={threads} open={open} onOpenChange={setOpen} onSelect={setSelected} />`,
          render: <CommentsPanel threads={THREADS} open={false} onOpenChange={noop} onSelect={noop} />,
        },
      ]}
    />
  );
}

function AutoDockDemo() {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>("t1");
  return (
    <CommentsPanel inline="auto" threads={THREADS} open={open} onOpenChange={setOpen} selectedId={selected} onSelect={setSelected} onResolve={noop}>
      <CommentThread comments={THREAD} value="" onValueChange={noop} onSubmit={noop} onReply={noop} submitAppearance="soft" />
    </CommentsPanel>
  );
}
