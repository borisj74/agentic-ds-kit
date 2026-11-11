"use client";

import { useId, useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LucideByName, type KitIcon } from "../Button/lucideName";
import { Empty } from "../Empty";
import { Popover } from "../Popover";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { NotificationItem, NotificationStackProps, NotificationTone } from "./NotificationStack.types";
import styles from "./NotificationStack.module.css";

export type { NotificationStackProps, NotificationItem, NotificationTone } from "./NotificationStack.types";

const TONE_ICON: Record<NotificationTone, KitIcon> = {
  neutral: "Mail",
  success: "CircleCheck",
  info: "Info",
  warning: "TriangleAlert",
  danger: "CircleX",
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
 * the list, Mark all read and View all. Toasts stay for instant feedback; agent approvals live in AgentInbox.
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

  const panel = (
    <Panel
      items={items}
      label={label}
      unread={unread}
      onItemClick={onItemClick}
      onMarkRead={onMarkRead}
      onMarkAll={onMarkAll}
      onViewAll={onViewAll}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      loading={loading}
      error={error}
      onRetry={onRetry}
    />
  );

  if (inline) {
    return (
      <div {...rest} ref={ref} className={cx(styles.panel, styles.inline, className)} role="region" aria-label={label} aria-busy={loading || undefined}>
        {panel}
      </div>
    );
  }

  const triggerName = unread > 0 ? `${label}, ${unread} unread` : label;
  return (
    <div {...rest} ref={ref} className={cx(styles.root, className)}>
      <Popover
        label={label}
        open={open}
        onOpenChange={setOpen}
        className={styles.popoverPanel}
        trigger={<Button size="md" appearance="outline" mode="neutral" iconStart={Bell} ariaLabel={triggerName} />}
      >
        <div className={styles.panel} aria-busy={loading || undefined}>
          {panel}
        </div>
      </Popover>
      {unread > 0 ? (
        <span key={unread} className={styles.count} aria-hidden="true">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </div>
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
}) {
  const titleId = useId();
  const canMarkAll = Boolean(onMarkAll) && unread > 0 && !loading && !error;
  return (
    <>
      <header className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {label}
        </h3>
        {unread > 0 && !loading && !error ? (
          <Badge tone="info" size="sm">
            {`${unread} unread`}
          </Badge>
        ) : null}
        <span className={styles.spacer} />
        {onMarkAll ? (
          <button type="button" className={styles.textButton} onClick={onMarkAll} disabled={!canMarkAll}>
            Mark all read
          </button>
        ) : null}
      </header>

      <div className={styles.body}>
        {loading ? (
          <div className={styles.loading}>
            {[0, 1, 2].map((row) => (
              <div key={row} className={styles.loadingRow}>
                <Skeleton shape="circle" width="var(--space-4)" height="var(--space-4)" />
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
          <ul className={styles.list} aria-labelledby={titleId}>
            {items.map((item) => (
              <Row key={item.id} item={item} onItemClick={onItemClick} onMarkRead={onMarkRead} />
            ))}
          </ul>
        )}
      </div>

      {onViewAll ? (
        <footer className={styles.footer}>
          <button type="button" className={styles.footerLink} onClick={onViewAll}>
            View all notifications
          </button>
        </footer>
      ) : null}
    </>
  );
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
  const content = (
    <>
      <span className={cx(styles.icon, TONE_CLASS[tone])} aria-hidden="true">
        <LucideByName name={item.icon ?? TONE_ICON[tone]} size={16} />
      </span>
      <span className={styles.text}>
        <span className={cx(styles.itemTitle, item.read && styles.itemTitleRead)}>
          {!item.read ? <span className={styles.srOnly}>Unread: </span> : null}
          {item.title}
        </span>
        {item.body ? <span className={styles.itemBody}>{item.body}</span> : null}
      </span>
      <time className={styles.time}>{item.createdAt}</time>
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
    </li>
  );
}
