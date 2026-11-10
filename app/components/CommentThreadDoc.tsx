"use client";

import { useState } from "react";
import { CommentThread, type ThreadComment } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";
import { PRIYA, THREAD } from "./saasDemoData";

const TITLE = "Invoice INV-2026-0117";
const noop = () => {};

export function CommentThreadDoc() {
  const [comments, setComments] = useState<ThreadComment[]>(THREAD);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const post = () => {
    setSending(true);
    window.setTimeout(() => {
      setComments((current) => [...current, { id: `c${current.length + 1}`, author: PRIYA, createdAt: "now", body: draft.trim(), parentId: replyTo }]);
      setDraft("");
      setReplyTo(undefined);
      setSending(false);
    }, 700);
  };
  return (
    <AgentDocFrame
      id="commentthread"
      name="CommentThread"
      lede="One conversation on a document, invoice or task, with one level of replies."
      summary="Write a comment and press Comment (or ⌘/Ctrl+Enter). Edit or Delete your own comments; Reply focuses the composer."
      preview={
        <CommentThread
          title={TITLE}
          comments={comments}
          currentUserId={PRIYA.id}
          value={draft}
          onValueChange={setDraft}
          onSubmit={post}
          submitting={sending}
          onReply={setReplyTo}
          onEdit={(id, body) => setComments((current) => current.map((c) => (c.id === id ? { ...c, body, edited: true } : c)))}
          onDelete={(id) => setComments((current) => current.filter((c) => c.id !== id))}
        />
      }
      usage="Use CommentThread for people discussing a record. Comment is the one solid primary. Replies nest one level. Use Chat for the assistant and CommentsPanel for a page's threads."
      code={`<CommentThread
  title="Invoice INV-2026-0117"
  comments={comments}
  currentUserId={me.id}
  value={draft}
  onValueChange={setDraft}
  onSubmit={post}
  onReply={reply}
  onEdit={edit}
  onDelete={remove}
/>`}
      variants={[
        {
          title: "Populated with replies",
          about: "A comment with two replies; Reply under each.",
          code: `<CommentThread title="Invoice INV-2026-0117" comments={comments} value="" onValueChange={setDraft} onSubmit={post} onReply={reply} />`,
          render: <CommentThread title={TITLE} comments={THREAD} value="" onValueChange={noop} onSubmit={noop} onReply={noop} />,
        },
        {
          title: "Composer with a draft",
          about: "With text, Comment is enabled; ⌘/Ctrl+Enter posts.",
          code: `<CommentThread … value="@Marco can you double-check the EU rate too?" />`,
          render: <CommentThread title={TITLE} comments={THREAD.slice(0, 2)} value="@Marco can you double-check the EU rate too?" onValueChange={noop} onSubmit={noop} onReply={noop} />,
        },
        {
          title: "Your comments — Edit and Delete",
          about: "With currentUserId, your comments get Edit and Delete. Edit swaps the body for a Textarea with Cancel and Save ⏎; Delete confirms in an AlertDialog.",
          code: `<CommentThread … currentUserId={me.id} onEdit={edit} onDelete={remove} />`,
          render: <CommentThread title={TITLE} comments={THREAD} currentUserId={PRIYA.id} value="" onValueChange={noop} onSubmit={noop} onReply={noop} onEdit={noop} onDelete={noop} />,
        },
        {
          title: "Sending",
          about: "The button reads Sending… and the thread is busy.",
          code: `<CommentThread … value="Ship it Monday." submitting />`,
          render: <CommentThread title={TITLE} comments={THREAD} value="Ship it Monday." onValueChange={noop} onSubmit={noop} submitting />,
        },
        {
          title: "Empty, loading and error",
          about: "A kit Empty with the composer; skeleton rows; a load error with Retry.",
          code: `<CommentThread title="…" comments={[]} value={draft} onValueChange={setDraft} onSubmit={post} />
<CommentThread title="…" comments={[]} loading … />
<CommentThread title="…" comments={[]} error="Couldn't load comments." onRetry={retry} … />`,
          render: (
            <div className={agentDoc.stack}>
              <CommentThread title={TITLE} comments={[]} value="" onValueChange={noop} onSubmit={noop} />
              <CommentThread title={TITLE} comments={[]} value="" onValueChange={noop} onSubmit={noop} loading />
              <CommentThread title={TITLE} comments={[]} value="" onValueChange={noop} onSubmit={noop} error="Couldn’t load comments." onRetry={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}
