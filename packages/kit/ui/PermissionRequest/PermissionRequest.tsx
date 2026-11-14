"use client";

import { useId, type KeyboardEvent } from "react";
import { CircleCheck, CircleX, Clock, KeyRound, RotateCcw } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Alert } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import type { PermissionAccess, PermissionRequestProps, PermissionScope } from "./PermissionRequest.types";
import styles from "./PermissionRequest.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  PermissionRequestProps,
  PermissionRequestStatus,
  PermissionScope,
  PermissionAccess,
} from "./PermissionRequest.types";

const ACCESS_TONE: Record<PermissionAccess, "info" | "warning" | "danger"> = {
  read: "info",
  write: "warning",
  admin: "danger",
};

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
    const Icon = status === "granted" ? CircleCheck : status === "denied" ? CircleX : Clock;
    const label = status === "granted" ? "Granted" : status === "denied" ? "Denied" : "Expired";
    const parts = [scopes.length > 1 ? `${scopes.length} scopes` : summaryOf(scopes[0]), resolvedNote].filter(Boolean);
    return (
      <section {...rest} {...nisthaAttr("permissionrequest", rest)} ref={mergeRefs(focus.rowRef, ref)} tabIndex={-1} className={cx(styles.resolved, styles[status], className)} aria-label={`${label}: ${title}`}>
        <Icon size={16} strokeWidth={ICON_STROKE} className={styles.resolvedIcon} aria-hidden="true" />
        <span className={styles.resolvedLabel}>{label}</span>
        <span className={styles.resolvedText}>{parts.join(" · ")}</span>
      </section>
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (busy || event.defaultPrevented) return;
    if (event.key === "Escape" && onDeny) {
      event.preventDefault();
      onDeny();
    } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && onGrant) {
      event.preventDefault();
      onGrant();
    }
  }

  const standing = warning ?? null;

  return (
    <section
      {...rest} {...nisthaAttr("permissionrequest", rest)}
      ref={ref}
      tabIndex={-1}
      className={cx(styles.card, busy && styles.busy, className)}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      onKeyDown={handleKeyDown}
    >
      <header className={styles.header}>
        <KeyRound size={16} strokeWidth={ICON_STROKE} className={styles.titleIcon} aria-hidden="true" />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        <span className={styles.count}>
          {scopes.length} {scopes.length === 1 ? "scope" : "scopes"}
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
                  {scope.access}
                </Badge>
              </div>
              {scope.reason || scope.expiry ? (
                <div className={styles.scopeRow}>
                  {scope.reason ? <span className={styles.reason}>Why: {scope.reason}</span> : <span />}
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
            <button type="button" className={styles.retry} onClick={onRetry ?? onGrant}>
              <RotateCcw size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
              Retry
            </button>
          ) : null}
        </div>
      ) : standing ? (
        <Alert variant="warning">{standing}</Alert>
      ) : null}

      <footer className={styles.footer}>
        {requestedAt ? <span className={styles.note}>{requestedAt}</span> : <span />}
        <span className={styles.actions}>
          <Button appearance="outline" mode="neutral" shortcut="Esc" aria-keyshortcuts="Escape" disabled={busy} onClick={onDeny}>
            Deny
          </Button>
          <Button
            appearance="solid"
            mode="primary"
            shortcut={busy ? undefined : "⌘⏎"}
            iconStart={busy ? "LoaderCircle" : undefined}
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
