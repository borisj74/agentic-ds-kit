import contract from "../../packages/kit/contracts/changereview.json";
import type { BlockDoc } from "./types";

export const changeReviewDoc: BlockDoc = {
  slug: "change-review",
  label: "Change review",
  name: "ChangeReview",
  contract,
  lead:
    "Review what an agent changed, file by file. What the change does leads; the changed files with their +/− counts sit beside the selected file's diff and its comments. Mark files reviewed, accept or reject each one, or accept the rest in one go. J and K move between files, R marks one reviewed.",
  usage: `import { ChangeReview } from "agentic-ds-kit";

export function ReviewPage({ change, me }) {
  return (
    <main className="layout-content">
      <ChangeReview
        agent="Backend agent"
        files={change.files}          // { id, path, kind?, lines, hunkHeader?, reviewed?, verdict? }[]
        summary={change.summary}      // ChangeSummary items
        comments={change.comments}    // { id, fileId, line?, author, createdAt, body, parentId? }[]
        currentUserId={me.id}
        onReviewedChange={(fileId, reviewed) => mark(fileId, reviewed)}
        onAccept={(fileId) => accept(fileId)}
        onReject={(fileId) => reject(fileId)}
        onAcceptAll={() => acceptRest(change.id)}
        onComment={(fileId, body, { line, parentId }) => comment(fileId, body, line, parentId)}
      />
    </main>
  );
}`,
};
