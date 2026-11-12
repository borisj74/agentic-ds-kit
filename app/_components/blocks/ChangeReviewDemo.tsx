"use client";

import { useState } from "react";
import { ChangeReview, type ChangeReviewComment, type ChangeReviewFile } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import {
  CHANGE_REVIEW_COMMENTS,
  CHANGE_REVIEW_FILES,
  CHANGE_REVIEW_ME,
  CHANGE_REVIEW_SUMMARY,
} from "@/lib/blocks/change-review.sample";

/**
 * ChangeReview with the diff the rate-limiting plan produced. Reviewed, Accept / Reject (press
 * again to undo), Accept all and comments all change the sample live.
 */
export function ChangeReviewDemo() {
  const [files, setFiles] = useState<ChangeReviewFile[]>(CHANGE_REVIEW_FILES);
  const [comments, setComments] = useState<ChangeReviewComment[]>(CHANGE_REVIEW_COMMENTS);
  const [status, setStatus] = useState("");

  function update(id: string, change: (file: ChangeReviewFile) => Partial<ChangeReviewFile>) {
    setFiles((list) => list.map((file) => (file.id === id ? { ...file, ...change(file) } : file)));
  }

  function name(id: string) {
    return files.find((file) => file.id === id)?.path ?? id;
  }

  function verdict(id: string, next: "accepted" | "rejected") {
    update(id, (file) => ({ verdict: file.verdict === next ? "pending" : next, reviewed: true }));
    setStatus(`${next === "accepted" ? "Accepted" : "Rejected"}: ${name(id)}`);
  }

  return (
    <>
      <ChangeReview
        agent="Backend agent"
        files={files}
        summary={CHANGE_REVIEW_SUMMARY}
        summaryPeriod="main → agent/rate-limit"
        comments={comments}
        currentUserId={CHANGE_REVIEW_ME.id}
        onReviewedChange={(id, reviewed) => {
          update(id, () => ({ reviewed }));
          setStatus(`${reviewed ? "Reviewed" : "Not reviewed"}: ${name(id)}`);
        }}
        onAccept={(id) => verdict(id, "accepted")}
        onReject={(id) => verdict(id, "rejected")}
        onAcceptAll={() => {
          setFiles((list) => list.map((file) => ((file.verdict ?? "pending") === "pending" ? { ...file, verdict: "accepted", reviewed: true } : file)));
          setStatus("Accepted every remaining file");
        }}
        onComment={(fileId, body, { line, parentId }) => {
          setComments((list) => [
            ...list,
            { id: `c${list.length + 1}-${fileId}`, fileId, line, parentId, author: CHANGE_REVIEW_ME, createdAt: "now", body },
          ]);
          setStatus("Comment posted");
        }}
        onEditComment={(id, body) => setComments((list) => list.map((c) => (c.id === id ? { ...c, body, edited: true } : c)))}
        onDeleteComment={(id) => setComments((list) => list.filter((c) => c.id !== id && c.parentId !== id))}
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
