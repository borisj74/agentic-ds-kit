"use client";

import { useState } from "react";
import { Avatar } from "agentic-ds-kit";
import { AvatarGroup } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { Empty } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const MASTER_TITLE = "Connect billing";
const MASTER_DESCRIPTION = "Connect Stripe to see revenue, invoices and plans here.";

const COPY_RULES = [
  ["Say what happened.", "No revenue in the last 30 days. Not: Something went wrong."],
  ["Then say what to do.", "Show 12 months. Clear filters. Try again."],
  ["Name the range, filter or service.", "People can tell an empty week from a broken page."],
  ["Use one verb per button.", "Clear filters, not Reset. Try again, not Retry."],
  ["Never colour alone.", "An icon and words carry the state. The tint only adds to it."],
  ["Replace the Skeleton in place.", "Same size, no jump, no focus move. Failures use LoadError."],
] as const;

function masterCode() {
  return `<Empty
  kind="first-use"
  title="${MASTER_TITLE}"
  description="${MASTER_DESCRIPTION}"
  actions={<Button size="sm">Connect Stripe</Button>}
/>`;
}

function neutral(label: string) {
  return (
    <Button size="sm" appearance="outline" mode="neutral">
      {label}
    </Button>
  );
}

export function EmptyDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Empty</h2>
        <p className={styles.lede}>
          Placeholder when a list, page, or region has nothing to show. One piece. Not
          EmptyHeader, EmptyMedia, or EmptyContent. Pick a kind and a size; failures use LoadError.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="empty-master">
        <div className={styles.masterHeader}>
          <h2 id="empty-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            First use, md: the brand tile, a title, one sentence and the one primary.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Empty
                  kind="first-use"
                  title={MASTER_TITLE}
                  description={MASTER_DESCRIPTION}
                  actions={<Button size="sm">Connect Stripe</Button>}
                />
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  kind sets the icon and the role: no-data, no-results and permission are
                  role=status, so they are read once; first-use has no role and is the only kind
                  that may hold a primary Button. size sm sits in a chart, list or table cell with
                  no heading; md fills a card body; lg fills a page. Compose Avatar or AvatarGroup
                  in media.
                </p>
              </div>
              <CodeBlock code={masterCode()} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Kinds</h2>
              <div className={styles.exampleCanvas}>
                <Empty kind="no-data" title="No revenue in the last 30 days" actions={neutral("Show 12 months")} />
                <Empty kind="no-results" title="No invoice matches these filters" actions={neutral("Clear filters")} />
                <Empty kind="permission" title="Only Finance admins see revenue" actions={neutral("Request access")} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One job per kind, neutral sm Buttons with one verb. A failed load is not a kind: use
                  LoadError.
                </p>
              </div>
              <CodeBlock
                code={`<Empty kind="no-data" title="No revenue in the last 30 days" actions={<Button size="sm" appearance="outline" mode="neutral">Show 12 months</Button>} />
<Empty kind="no-results" title="No invoice matches these filters" actions={…Clear filters} />
<Empty kind="permission" title="Only Finance admins see revenue" actions={…Request access} />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <Empty size="sm" kind="no-data" title="No revenue in 30 days." actions={neutral("Show 12 months")} />
                <Empty size="md" kind="no-results" title="No plan matches Annual" description="Clear the filter to see every plan." />
                <Empty
                  size="lg"
                  kind="first-use"
                  title="No invoices yet"
                  description="Send your first invoice to Northwind to see it here."
                  actions={
                    <>
                      <Button size="sm">Create invoice</Button>
                      {neutral("Import CSV")}
                    </>
                  }
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  sm: bare 16px icon, one sentence, no heading. md: 32px tile and a title; put card
                  actions in the Card footer. lg: 40px tile, heading-5 title, one primary and up to two
                  neutral Buttons.
                </p>
              </div>
              <CodeBlock
                code={`<Empty size="sm" kind="no-data" title="No revenue in 30 days." actions={…} />
<Empty size="md" kind="no-results" title="No plan matches Annual" description="Clear the filter to see every plan." />
<Empty size="lg" kind="first-use" title="No invoices yet" description="…" actions={…} />`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Copy rules</h2>
              <ol className={styles.usageBody}>
                {COPY_RULES.map(([rule, example]) => (
                  <li key={rule}>
                    <strong>{rule}</strong> {example}
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Outline</h2>
              <div className={styles.exampleCanvas}>
                <Empty
                  outlined
                  title="Cloud storage empty"
                  description="Upload files to your cloud storage to access them anywhere."
                  icon="Cloud"
                  actions={<Button>Upload files</Button>}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>outlined adds a bordered card surface.</p>
              </div>
              <CodeBlock
                code={
                  '<Empty outlined title="Cloud storage empty" description="Upload files to your cloud storage to access them anywhere." icon="Cloud" actions={<Button>Upload files</Button>} />'
                }
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With avatar</h2>
              <div className={styles.exampleCanvas}>
                <Empty
                  title="User offline"
                  description="This user is currently offline. You can leave a message or try again later."
                  media={<Avatar name="Laura Reed" initials="LR" />}
                  actions={<Button>Leave message</Button>}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Pass kit Avatar in media. Not EmptyMedia.</p>
              </div>
              <CodeBlock
                code={
                  '<Empty title="User offline" description="This user is currently offline." media={<Avatar name="Laura Reed" initials="LR" />} actions={<Button>Leave message</Button>} />'
                }
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With AvatarGroup</h2>
              <div className={styles.exampleCanvas}>
                <Empty
                  title="No team members"
                  description="Invite your team to collaborate on this project."
                  media={
                    <AvatarGroup
                      ariaLabel="Team"
                      items={[
                        { name: "Chris Ng", initials: "CN" },
                        { name: "Laura Reed", initials: "LR" },
                        { name: "Elena Rossi", initials: "ER" },
                      ]}
                    />
                  }
                  actions={<Button>Invite members</Button>}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Overlapping avatars in the media slot.</p>
              </div>
              <CodeBlock
                code={`import { AvatarGroup } from "agentic-ds-kit";

<Empty
  title="No team members"
  description="Invite your team to collaborate on this project."
  media={
    <AvatarGroup
      ariaLabel="Team"
      items={[
        { name: "Chris Ng", initials: "CN" },
        { name: "Laura Reed", initials: "LR" },
        { name: "Elena Rossi", initials: "ER" },
      ]}
    />
  }
  actions={<Button>Invite members</Button>}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Title only</h2>
              <div className={styles.exampleCanvas}>
                <Empty title="No comments yet" />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Title alone when copy is enough.</p>
              </div>
              <CodeBlock code={'<Empty title="No comments yet" />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
