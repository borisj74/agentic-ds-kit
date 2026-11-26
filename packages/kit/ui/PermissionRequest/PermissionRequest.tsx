"use client";

import { useId, type KeyboardEvent } from "react";
import { CircleX, KeyRound } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Alert } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useNarrow } from "../shared/useNarrow";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import { ResolvedRow, reviewStyles } from "../shared/ResolvedRow";
import { handleReviewKeys } from "../shared/reviewKeys";
import type { PermissionAccess, PermissionRequestProps, PermissionScope } from "./PermissionRequest.types";
import styles from "./PermissionRequest.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  PermissionRequestProps,
  PermissionRequestStatus,
  PermissionScope,
  PermissionSummaryItem,
  PermissionAccess,
} from "./PermissionRequest.types";

// Every level has a tone: read info, write amber, admin red.
const ACCESS_TONE: Record<PermissionAccess, "info" | "warning" | "danger"> = {
  read: "info",
  write: "warning",
  admin: "danger",
};

const ACCESS_LABEL: Record<PermissionAccess, string> = { read: "Read", write: "Write", admin: "Admin" };

const ACCESS_ICON: Record<PermissionAccess, string> = { read: "Folder", write: "PenLine", admin: "ShieldAlert" };

function summaryOf(scope: PermissionScope | undefined) {
  return scope ? `${scope.access} ${scope.resource}` : "";
}

/**
 * An agent asks for standing access to a capability (files, network, repo, billing), not one action.
 * ApprovalCard is for a single action.
 */
export function PermissionRequest({
  title = "Permission request",
  description,
  scopes,
  status = "pending",
  warning,
  errorMessage = "Couldn't save the grant.",
  requestedAt,
  badge,
  summary,
  resolvedNote,
  onGrant,
  onDeny,
  onRetry,
  className,
  ref,
  ...rest
}: PermissionRequestProps) {
  const titleId = useId();
  const focus = useResolvedFocus(status === "granted" || status === "denied" || status === "expired");
  const busy = status === "granting";
  // Under 40rem of card width, Grant and Deny stack full width (Grant first) and the summary strip turns into rows.
  const { ref: sizeRef, narrow } = useNarrow<HTMLElement>(40);

  if (status === "granted" || status === "denied" || status === "expired") {
    const label = status === "granted" ? "Granted" : status === "denied" ? "Denied" : "Expired";
    const text = scopes.length > 1 ? `${scopes.length} scopes` : summaryOf(scopes[0]);
    return (
      <ResolvedRow
        {...rest} {...nisthaAttr("permissionrequest", rest)}
        ref={mergeRefs(focus.rowRef, ref)}
        className={className}
        outcome={status === "granted" ? "yes" : status === "denied" ? "no" : "expired"}
        label={label}
        text={<span className={styles.resolvedText}>{text}</span>}
        meta={resolvedNote}
        aria-label={`${label}: ${title}`}
      />
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (busy) return;
    handleReviewKeys(event, { onYes: onGrant, onNo: onDeny });
  }

  const standing = warning ?? null;
  const buttonSize = narrow ? "lg" : "md";

  const denyButton = (
    <Button
      appearance="outline"
      mode="neutral"
      size={buttonSize}
      block={narrow}
      shortcut={narrow ? undefined : "Esc"}
      aria-keyshortcuts="Escape"
      disabled={busy}
      onClick={onDeny}
    >
      Deny
    </Button>
  );
  // Grant stays the one solid primary while it waits; in flight or after an error it steps back to outline.
  const grantButton = (
    <Button
      appearance={busy || status === "error" ? "outline" : "solid"}
      mode="primary"
      size={buttonSize}
      block={narrow}
      iconStart={busy ? "LoaderCircle" : "Check"}
      shortcut={narrow || busy ? undefined : "⌘⏎"}
      aria-keyshortcuts="Meta+Enter Control+Enter"
      className={busy ? styles.granting : undefined}
      onClick={busy ? undefined : onGrant}
    >
      {busy ? "Granting…" : "Grant"}
    </Button>
  );

  return (
    <section
      {...rest} {...nisthaAttr("permissionrequest", rest)}
      ref={mergeRefs(sizeRef, ref)}
      tabIndex={-1}
      className={cx(styles.card, reviewStyles.focusRing, busy && styles.busy, narrow && styles.narrow, className)}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      onKeyDown={handleKeyDown}
    >
      {badge ? (
        <div className={styles.flagRow}>
          <Badge tone="warning" size="sm" appearance="soft" icon="Hand">
            {badge}
          </Badge>
          {requestedAt ? <span className={styles.flagNote}>{requestedAt}</span> : null}
        </div>
      ) : null}
      <header className={styles.header}>
        <KeyRound size={16} strokeWidth={ICON_STROKE} className={styles.titleIcon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {badge ? null : (
          <Badge tone="neutral" size="sm" appearance="outline" className={styles.count}>
            {`${scopes.length} ${scopes.length === 1 ? "scope" : "scopes"}`}
          </Badge>
        )}
      </header>
      {description ? <p className={styles.description}>{description}</p> : null}

      {summary?.length ? (
        <dl className={styles.summary}>
          {summary.map((item) => (
            <div key={item.label} className={styles.summaryItem}>
              <dt className={styles.summaryLabel}>{item.label}</dt>
              <dd className={styles.summaryValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <ul className={styles.scopes}>
        {scopes.map((scope) => (
          <li key={scope.id} className={styles.scope}>
            <LucideByName name={scope.icon ?? ACCESS_ICON[scope.access]} size={16} className={styles.scopeIcon} />
            <div className={styles.scopeBody}>
              <div className={styles.scopeRow}>
                <span className={styles.resource}>{scope.resource}</span>
                <Badge tone={ACCESS_TONE[scope.access]} size="sm" appearance="soft" className={styles.access}>
                  {ACCESS_LABEL[scope.access]}
                </Badge>
              </div>
              {scope.reason || scope.expiry ? (
                <div className={cx(styles.scopeRow, styles.detailRow)}>
                  {scope.reason ? <span className={styles.reason}>Why: {scope.reason}</span> : <span className={styles.reason} />}
                  {scope.expiry ? <span className={styles.expiry}>{scope.expiry}</span> : null}
                </div>
              ) : null}
              {scope.limit ? <span className={styles.limit}>Limit: {scope.limit}</span> : null}
            </div>
          </li>
        ))}
      </ul>

      {status === "error" ? (
        <div className={styles.error} role="alert">
          <CircleX size={16} strokeWidth={ICON_STROKE} className={styles.errorIcon} aria-hidden="true" />
          <span className={styles.errorText}>{errorMessage}</span>
          {onRetry ?? onGrant ? (
            <Button size="sm" appearance="ghost" mode="danger" iconStart="RotateCcw" onClick={onRetry ?? onGrant}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : standing ? (
        <Alert variant="warning">{standing}</Alert>
      ) : null}

      <footer className={narrow ? styles.stack : reviewStyles.footer}>
        {narrow ? null : (
          <span className={styles.footerStart}>
            {requestedAt && !badge ? <span className={styles.requested}>{requestedAt}</span> : null}
          </span>
        )}
        {narrow ? (
          <>
            {requestedAt && !badge ? <span className={styles.requested}>{requestedAt}</span> : null}
            {grantButton}
            {denyButton}
          </>
        ) : (
          <span className={reviewStyles.actions}>
            {denyButton}
            {grantButton}
          </span>
        )}
      </footer>
      <span className={styles.srOnly} role="status">
        {busy ? "Granting access" : ""}
      </span>
    </section>
  );
}
