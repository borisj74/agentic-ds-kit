"use client";

import { useId, useState, type FormEvent } from "react";
import { Avatar } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Drawer } from "../../ui/Drawer";
import { Empty } from "../../ui/Empty";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { ListView } from "../../ui/ListView";
import { Meter } from "../../ui/Meter";
import { Select } from "../../ui/Select";
import { Table } from "../../ui/Table";
import { Textarea } from "../../ui/Textarea";
import { MEMBERS, ROLE_FILTER_OPTIONS, ROLE_LABELS, ROLE_OPTIONS, SEATS, type Member } from "./settings-data";

export type TeamState = "ready" | "empty";

export interface TeamSettingsProps {
  state?: TeamState;
  /** Below --grid-breakpoint-md: members as a ListView with a row menu, lg controls. */
  narrow?: boolean;
  inviteOpen: boolean;
  onInviteOpenChange: (open: boolean) => void;
  onInvite?: (emails: string[], role: string, message: string) => void;
  onRoleChange?: (memberId: string, role: string) => void;
  onMemberAction?: (memberId: string, action: string) => void;
  onAddSeats?: () => void;
  onShowAll?: () => void;
}

const COLUMNS = [
  { key: "member", header: "Member" },
  { key: "role", header: "Role" },
  { key: "status", header: "Status" },
  { key: "lastActive", header: "Last active" },
];

/** Row menu: invites can be resent or revoked; members can have their email copied or be removed. */
function memberActions(member: Member) {
  return member.status === "invited"
    ? [
        { id: "resend", label: "Resend invite", icon: "Send" as const },
        { id: "role", label: "Change role", icon: "Pencil" as const },
        { id: "revoke", label: "Revoke invite", icon: "X" as const, danger: true },
      ]
    : [
        { id: "copy-email", label: "Copy email", icon: "Copy" as const },
        { id: "role", label: "Change role", icon: "Pencil" as const, disabled: member.you },
        { id: "remove", label: "Remove from workspace", icon: "UserMinus" as const, danger: true, disabled: member.you },
      ];
}

const seatsUsed = Math.round((SEATS.used / SEATS.limit) * 100);
const seatsFree = SEATS.limit - SEATS.used;

/**
 * Team page: seats (a kit Meter; seats count pending invites, Add seats), search and a role filter,
 * members in a kit Table (role Select, status Badge, last active, row menu), and Invite people in a
 * kit Drawer. Narrow lists members in a ListView with a row menu. Empty shows a kit Empty whose
 * Invite people is the primary.
 */
