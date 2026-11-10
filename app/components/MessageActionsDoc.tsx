"use client";

import { useState, type ReactNode } from "react";
import { MessageActions } from "agentic-ds-kit";
import type { MessageFeedback } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";
import styles from "./MessageActionsDoc.module.css";

const MORE = [
  { id: "pin", label: "Pin message", icon: "Pin", shortcut: "P" },
  { id: "tokens", label: "View tokens · 1,240", icon: "Cpu" },
  { id: "delete", label: "Delete", icon: "Trash2", danger: true },
];
const REASONS = ["Wrong", "Too long", "Not what I asked"];
const noop = () => {};

function Message({ children, user }: { children: ReactNode; user?: boolean }) {
  return (
    <div className={user ? styles.user : styles.message} data-message-actions-host="">
      {user ? null : <p className={styles.author}>Assistant</p>}
      <p className={user ? styles.bubble : styles.text}>{user ? "Can you fix the rounding in invoice totals?" : "Totals now round half-even in integer cents. All 38 tests pass."}</p>
      {children}
    </div>
  );
}

export function MessageActionsDoc() {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<MessageFeedback>(null);

  function copy() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AgentDocFrame
      id="messageactions"
      name="MessageActions"
      lede="The action row on a chat message. Not ButtonGroup. Not DropdownMenu alone."
      summary="Copy swaps to Copied for 2s; thumbs toggle; a thumbs down offers reasons."
      preview={
        <Message>
          <MessageActions onCopy={copy} copied={copied} onRetry={noop} onFeedback={setFeedback} feedback={feedback} reasons={REASONS} onReason={noop} moreItems={MORE} onAction={noop} />
        </Message>
      }
      usage="MessageActions sits under a message. Every icon has a name and a Tooltip. With visible=&quot;hover&quot; it shows on hover or keyboard focus of the message (data-message-actions-host)."
      code={`<MessageActions
  onCopy={copy}
  copied={copied}
  onRetry={retry}
  onFeedback={setFeedback}
  feedback={feedback}
  reasons={["Wrong", "Too long", "Not what I asked"]}
  moreItems={moreItems}
  onAction={act}
/>`}
      variants={[
        {
          title: "Default — assistant message",
          about: "Copy, retry, thumbs and More.",
          code: `<MessageActions onCopy={copy} onRetry={retry} onFeedback={setFeedback} moreItems={items} />`,
          render: <Message><MessageActions onCopy={noop} onRetry={noop} onFeedback={noop} moreItems={MORE} onAction={noop} /></Message>,
        },
        {
          title: "User message — copy, edit, more",
          about: "User messages edit instead of retry and skip feedback.",
          code: `<MessageActions onCopy={copy} onEdit={edit} moreItems={items} />`,
          render: <Message user><MessageActions className={styles.end} onCopy={noop} onEdit={noop} moreItems={MORE} onAction={noop} /></Message>,
        },
        {
          title: "Copied and retrying",
          about: "copied and retrying swap the button for a labelled state.",
          code: `<MessageActions … copied />
<MessageActions … retrying />`,
          render: (
            <div className={agentDoc.stack}>
              <Message><MessageActions onCopy={noop} copied onRetry={noop} onFeedback={noop} moreItems={MORE} /></Message>
              <Message><MessageActions onCopy={noop} onRetry={noop} retrying onFeedback={noop} moreItems={MORE} /></Message>
            </div>
          ),
        },
        {
          title: "Liked and disliked — reason prompt",
          about: "A thumbs up says thanks; a thumbs down offers quick reasons.",
          code: `<MessageActions … feedback="up" />
<MessageActions … feedback="down" reasons={reasons} onReason={sendReason} />`,
          render: (
            <div className={agentDoc.stack}>
              <Message><MessageActions onCopy={noop} onRetry={noop} onFeedback={noop} feedback="up" moreItems={MORE} /></Message>
              <Message><MessageActions onCopy={noop} onRetry={noop} onFeedback={noop} feedback="down" reasons={REASONS} onReason={noop} moreItems={MORE} /></Message>
            </div>
          ),
        },
        {
          title: "Disabled — message still streaming",
          about: "disabled dims and disables the row until the message completes.",
          code: `<MessageActions … disabled />`,
          render: <Message><MessageActions onCopy={noop} onRetry={noop} onFeedback={noop} moreItems={MORE} disabled /></Message>,
        },
        {
          title: "Visible on hover or focus",
          about: "visible=\"hover\" hides the row at rest; hover the message or tab into it.",
          code: `<div data-message-actions-host>…<MessageActions visible="hover" … /></div>`,
          render: <Message><MessageActions visible="hover" onCopy={noop} onRetry={noop} onFeedback={noop} moreItems={MORE} /></Message>,
        },
      ]}
    />
  );
}
