"use client";

import { useState, type ReactNode } from "react";
import { Button, PermissionRequest } from "agentic-ds-kit";
import type { PermissionRequestStatus, PermissionScope } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SCOPES: PermissionScope[] = [
  {
    id: "docs",
    resource: "~/acme/ledger/docs",
    access: "read",
    icon: "Folder",
    reason: "Summarise weekly doc changes for the Monday digest.",
    expiry: "Expires in 7 days",
  },
  {
    id: "mail",
    resource: "Send email as ops@acme.dev",
    access: "write",
    icon: "Mail",
    reason: "Post the digest to the #ops mailing list.",
    expiry: "No expiry",
  },
];

const DESCRIPTION =
  "Research agent wants standing access, not a single action. It applies to every run until you revoke it or it expires.";
const WARNING = "Standing access. Every future run can send email without asking again. Revoke any time in Settings → Agents.";

const noop = () => {};

const BASE = {
  description: DESCRIPTION,
  scopes: SCOPES,
  warning: WARNING,
  requestedAt: "requested 14:02",
  onGrant: noop,
  onDeny: noop,
};

const SCOPES_CODE = `scopes={[
    { id: "docs", resource: "~/acme/ledger/docs", access: "read", icon: "Folder", reason: "Summarise weekly doc changes for the Monday digest.", expiry: "Expires in 7 days" },
    { id: "mail", resource: "Send email as ops@acme.dev", access: "write", icon: "Mail", reason: "Post the digest to the #ops mailing list.", expiry: "No expiry" },
  ]}`;

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Pending — two scopes, risk note",
    about:
      "Each scope shows the resource, its access level, why and when it expires. warning is a kit Alert for standing write access. Grant is ⌘/Ctrl+Enter, Deny is Escape.",
    code: `<PermissionRequest
  description="Research agent wants standing access, not a single action."
  ${SCOPES_CODE}
  warning="Standing access. Every future run can send email without asking again."
  requestedAt="requested 14:02"
  onGrant={grant}
  onDeny={deny}
/>`,
    render: <PermissionRequest {...BASE} />,
  },
  {
    title: "Loading — grant in flight",
    about: "status granting dims the scopes, disables Deny and spins Grant. The card is aria-busy.",
    code: `<PermissionRequest status="granting" … />`,
    render: <PermissionRequest {...BASE} status="granting" />,
  },
  {
    title: "Error — grant failed, retry",
    about: "status error replaces the warning with the failure and a Retry link (onRetry, else onGrant).",
    code: `<PermissionRequest status="error" errorMessage="Couldn't save the grant. Request timed out after 10s." onRetry={retry} … />`,
    render: <PermissionRequest {...BASE} status="error" errorMessage="Couldn't save the grant. Request timed out after 10s." />,
  },
  {
    title: "Resolved — one line",
    about: "granted, denied and expired collapse to one line that stays in the log.",
    code: `<PermissionRequest status="granted" scopes={[docs]} resolvedNote="until 17 Nov" />
<PermissionRequest status="denied" scopes={[mail]} resolvedNote="14:03" />
<PermissionRequest status="expired" scopes={[docs]} resolvedNote="ended 17 Nov 14:02" />`,
    render: (
      <div className={agentDoc.stack}>
        <PermissionRequest status="granted" scopes={[SCOPES[0]]} resolvedNote="until 17 Nov" />
        <PermissionRequest status="denied" scopes={[SCOPES[1]]} resolvedNote="14:03" />
        <PermissionRequest status="expired" scopes={[SCOPES[0]]} resolvedNote="ended 17 Nov 14:02" />
      </div>
    ),
  },
];

export function PermissionRequestDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [status, setStatus] = useState<PermissionRequestStatus>("pending");

  function grant() {
    setStatus("granting");
    window.setTimeout(() => setStatus("granted"), 1200);
  }

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>PermissionRequest</h1>
        <p className={styles.lede}>Standing access, scope by scope. Not ApprovalCard. Not Switch.</p>
      </header>

      <section className={styles.master} aria-labelledby="permissionrequest-master">
        <div className={styles.masterHeader}>
          <h2 id="permissionrequest-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Grant or deny. Grant goes through granting to one line.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={agentDoc.trail}>
                  <PermissionRequest
                    {...BASE}
                    status={status}
                    onGrant={grant}
                    onDeny={() => setStatus("denied")}
                    resolvedNote={status === "granted" ? "until 17 Nov" : "just now"}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={() => setStatus("pending")}>
                    Reset
                  </Button>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  PermissionRequest grants access that lasts. Name every scope, its access level, why and its expiry. One
                  action is an ApprovalCard.
                </p>
              </div>
              <CodeBlock
                code={`<PermissionRequest
  description="…"
  ${SCOPES_CODE}
  warning="…"
  status={status}
  onGrant={grant}
  onDeny={deny}
/>`}
              />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANT_DOCS.map((doc) => (
              <section key={doc.title} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={agentDoc.trail}>{doc.render}</div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{doc.about}</p>
                </div>
                <CodeBlock code={doc.code} />
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