export function TeamSettings({
  state = "ready",
  narrow = false,
  inviteOpen,
  onInviteOpenChange,
  onInvite,
  onRoleChange,
  onMemberAction,
  onAddSeats,
  onShowAll,
}: TeamSettingsProps) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const size = narrow ? "lg" : "md";
  const members = MEMBERS.filter(
    (m) => `${m.name} ${m.detail}`.toLowerCase().includes(query.trim().toLowerCase()) && (role === "all" || m.role === role),
  );

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

  const seatsLabel = `${SEATS.used} of ${SEATS.limit} seats`;
  const seats = narrow ? (
    <Card size="sm">
      <div className="settings-pattern__fields">
        <div className="settings-pattern__row settings-pattern__row--center">
          <span className="settings-pattern__strong">{seatsLabel}</span>
          <span className="settings-pattern__caption">{`${seatsFree} free`}</span>
        </div>
        <Meter value={seatsUsed} label={`${seatsLabel} used`} />
      </div>
    </Card>
  ) : (
    <Card size="sm">
      <div className="settings-pattern__seats">
        <span className="settings-pattern__two-line">
          <span className="settings-pattern__strong">{seatsLabel}</span>
          <span className="settings-pattern__caption">{`${seatsFree} free · ${SEATS.invites} held by a pending invite`}</span>
        </span>
        <div className="settings-pattern__meter">
          <Meter value={seatsUsed} label={`${seatsLabel} used`} />
        </div>
        <span className="settings-pattern__muted">{SEATS.extra}</span>
        <Button appearance="outline" mode="neutral" size="sm" onClick={onAddSeats}>
          Add seats
        </Button>
      </div>
    </Card>
  );

  const search = (
    <Input
      id={`${uid}-search`}
      type="search"
      size={size}
      iconStart="Search"
      placeholder="Search name or email"
      ariaLabel="Search members"
      value={query}
      onChange={setQuery}
    />
  );
  const roleFilter = (
    <Select
      id={`${uid}-role-filter`}
      size={size}
      ariaLabel="Filter by role"
      options={ROLE_FILTER_OPTIONS}
      value={role}
      onChange={(next) => setRole(String(next))}
    />
  );
  const count = `${SEATS.members} members · ${SEATS.invites} invite`;

  return (
    <div className="layout-content settings-pattern__stack">
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
      ) : narrow ? (
        <>
          {seats}
          {search}
          {roleFilter}
          <Card flush>
            <ListView
              label="Members"
              size="lg"
              flush
              items={members.map((member) => ({
                id: member.id,
                name: member.name,
                primary: member.you ? `${member.name} (you)` : member.name,
                secondary:
                  member.status === "invited"
                    ? `${ROLE_LABELS[member.role]} · 5 days left`
                    : member.you
                      ? ROLE_LABELS[member.role]
                      : `${ROLE_LABELS[member.role]} · ${member.lastActive.toLowerCase()}`,
                badge: member.status === "active" ? "Active" : "Invited",
                badgeTone: member.status === "active" ? ("success" as const) : ("warning" as const),
                actions: memberActions(member),
              }))}
              empty={{ title: "No members match", description: "Try another name or role." }}
              onAction={(id, action) => onMemberAction?.(id, action)}
            />
          </Card>
        </>
      ) : (
        <>
          {seats}
          <Card flush>
            <div className="settings-pattern__toolbar settings-pattern__inset">
              <div className="settings-pattern__search">{search}</div>
              <div className="settings-pattern__filter">{roleFilter}</div>
              <span className="settings-pattern__caption settings-pattern__count">{count}</span>
            </div>
            <Table
              aria-label="Members"
              columns={COLUMNS}
              emptyLabel="No members match your search or role."
              rows={members.map((member) => ({
                member: <MemberCell name={member.name} member={member} />,
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
                      onChange={(next) => onRoleChange?.(member.id, String(next))}
                    />
                  ),
                status: (
                  <Badge tone={member.status === "active" ? "success" : "warning"} size="sm">
                    {member.status === "active" ? "Active" : "Invited"}
                  </Badge>
                ),
                lastActive: member.lastActive,
              }))}
              rowActions={(_, index) =>
                memberActions(members[index])
                  .filter((action) => action.id !== "role" && !("disabled" in action && action.disabled))
                  .map((action) => ({
                    label: action.label,
                    icon: action.icon,
                    onClick: () => onMemberAction?.(members[index].id, action.id),
                  }))
              }
            />
            <div className="settings-pattern__row settings-pattern__row--center settings-pattern__inset">
              <span className="settings-pattern__caption" role="status">{`Showing ${members.length} of ${SEATS.total}`}</span>
              <Button appearance="ghost" mode="neutral" size="sm" onClick={onShowAll}>
                Show all
              </Button>
            </div>
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

/** `name` names the row, so the Table's row menu reads "Actions for Marco Li". */
function MemberCell({ name, member }: { name: string; member: Member }) {
  return (
    <span className="settings-pattern__member">
      <Avatar name={name} size="sm" />
      <span className="settings-pattern__two-line">
        <span className="settings-pattern__strong">{member.you ? `${name} (you)` : name}</span>
        <span className="settings-pattern__caption">{member.detail}</span>
      </span>
    </span>
  );
}
