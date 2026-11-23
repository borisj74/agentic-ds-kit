"use client";

import { useId, type KeyboardEvent } from "react";
import { CircleX } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Alert } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import { KeyHint, ResolvedRow, reviewStyles } from "../shared/ResolvedRow";
import { handleReviewKeys } from "../shared/reviewKeys";
import type { PermissionAccess, PermissionRequestProps, PermissionScope } from "./PermissionRequest.types";
import styles from "./PermissionRequest.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  PermissionRequestProps,
  PermissionRequestStatus,
  PermissionScope,
  PermissionAccess,
} from "./PermissionRequest.types";

// Colour only where access carries risk: write amber, admin red; read stays neutral.
const ACCESS_TONE: Record<PermissionAccess, "neutral" | "warning" | "danger"> = {
  read: "neutral",
  write: "warning",
  admin: "danger",
};

const ACCESS_LABEL: Record<PermissionAccess, string> = { read: "Read", write: "Write", admin: "Admin" };

const ACCESS_ICON: Record<PermissionAccess, string> = { read: "Folder", write: "PenLine", admin: "ShieldAlert" };

function summaryOf(scope: PermissionScope | undefined) {
  return scope ? `${ACCESS_LABEL[scope.access]} ${scope.resource}` : "";
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
        text={text}
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

  return (
    <section
      {...rest} {...nisthaAttr("permissionrequest", rest)}
      ref={ref}
      tabIndex={-1}
      className={cx(styles.card, reviewStyles.focusRing, busy && styles.busy, className)}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      onKeyDown={handleKeyDown}
    >
      <header className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        <span className={styles.count}>
          {scopes.length} {scopes.length === 1 ? "scope" : "scopes"}
          {requestedAt ? ` · ${requestedAt}` : ""}
        </span>
      </header>
      {description ? <p className={styles.description}>{description}</p> : null}

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
              {scope.reason ? <span className={styles.reason}>Why: {scope.reason}</span> : null}
              {scope.limit || scope.expiry ? (
                <div className={styles.scopeRow}>
                  {scope.limit ? <span className={styles.limit}>Limit: {scope.limit}</span> : <span />}
                  {scope.expiry ? <span className={styles.expiry}>{scope.expiry}</span> : null}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {status === "error" ? (
        <div className={styles.error} role="alert">
          <CircleX size={16} strokeWidth={ICON_STROKE} className={styles.errorIcon} aria-hidden="true" />
          <span className={styles.errorText}>{errorMessage}</span>
          {onRetry ?? onGrant ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry ?? onGrant}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : standing ? (
        <Alert variant="warning">{standing}</Alert>
      ) : null}

      <footer className={reviewStyles.footer}>
        <KeyHint>⌘⏎ grant · Esc deny</KeyHint>
        <span className={reviewStyles.actions}>
          <Button appearance="outline" mode="neutral" aria-keyshortcuts="Escape" disabled={busy} onClick={onDeny}>
            Deny
          </Button>
          <Button
            appearance="solid"
            mode="primary"
            iconStart={busy ? "LoaderCircle" : "Check"}
            aria-keyshortcuts="Meta+Enter Control+Enter"
            className={busy ? styles.granting : undefined}
            onClick={busy ? undefined : onGrant}
          >
            {busy ? "Granting…" : "Grant"}
          </Button>
        </span>
      </footer>
      <span className={styles.srOnly} role="status">
        {busy ? "Granting access" : ""}
      </span>
    </section>
  );
}
