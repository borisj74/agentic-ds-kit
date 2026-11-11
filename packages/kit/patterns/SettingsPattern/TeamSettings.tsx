"use client";

import { useId, useState, type FormEvent } from "react";
import { Avatar } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Drawer } from "../../ui/Drawer";
import { DropdownMenu } from "../../ui/DropdownMenu";
import { Empty } from "../../ui/Empty";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Table } from "../../ui/Table";
import { Textarea } from "../../ui/Textarea";
import { MEMBERS, ROLE_OPTIONS, SEATS, type Member } from "./settings-data";

export type TeamState = "ready" | "empty";

export interface TeamSettingsProps {
  state?: TeamState;
  inviteOpen: boolean;
  onInviteOpenChange: (open: boolean) => void;
  onInvite?: (emails: string[], role: string, message: string) => void;
  onRoleChange?: (memberId: string, role: string) => void;
  onMemberAction?: (memberId: string, action: string) => void;
}

const COLUMNS = [
  { key: "member", header: "Member" },
  { key: "role", header: "Role" },
  { key: "status", header: "Status" },
  { key: "actions", header: "Actions", align: "end" as const },
];

/**
 * Team page: search, seats used, members in a kit Table (role Select, status Badge, row menu),
 * and Invite people in a kit Drawer. Empty shows a kit Empty whose Invite people is the primary.
 */
export function TeamSettings({ state = "ready", inviteOpen, onInviteOpenChange, onInvite, onRoleChange, onMemberAction }: TeamSettingsProps) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const members = MEMBERS.filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(query.trim().toLowerCase()));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const emails = String(data.get("emails") ?? "")
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    onInvite?.(emails, String(data.get("role") ?? "member"), String(data.get("message") ?? ""));
    onInviteOpenChange(false);
  }

  return (
    <div className="layout-content">
      {state === "empty" ? (
        <Empty
          outlined
          icon="Users"
          title="It’s just you so far"
          description="Invite teammates to share invoices, approvals and agents. Seats are billed when they accept."
          actions={
            <Button iconStart="Plus" onClick={() => onInviteOpenChange(true)}>
              Invite people
            </Button>
          }
        />
      ) : (
        <>
          <div className="settings-pattern__toolbar">
            <div className="settings-pattern__search">
              <Input
                id={`${uid}-search`}
                type="search"
                iconStart="Search"
                placeholder="Search members"
                ariaLabel="Search members"
                value={query}
                onChange={setQuery}
              />
            </div>
            <span className="settings-pattern__mono settings-pattern__caption">{`${SEATS.used} of ${SEATS.limit} seats used`}</span>
          </div>
          <Card flush>
            <Table
              aria-label="Members"
              columns={COLUMNS}
              emptyLabel="No members match your search."
              rows={members.map((member) => ({
                member: <MemberCell member={member} />,
                role:
                  member.role === "owner" ? (
                    "Owner"
                  ) : (
                    <Select
                      id={`${uid}-${member.id}-role`}
                      size="sm"
                      ariaLabel={`Role for ${member.name}`}
                      options={ROLE_OPTIONS}
                      defaultValue={member.role}
                      onChange={(role) => onRoleChange?.(member.id, String(role))}
                    />
                  ),
                status: (
                  <Badge tone={member.status === "active" ? "success" : "warning"} size="sm">
                    {member.status === "active" ? "Active" : "Invited"}
                  </Badge>
                ),
                actions: (
                  <DropdownMenu
                    appearance="ghost"
                    size="sm"
                    iconStart="Ellipsis"
                    ariaLabel={`Actions for ${member.name}`}
                    groups={[
                      {
                        items:
                          member.status === "invited"
                            ? [
                            { id: "resend", label: "Resend invite", icon: "Send" },
                            { id: "revoke", label: "Revoke invite", icon: "X", danger: true },
                          ]
                        : [
                            { id: "copy-email", label: "Copy email", icon: "Copy" },
                            { id: "remove", label: "Remove from workspace", icon: "UserMinus", danger: true, disabled: member.you },
                          ],
                      },
                    ]}
                    onSelect={(action) => onMemberAction?.(member.id, action)}
                  />
                ),
              }))}
            />
          </Card>
        </>
      )}

      <Drawer
        open={inviteOpen}
        side="right"
        title="Invite people"
        onClose={() => onInviteOpenChange(false)}
        footer={
          <div className="settings-pattern__actions">
            <Button appearance="ghost" mode="neutral" onClick={() => onInviteOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form={`${uid}-invite`} shortcut="⏎">
              Send invites
            </Button>
          </div>
        }
      >
        <form id={`${uid}-invite`} className="settings-pattern__fields" onSubmit={submit}>
          <Field label="Email addresses" htmlFor={`${uid}-emails`} hint="Separate with commas. Each person adds a seat when they accept.">
            <Textarea id={`${uid}-emails`} name="emails" rows={3} placeholder="name@company.com" />
          </Field>
          <Field label="Role" htmlFor={`${uid}-role`}>
            <Select id={`${uid}-role`} name="role" options={ROLE_OPTIONS} defaultValue="member" />
          </Field>
          <Field label="Message (optional)" htmlFor={`${uid}-message`}>
            <Textarea id={`${uid}-message`} name="message" rows={2} defaultValue="Welcome to Northwind billing!" />
          </Field>
        </form>
      </Drawer>
    </div>
  );
}

function MemberCell({ member }: { member: Member }) {
  return (
    <span className="settings-pattern__member">
      <Avatar name={member.name} size="sm" />
      <span className="settings-pattern__two-line">
        <span className="settings-pattern__line">
          <span className="settings-pattern__strong">{member.name}</span>
          {member.you ? (
            <Badge tone="neutral" appearance="outline" size="sm">
              You
            </Badge>
          ) : null}
        </span>
        <span className="settings-pattern__caption">{member.email}</span>
      </span>
    </span>
  );
}
