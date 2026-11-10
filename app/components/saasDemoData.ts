import type { CommentThreadSummary, ThreadComment } from "agentic-ds-kit";

/** Example data shared by the CommentThread and CommentsPanel docs. People and numbers are examples. */
export const PRIYA = { id: "priya", name: "Priya Shah", initials: "PS" };
export const MARCO = { id: "marco", name: "Marco Li", initials: "ML" };

export const THREAD: ThreadComment[] = [
  { id: "c1", author: PRIYA, createdAt: "2h", body: "Can we confirm the 20% tax rate before this goes out?" },
  { id: "c2", author: MARCO, createdAt: "1h", body: "Confirmed with finance, 20% is right for UK customers.", edited: true, parentId: "c1" },
  { id: "c3", author: PRIYA, createdAt: "45m", body: "Thanks! Marking ready.", parentId: "c1" },
];

export const THREADS: CommentThreadSummary[] = [
  { id: "t1", title: "Tax rate for UK customers", preview: "Thanks! Marking ready.", count: 3, updatedAt: "45m" },
  { id: "t2", title: "Line 2 · seat price", preview: "Should this be $22 after the discount?", count: 2, updatedAt: "3h" },
  { id: "t3", title: "Due date", preview: "Moved to 15 Nov.", count: 1, updatedAt: "1d", resolved: true },
];
