"use client";

import { useEffect, useRef, useState } from "react";
import { ActivityFeed, type ActivityEvent } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import {
  ACTIVITY_NOW,
  ACTIVITY_PAGES,
  ACTIVITY_TIME_ZONE,
  INVOICE_HISTORY,
  INVOICE_STATUS_CHIPS,
} from "@/lib/blocks/activity-feed.sample";

const LOAD_MS = 900;

/**
 * ActivityFeed with the sample workspace. Load more waits a moment (Skeleton rows), then appends
 * the next page; the block announces what came in. Open and Reply are announced here. Below it,
 * variant="history" shows one invoice's events with status chips.
 */
export function ActivityFeedDemo() {
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const events: ActivityEvent[] = ACTIVITY_PAGES.slice(0, pages).flat();
  const find = (id: string) => events.find((event) => event.id === id);

  return (
    <>
      <ActivityFeed
        events={events}
        now={ACTIVITY_NOW}
        timeZone={ACTIVITY_TIME_ZONE}
        hasMore={pages < ACTIVITY_PAGES.length}
        loading={loading}
        onLoadMore={() => {
          setLoading(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => {
            setPages((count) => Math.min(ACTIVITY_PAGES.length, count + 1));
            setLoading(false);
          }, LOAD_MS);
        }}
        onOpen={(id) => setStatus(`Opened ${find(id)?.object ?? id}`)}
        onReply={(id) => setStatus(`Replying to ${find(id)?.actor.name ?? id}`)}
      />
      <ActivityFeed
        variant="history"
        title="INV-1842 history"
        description="5 events · Northwind Ltd · €2,400.00"
        events={INVOICE_HISTORY}
        statusChips={INVOICE_STATUS_CHIPS}
        now={ACTIVITY_NOW}
        timeZone={ACTIVITY_TIME_ZONE}
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
