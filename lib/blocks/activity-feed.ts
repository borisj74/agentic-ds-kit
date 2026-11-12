import contract from "../../packages/kit/contracts/activityfeed.json";
import type { BlockDoc } from "./types";

export const activityFeedDoc: BlockDoc = {
  slug: "activity-feed",
  label: "Activity feed",
  name: "ActivityFeed",
  contract,
  lead:
    "What people and agents did across the workspace, newest first and by day. Filter by type or person, open the thing an event happened to, reply to a comment, and load older activity as you go.",
  usage: `import { ActivityFeed } from "agentic-ds-kit";

export function Activity({ events, hasMore, loading }) {
  return (
    <main className="layout-content">
      <ActivityFeed
        events={events}             // { id, type, actor: { id, name, kind? }, verb, object, at, detail?, status? }[]
        onOpen={(id) => openEvent(id)}
        onReply={(id) => replyTo(id)}  // comment events only
        onLoadMore={() => loadNextPage()}
        hasMore={hasMore}
        loading={loading}           // Skeleton rows; new events are announced when it ends
      />
    </main>
  );
}`,
};
