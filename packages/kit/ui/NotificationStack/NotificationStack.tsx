"use client";

import { useId, useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { LucideByName, type KitIcon } from "../Button/lucideName";
import { Drawer } from "../Drawer";
import { Empty } from "../Empty";
import { Popover } from "../Popover";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../LoadError";
import { cx } from "../shared/cx";
import { NARROW_QUERY, useMediaQuery } from "../shared/useMediaQuery";
import type { NotificationItem, NotificationStackProps, NotificationTone } from "./NotificationStack.types";
import styles from "./NotificationStack.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { NotificationStackProps, NotificationItem, NotificationTone, NotificationAction } from "./NotificationStack.types";

const TONE_ICON: Record<NotificationTone, KitIcon> = {
  neutral: "Mail",
  success: "CircleCheck",
  info: "Info",
  warning: "TriangleAlert",
  danger: "CircleAlert",
};

const TONE_CLASS: Record<NotificationTone, string | undefined> = {
  neutral: styles.toneNeutral,
  success: styles.toneSuccess,
  info: styles.toneInfo,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

/**
 * The durable in-app inbox of product notifications: a bell with the unread count opens a kit Popover with
 * the list, Mark all read and View all. Below --grid-breakpoint-sm the Popover becomes a full-height Drawer
 * with the same rows. Toasts stay for instant feedback; agent approvals live in AgentInbox.
 */
export function NotificationStack({
  items,
  label = "Notifications",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  inline = false,
  onItemClick,
  onMarkRead,
  onMarkAll,
  onViewAll,
  emptyTitle = "You’re all caught up",
  emptyDescription = "Payments, sign-ins and billing updates show up here.",
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: NotificationStackProps) {
  const unread = items.filter((item) => !item.read).length;
  const isControlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolled;
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolled(next);
    onOpenChange?.(next);
  };
  const narrow = useMediaQuery(NARROW_QUERY);

  const panelProps = {
    items,
    label,
    unread,
    onItemClick,
    onMarkRead,
    onMarkAll,
    onViewAll,
    emptyTitle,
    emptyDescription,
    loading,
    error,
    onRetry,
  };

  if (inline) {
    return (
      <div {...rest} {...nisthaAttr("notificationstack", rest)} ref={ref} className={cx(styles.panel, styles.inline, className)} role="region" aria-label={label} aria-busy={loading || undefined}>
        <Panel {...panelProps} />
      </div>
    );
  }

  const triggerName = unread > 0 ? `${label}, ${unread} unread` : label;
  const bell = <IconButton size="sm" appearance="outline" mode="neutral" icon={Bell} ariaLabel={triggerName} aria-expanded={narrow ? open : undefined} onClick={narrow ? () => setOpen(!open) : undefined} />;
  return (
    <div {...rest} {...nisthaAttr("notificationstack", rest)} ref={ref} className={cx(styles.root, className)}>
      {narrow ? (
        <>
          {bell}
          <Drawer
            open={open}
            title={label}
            description={unread > 0 && !loading && !error ? `${unread} unread` : undefined}
            side="right"
            size="sm"
            onClose={() => setOpen(false)}
            footer={onViewAll ? <ViewAll onViewAll={onViewAll} /> : undefined}
          >
            <div className={cx(styles.panel, styles.sheet)} aria-busy={loading || undefined}>
              <Panel {...panelProps} sheet />
            </div>
          </Drawer>
        </>
      ) : (
        <Popover label={label} open={open} onOpenChange={setOpen} className={styles.popoverPanel} trigger={bell}>
          <div className={styles.panel} aria-busy={loading || undefined}>
            <Panel {...panelProps} />
          </div>
        </Popover>
      )}
      {unread > 0 ? (
        <span key={unread} className={styles.count} aria-hidden="true">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </div>
  );
}

function ViewAll({ onViewAll }: { onViewAll: () => void }) {
  return (
    <Button size="sm" appearance="outline" mode="neutral" className={styles.viewAll} onClick={onViewAll}>
      View all notifications
    </Button>
  );
}

function Panel({
  items,
  label,
  unread,
  onItemClick,
  onMarkRead,
  onMarkAll,
  onViewAll,
  emptyTitle,
  emptyDescription,
  loading,
  error,
  onRetry,
  sheet = false,
}: {
  items: NotificationItem[];
  label: string;
  unread: number;
  onItemClick?: (id: string) => void;
  onMarkRead?: (id: string) => void;
  onMarkAll?: () => void;
  onViewAll?: () => void;
  emptyTitle: string;
  emptyDescription: string;
  loading: boolean;
  error?: string;
  onRetry?: () => void;
  /** Inside the narrow Drawer: the Drawer shows the title, count and View all. */
  sheet?: boolean;
}) {
  const titleId = useId();
  const [announce, setAnnounce] = useState("");
  const ready = !loading && !error;
  const canMarkAll = Boolean(onMarkAll) && unread > 0 && ready;
  const markAll = () => {
    onMarkAll?.();
    setAnnounce("All notifications marked read");
  };
  const markAllButton = onMarkAll ? (
    <Button size="sm" appearance="ghost" mode="neutral" iconStart="CheckCheck" onClick={markAll} disabled={!canMarkAll}>
      Mark all read
    </Button>
  ) : null;

  return (
    <>
      {sheet ? (
        markAllButton ? <div className={styles.sheetBar}>{markAllButton}</div> : null
      ) : (
        <header className={styles.header}>
          <h3 id={titleId} className={styles.title}>
            {label}
          </h3>
          {unread > 0 && ready ? <span className={styles.unreadCount}>{`${unread} unread`}</span> : null}
          <span className={styles.spacer} />
          {markAllButton}
        </header>
      )}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {announce}
      </span>

      <div className={styles.body}>
        {loading ? (
          <div className={styles.loading}>
            {[0, 1, 2].map((row) => (
              <div key={row} className={styles.loadingRow}>
                <Skeleton shape="circle" width="var(--space-3)" height="var(--space-3)" />
                <div className={styles.loadingText}>
                  <Skeleton width="55%" size="sm" />
                  <Skeleton width="85%" size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <LoadError className={styles.error} message={error} onRetry={onRetry} />
        ) : items.length === 0 ? (
          <Empty className={styles.empty} title={emptyTitle} description={emptyDescription} icon="Bell" />
        ) : (
          groupItems(items).map((section, index) =>
            section.heading ? (
              <section key={section.heading} className={cx(styles.group, index > 0 && styles.groupDivided)} aria-labelledby={`${titleId}-g${index}`}>
                <h4 id={`${titleId}-g${index}`} className={styles.groupHeading}>
                  {section.heading}
                </h4>
                <ul className={styles.list}>
                  {section.items.map((item) => (
                    <Row key={item.id} item={item} onItemClick={onItemClick} onMarkRead={onMarkRead} />
                  ))}
                </ul>
              </section>
            ) : (
              <ul key={`u${index}`} className={styles.list} aria-labelledby={sheet ? undefined : titleId} aria-label={sheet ? label : undefined}>
                {section.items.map((item) => (
                  <Row key={item.id} item={item} onItemClick={onItemClick} onMarkRead={onMarkRead} />
                ))}
              </ul>
            ),
          )
        )}
      </div>

      {onViewAll && !sheet ? (
        <footer className={styles.footer}>
          <ViewAll onViewAll={onViewAll} />
        </footer>
      ) : null}
    </>
  );
}

/** Items with a group gather under their heading (first appearance order); items without one stay in one plain list. */
export function groupItems(items: NotificationItem[]): Array<{ heading?: string; items: NotificationItem[] }> {
  const sections: Array<{ heading?: string; items: NotificationItem[] }> = [];
  for (const item of items) {
    const found = sections.find((section) => section.heading === item.group);
    if (found) found.items.push(item);
    else sections.push({ heading: item.group, items: [item] });
  }
  return sections;
}

function Row({
  item,
  onItemClick,
  onMarkRead,
}: {
  item: NotificationItem;
  onItemClick?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}) {
  const tone = item.tone ?? "neutral";
  // One reading order for every row: "New. Payment failed. INV-1842 … 09:42." The marker is decorative; the badge is the word.
  const content = (
    <>
      <span className={cx(styles.marker, !item.read && styles.markerUnread)} aria-hidden="true" />
      <span className={styles.text}>
        <span className={styles.titleLine}>
          <span className={cx(styles.icon, TONE_CLASS[tone])} aria-hidden="true">
            <LucideByName name={item.icon ?? TONE_ICON[tone]} size={16} />
          </span>
          <span className={cx(styles.itemTitle, item.read && styles.itemTitleRead)}>
            {!item.read ? <span className={styles.srOnly}>New. </span> : null}
            {item.title}
            <span className={styles.srOnly}>. </span>
          </span>
          {!item.read ? (
            <Badge tone="brand" size="sm" className={styles.newBadge} aria-hidden="true">
              New
            </Badge>
          ) : null}
          <time className={styles.time}>{item.createdAt}</time>
        </span>
        {item.body ? <span className={styles.itemBody}>{item.body}</span> : null}
      </span>
    </>
  );
  const handle = () => {
    if (!item.read) onMarkRead?.(item.id);
    onItemClick?.(item.id);
  };
  return (
    <li className={styles.item}>
      {onItemClick || onMarkRead ? (
        <button type="button" className={cx(styles.row, styles.rowButton)} onClick={handle}>
          {content}
        </button>
      ) : (
        <div className={styles.row}>{content}</div>
      )}
      {item.action ? (
        <div className={styles.action}>
          <Button size="sm" appearance="outline" mode="neutral" onClick={item.action.onClick}>
            {item.action.label}
          </Button>
        </div>
      ) : null}
    </li>
  );
}
