"use client";

import { useState } from "react";
import { Avatar } from "agentic-ds-kit";
import { AvatarGroup } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { Empty } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const MASTER_TITLE = "No projects yet";
const MASTER_DESCRIPTION =
  "You haven't created any projects yet. Get started by creating your first project.";

function masterCode() {
  return `<Empty
  title="${MASTER_TITLE}"
  description="${MASTER_DESCRIPTION}"
  icon="Folder"
  actions={
    <>
      <Button>Create</Button>
      <Button variant="secondary">Import</Button>
    </>
  }
/>`;
}

export function EmptyDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Empty</h1>
        <p className={styles.lede}>
          Placeholder when a list, page, or region has nothing to show. One piece. Not
          EmptyHeader, EmptyMedia, or EmptyContent.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="empty-master">
        <div className={styles.masterHeader}>
          <h2 id="empty-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            No projects yet with icon, description, and two kit Buttons.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Empty
                  title={MASTER_TITLE}
                  description={MASTER_DESCRIPTION}
                  icon="Folder"
                  actions={
                    <>
                      <Button>Create</Button>
                      <Button variant="secondary">Import</Button>
                    </>
                  }
                />
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Centered placeholder with optional icon, media, and kit Button actions. Compose
                  Avatar or AvatarGroup in media.
                </p>
              </div>
              <CodeBlock code={masterCode()} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
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
                <Empty title="Nothing here" />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Title alone when copy is enough.</p>
              </div>
              <CodeBlock code={'<Empty title="Nothing here" />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
