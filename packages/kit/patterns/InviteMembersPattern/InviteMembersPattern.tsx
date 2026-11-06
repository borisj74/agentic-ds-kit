"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "../../ui/Button";
import { ButtonGroup } from "../../ui/ButtonGroup";
import { Card } from "../../ui/Card";
import { DataTable } from "../../ui/DataTable";
import type { DataTableColumn, DataTableRow } from "../../ui/DataTable";
import { Field } from "../../ui/Field";
import { FieldSet } from "../../ui/FieldSet";
import { Input } from "../../ui/Input";
import { Modal } from "../../ui/Modal";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { RadioGroup } from "../../ui/RadioGroup";
import { Section } from "../../ui/Section";
import { Toast } from "../../ui/Toast";
import { ROLE_OPTIONS, TEAM } from "./invite-members-data";

export interface InviteMembersPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  onInvite?: (payload: { email: string; role: string }) => void;
}

const MEMBER_COLUMNS: DataTableColumn[] = [
  { key: "member", header: "Member" },
  { key: "role", header: "Role" },
  { key: "status", header: "Status" },
];

function statusTone(status: string): "success" | "info" | "neutral" {
  if (status === "Active") return "success";
  if (status === "Invited") return "info";
  return "neutral";
}

const MEMBER_ROWS: DataTableRow[] = TEAM.map((person, index) => ({
  id: String(index),
  member: {
    type: "avatar",
    name: person.name,
    initials: person.initials,
    label: person.email,
  },
  role: person.role,
  status: { type: "badge", label: person.status, tone: statusTone(person.status) },
}));

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
          title="Team members"
          subtitle="Manage who has access to this workspace."
          breadcrumbs={breadcrumbs}
          actions={
            <Button
              appearance={open ? "outline" : "solid"}
              mode={open ? "neutral" : "primary"}
              size="md"
              onClick={() => setOpen(true)}
            >
              Invite
            </Button>
          }
        />
      </div>
      <div className="layout-content">
        <Section title="Members" size="sm">
          <Card flush>
            <DataTable ariaLabel="Workspace members" columns={MEMBER_COLUMNS} rows={MEMBER_ROWS} cellSize="md" />
          </Card>
        </Section>
      </div>
      <Modal
        open={open}
        title="Invite members"
        description="Send an email invite. They join with the role you pick."
        size="md"
        onClose={close}
        footer={
          <ButtonGroup ariaLabel="Invite actions">
            <Button appearance="outline" mode="neutral" size="md" onClick={close}>
              Cancel
            </Button>
            <Button appearance="solid" mode="primary" size="md" onClick={send}>
              Send invite
            </Button>
          </ButtonGroup>
        }
      >
        <form onSubmit={handleSubmit}>
          <FieldSet legend="New member" description="They get access to this workspace.">
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
      />
    </div>
  );
}
