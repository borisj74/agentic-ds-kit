"use client";

import { useId, useState, type FormEvent } from "react";
import { AvatarGroup } from "../../AvatarGroup";
import { Button } from "../../Button";
import { ButtonGroup } from "../../ButtonGroup";
import { Empty } from "../../Empty";
import { Field } from "../../Field";
import { FieldSet } from "../../FieldSet";
import { Input } from "../../Input";
import { Modal } from "../../Modal";
import { PageHeader } from "../../PageHeader";
import type { PageHeaderProps } from "../../PageHeader";
import { RadioGroup } from "../../RadioGroup";
import { Toast } from "../../Toast";

const TEAM = [
  { name: "Maya Chen" },
  { name: "Noah Williams" },
  { name: "Iris Okafor" },
];

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

export interface InviteMembersPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  onInvite?: (payload: { email: string; role: string }) => void;
}

export function InviteMembersPattern({ breadcrumbs, onInvite }: InviteMembersPatternProps) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [toastOpen, setToastOpen] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const emailId = `${uid}-email`;
  const roleName = `${uid}-role`;

  function close() {
    setOpen(false);
    setEmailError(undefined);
  }

  function send() {
    const nextEmail = email.trim();
    if (!nextEmail || !nextEmail.includes("@")) {
      setEmailError("Enter a work email.");
      return;
    }

    onInvite?.({ email: nextEmail, role });
    setSentTo(nextEmail);
    setEmail("");
    setRole("member");
    setEmailError(undefined);
    setOpen(false);
    setToastOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Invite members"
          subtitle="Add people to this workspace so review comments have owners."
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="layout-content">
        <Empty
          title="No pending invites"
          description="Maya, Noah, and Iris are in this workspace. Three seats are open for design and QA."
          media={<AvatarGroup ariaLabel="Current members" items={TEAM} max={3} />}
          outlined
          actions={
            <Button variant="primary" size="md" onClick={() => setOpen(true)}>
              Invite members
            </Button>
          }
        />
      </div>
      <Modal
        open={open}
        title="Invite members"
        description="Send an email invite. They join with the role you pick."
        size="md"
        onClose={close}
        footer={
          <ButtonGroup ariaLabel="Invite actions">
            <Button variant="secondary" size="md" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={send}>
              Send invite
            </Button>
          </ButtonGroup>
        }
      >
        <form onSubmit={handleSubmit}>
          <FieldSet legend="New member" description="They get access to Sprint 24 projects.">
            <Field label="Email" htmlFor={emailId} hint="Work email they already use" error={emailError}>
              <Input
                id={emailId}
                type="email"
                iconStart="Mail"
                placeholder="name@company.com"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  if (emailError) setEmailError(undefined);
                }}
              />
            </Field>
            <RadioGroup
              name={roleName}
              legend="Role"
              orientation="horizontal"
              options={ROLE_OPTIONS}
              value={role}
              onChange={setRole}
            />
          </FieldSet>
        </form>
      </Modal>
      <Toast
        open={toastOpen}
        title="Invite sent"
        description={sentTo ? `We'll email ${sentTo} a link to join this workspace.` : undefined}
        status="success"
        duration={3000}
        onClose={() => setToastOpen(false)}
        onOpenChange={setToastOpen}
      />
    </div>
  );
}
