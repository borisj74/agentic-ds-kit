/** Demo data for AssistantWorkspacePattern. Replace with your own insights and assistant replies. */
import type { ChatMessage } from "../../ui/Chat";
import type { InsightCardTone } from "../../ui/InsightCard";

export interface Insight {
  id: string;
  title: string;
  description: string;
  tone: InsightCardTone;
  source: string;
  prompt: string;
  reply: string;
}

export const INSIGHTS: Insight[] = [
  {
    id: "qa-checklist",
    title: "QA checklist is still blocked",
    description: "Unassigned for 2 days. Assign an owner before Thursday's review.",
    tone: "warning",
    source: "From Open tasks",
    prompt: "Why is QA blocked?",
    reply: "QA checklist has no owner. Assign someone before Thursday so the last two device passes can close.",
  },
  {
    id: "invite-members",
    title: "Invite members is still open",
    description: "Three seats unused. Send invites so review comments have owners.",
    tone: "warning",
    source: "From Workspace",
    prompt: "Who should own invites?",
    reply: "Seats are provisioned. Maya can send the design and QA invites from Invite members so comments have owners.",
  },
  {
    id: "release-notes",
    title: "Release notes are ready to ship",
    description: "Jordan marked this Ready. Confirm the changelog before tag.",
    tone: "opportunity",
    source: "From Open tasks",
    prompt: "Draft a standup update",
    reply: "Release notes are Ready. Confirm the known-issues list, then tag. QA is still blocked and needs an owner today.",
  },
];

export const STARTER: ChatMessage[] = [
  {
    role: "assistant",
    content: "I can explain a blocked task, suggest an owner, or draft a standup update.",
  },
];
