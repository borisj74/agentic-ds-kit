"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Field } from "@/ui/Field";
import { FieldSet } from "@/ui/FieldSet";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";
import type { InboxMessage } from "./inbox-data";

export function InboxReplyDrawer({
  message,
  open,
  onClose,
  onSend,
}: {
  message: InboxMessage | null;
  open: boolean;
  onClose: () => void;
  onSend: () => void;
}) {
  const baseId = useId();
  const toId = `${baseId}-to`;
  const subjectId = `${baseId}-subject`;
  const replyId = `${baseId}-reply`;
  const [error, setError] = useState<string | undefined>();

  function close() {
    setError(undefined);
    onClose();
  }

  function send() {
    const reply = (document.getElementById(replyId) as HTMLTextAreaElement | null)?.value.trim() ?? "";
    if (!reply) {
      setError("Write a reply before sending.");
      return;
    }
    onSend();
    setError(undefined);
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  return (
    <Drawer
      open={open && Boolean(message)}
      title={message ? `Reply to ${message.from}` : "Reply"}
      description={message?.subject}
      onClose={close}
      footer={
        message ? (
          <>
            <Button variant="primary" block onClick={send}>
              Send reply
            </Button>
            <Button variant="secondary" block onClick={close}>
              Cancel
            </Button>
          </>
        ) : null
      }
    >
      {message ? (
        <form onSubmit={handleSubmit}>
          <FieldSet key={message.id} legend="Reply" description="This goes back to the thread.">
            <Field label="To" htmlFor={toId}>
              <Input id={toId} name="to" defaultValue={message.from} />
            </Field>
            <Field label="Subject" htmlFor={subjectId}>
              <Input id={subjectId} name="subject" defaultValue={`Re: ${message.subject}`} />
            </Field>
            <Field
              label="Message"
              htmlFor={replyId}
              hint="Keep it short. They already have the thread."
              error={error}
            >
              <Textarea
                id={replyId}
                name="reply"
                rows={6}
                placeholder="Write a reply..."
                error={Boolean(error)}
              />
            </Field>
          </FieldSet>
        </form>
      ) : null}
    </Drawer>
  );
}
