import type { BadgeTone } from "../../Badge";

export type InboxKind = "Comment" | "Mention" | "Request" | "Status" | "Alert";

export interface InboxMessage {
  id: string;
  from: string;
  fromSrc?: string;
  subject: string;
  body: string;
  kind: InboxKind;
  kindTone: BadgeTone;
  when: string;
  unread: boolean;
}

export const INBOX: InboxMessage[] = [
  {
    id: "maya-comment",
    from: "Maya Chen",
    fromSrc: "/faces/maya-chen.jpg",
    subject: "Comments on Launch brief",
    body: "Two notes on positioning. Close them before the freeze so copy can lock.",
    kind: "Comment",
    kindTone: "info",
    when: "2h ago",
    unread: true,
  },
  {
    id: "qa-alert",
    from: "Unassigned",
    subject: "QA checklist is still blocked",
    body: "No owner for 2 days. Assign someone before Thursday's review.",
    kind: "Alert",
    kindTone: "danger",
    when: "4h ago",
    unread: true,
  },
  {
    id: "alex-reply",
    from: "Alex Rivera",
    fromSrc: "/faces/alex-rivera.jpg",
    subject: "Replied on Support macros",
    body: "Refund and delay macros are drafted. Escalation paths still need a pass.",
    kind: "Comment",
    kindTone: "info",
    when: "5h ago",
    unread: true,
  },
  {
    id: "maya-mention",
    from: "Maya Chen",
    fromSrc: "/faces/maya-chen.jpg",
    subject: "Mentioned you in Launch brief",
    body: "Can you confirm the hero line before legal looks at the brief?",
    kind: "Mention",
    kindTone: "brand",
    when: "Yesterday",
    unread: true,
  },
  {
    id: "jordan-status",
    from: "Jordan Lee",
    fromSrc: "/faces/jordan-lee.jpg",
    subject: "Release notes moved to Ready",
    body: "Changelog is drafted. Confirm the known-issues list before we tag.",
    kind: "Status",
    kindTone: "success",
    when: "Yesterday",
    unread: true,
  },
  {
    id: "iris-request",
    from: "Iris Okafor",
    fromSrc: "/faces/iris-okafor.jpg",
    subject: "Review User research",
    body: "Five interviews are in. Need a read on the onboarding friction before Friday.",
    kind: "Request",
    kindTone: "warning",
    when: "Mon",
    unread: true,
  },
  {
    id: "noah-request",
    from: "Noah Williams",
    fromSrc: "/faces/noah-williams.jpg",
    subject: "Legal sign-off on QA",
    body: "The last two device passes are still open. Legal will not sign until they close.",
    kind: "Request",
    kindTone: "warning",
    when: "Mon",
    unread: true,
  },
];

export function filterMessages(messages: InboxMessage[], tab: string): InboxMessage[] {
  if (tab === "unread") return messages.filter((item) => item.unread);
  if (tab === "mentions") return messages.filter((item) => item.kind === "Mention");
  if (tab === "requests") return messages.filter((item) => item.kind === "Request");
  return messages;
}
