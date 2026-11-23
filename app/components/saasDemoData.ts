import type { CommentMember, CommentThreadSummary, ThreadComment } from "agentic-ds-kit";

/** Example data shared by the CommentThread and CommentsPanel docs. People and numbers are examples. */
export const PRIYA = { id: "priya", name: "Priya Shah", initials: "PS" };
export const DANIEL = { id: "daniel", name: "Daniel Okafor", initials: "DO" };

export const THREAD: ThreadComment[] = [
  { id: "c1", author: PRIYA, createdAt: "Nov 20, 09:12", body: "@Daniel Okafor the card on file was declined twice. Can you check with Northwind AP before we retry on Nov 23?" },
  { id: "c2", author: DANIEL, createdAt: "Nov 20, 10:03", body: "Spoke to Mara in AP. A new Visa goes on file today. @Priya Shah hold the retry.", parentId: "c1" },
  { id: "c3", author: PRIYA, createdAt: "Nov 20, 10:26", body: "Holding. I'll retry once the new card is in.", edited: true, parentId: "c1" },
];

export const THREADS: CommentThreadSummary[] = [
  { id: "t1", title: "Card declined", preview: "Holding. I'll retry once the new card is in.", count: 3, updatedAt: "10:26" },
  { id: "t2", title: "Line 2 · API calls over 2M", preview: "Should this be $0.11 per 1K after the tier?", count: 2, updatedAt: "Nov 19" },
  { id: "t3", title: "Due date", preview: "Moved to Nov 20.", count: 1, updatedAt: "Nov 14", resolved: true },
];

export const MEMBERS: CommentMember[] = [
  { ...PRIYA, role: "Billing ops" },
  { ...DANIEL, role: "Finance" },
  { id: "paul", name: "Paul Nguyen", initials: "PN", role: "Support" },
];
