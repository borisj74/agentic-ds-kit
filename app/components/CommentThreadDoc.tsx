"use client";

import { useState } from "react";
import { CommentThread, type ThreadComment } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";
import { MEMBERS, PRIYA, THREAD } from "./saasDemoData";

const TITLE = "Invoice INV-1842";
const noop = () => {};

export function CommentThreadDoc() {
  const [comments, setComments] = useState<ThreadComment[]>(THREAD);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const post = () => {
    setSending(true);
    window.setTimeout(() => {
      setComments((current) => [...current, { id: `c${current.length + 1}`, author: PRIYA, createdAt: "Nov 20, 10:41", body: draft.trim(), parentId: replyTo }]);
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
      summary="Write a comment and press Comment (or ⌘/Ctrl+Enter). Type @ to pick a member from the list above the field. @mentions of people in the thread read as brand text. Edit or Delete your own comments from the More menu; Reply focuses the composer."
      preview={
        <CommentThread
          title={TITLE}
          comments={comments}
          currentUserId={PRIYA.id}
          members={MEMBERS}
          value={draft}
          onValueChange={setDraft}
          onSubmit={post}
          submitting={sending}
          submitAppearance="soft"
          onReply={setReplyTo}
          onEdit={(id, body) => setComments((current) => current.map((c) => (c.id === id ? { ...c, body, edited: true } : c)))}
          onDelete={(id) => setComments((current) => current.filter((c) => c.id !== id))}
        />
      }
      usage="Use CommentThread for people discussing a record. Comment is the solid primary on its own; pass submitAppearance soft when the page already has one (Retry payment on an invoice). Replies nest one level. Use Chat for the assistant and CommentsPanel for a page's threads."
      code={`<CommentThread
  title="Invoice INV-1842"
  comments={comments}
  currentUserId={me.id}
  members={team}
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
          about: "A comment with two replies and one Reply under the thread. Mentions read as brand text at heading weight.",
          code: `<CommentThread title="Invoice INV-1842" comments={comments} value="" onValueChange={setDraft} onSubmit={post} onReply={reply} />`,
          render: <CommentThread title={TITLE} comments={THREAD} value="" onValueChange={noop} onSubmit={noop} onReply={noop} />,
        },
        {
          title: "Composer with a draft",
          about: "Textarea md and Comment share one 36 row; the field grows to four lines. ⌘/Ctrl+Enter posts.",
          code: `<CommentThread … value="@Daniel Okafor is the new Visa on file yet?" />`,
          render: <CommentThread title={TITLE} comments={THREAD.slice(0, 2)} value="@Daniel Okafor is the new Visa on file yet?" onValueChange={noop} onSubmit={noop} onReply={noop} />,
        },
        {
          title: "Your comments — Edit and Delete",
          about: "With currentUserId, your comments get a More menu (kit DropdownMenu) with Edit and Delete. Edit swaps the body for a Textarea with Cancel and Save ⏎; Delete confirms in an AlertDialog. Focus returns to the More button.",
          code: `<CommentThread … currentUserId={me.id} onEdit={edit} onDelete={remove} />`,
          render: <CommentThread title={TITLE} comments={THREAD} currentUserId={PRIYA.id} value="" onValueChange={noop} onSubmit={noop} onReply={noop} onEdit={noop} onDelete={noop} />,
        },
        {
          title: "Sending",
          about: "The button reads Sending… and the thread is busy.",
          code: `<CommentThread … value="Retrying now." submitting />`,
          render: <CommentThread title={TITLE} comments={THREAD} value="Retrying now." onValueChange={noop} onSubmit={noop} submitting />,
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
