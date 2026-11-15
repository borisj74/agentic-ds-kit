"use client";

import { useState, type ReactNode } from "react";
import { Button, DoneCheck } from "agentic-ds-kit";
import type { DoneCriterion } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const TITLE = "Update the EU price list for spring";

const MIXED: DoneCriterion[] = [
  {
    id: "skus",
    text: "Every SKU in the EU list has a 2027 price",
    status: "met",
    evidence: { note: "1,284 of 1,284 SKUs priced.", href: "#price-sheet", hrefLabel: "Price sheet diff (run 482)" },
  },
  {
    id: "totals",
    text: "Totals per category match the supplier sheet",
    status: "not_met",
    reason: "Garden furniture is €412 under the supplier total. Three SKUs use last year's freight surcharge.",
    evidence: {
      output: "category          sheet      ours       diff\ngarden-furniture  48,210.00  47,798.00  -412.00\nlighting          12,904.50  12,904.50     0.00",
      outputLabel: "compare_totals.py",
    },
  },
  {
    id: "drops",
    text: "No price drops more than 20% without a note",
    status: "unverified",
    evidence: { note: "Two drops over 20% have notes; the agent could not open the notes for one of them." },
  },
  {
    id: "tests",
    text: "Catalogue export tests pass",
    status: "met",
    evidence: { output: "✓ 48 passed (2.1s)", outputLabel: "npm test -- export" },
  },
  { id: "locale", text: "Prices show in the shopper's currency", status: "met", setBy: "person" },
];

const ALL_MET: DoneCriterion[] = MIXED.map((item) => ({ ...item, status: "met", reason: undefined }));
const CHECKING: DoneCriterion[] = MIXED.map((item, i) => (i < 2 ? { ...item, status: "checking" } : item));

const noop = () => {};
const HANDLERS = { onOverride: noop, onRecheck: noop, onAccept: noop, onSendBack: noop };

const CRITERIA_CODE = `criteria={[
    { id: "skus", text: "Every SKU in the EU list has a 2027 price", status: "met", evidence: { href: "/runs/482/sheet", hrefLabel: "Price sheet diff" } },
    { id: "totals", text: "Totals per category match the supplier sheet", status: "not_met", reason: "Garden furniture is €412 under…", evidence: { output: "…", outputLabel: "compare_totals.py" } },
    { id: "drops", text: "No price drops more than 20% without a note", status: "unverified" },
  ]}`;

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "All met — accept",
    about: "Every check is met, so Accept result is the one solid primary. Send back stays as outline in case the person disagrees.",
    code: `<DoneCheck title="…" criteria={allMet} onAccept={accept} onSendBack={sendBack} />`,
    render: <DoneCheck title={TITLE} checkedAt="Checked 14:02" criteria={ALL_MET} {...HANDLERS} />,
  },
  {
    title: "Mixed — not met first",
    about:
      "Not met rows sort first and show the agent's reason. Unverified never counts as met, so the verdict is \"3 of 5 met\" and Send back to agent is the primary.",
    code: `<DoneCheck title="…" ${CRITERIA_CODE} onOverride={override} onRecheck={recheck} onSendBack={sendBack} />`,
    render: <DoneCheck title={TITLE} checkedAt="Checked 14:02" criteria={MIXED} {...HANDLERS} />,
  },
  {
    title: "Checking — re-check in flight",
    about: "Checking rows spin and their buttons are disabled. The card is aria-busy and Send back waits until the checks finish.",
    code: `<DoneCheck criteria={[{ id: "skus", text: "…", status: "checking" }, …]} … />`,
    render: <DoneCheck title={TITLE} checkedAt="Re-checking…" criteria={CHECKING} {...HANDLERS} />,
  },
  {
    title: "Empty — no agreed checks",
    about: "With no criteria the card shows a kit Empty. Add \"done when\" checks in the TaskBrief so there is something to mark.",
    code: `<DoneCheck title="…" criteria={[]} />`,
    render: <DoneCheck title="Draft the Q3 supplier email" criteria={[]} />,
  },
];

export function DoneCheckDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [criteria, setCriteria] = useState<DoneCriterion[]>(MIXED);
  const [outcome, setOutcome] = useState<string | null>(null);

  function override(id: string, status: "met" | "not_met") {
    setCriteria((list) => list.map((c) => (c.id === id ? { ...c, status, setBy: "person" } : c)));
  }

  function recheck(id: string) {
    setCriteria((list) => list.map((c) => (c.id === id ? { ...c, status: "checking" } : c)));
    window.setTimeout(() => {
      setCriteria((list) => list.map((c) => (c.id === id ? { ...c, status: "met", setBy: "agent", reason: undefined } : c)));
    }, 1400);
  }

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>DoneCheck</h2>
        <p className={styles.lede}>Was it really done? Each agreed check, with proof. Not RunDetail. Not ChangeReview.</p>
      </header>

      <section className={styles.master} aria-labelledby="donecheck-master">
        <div className={styles.masterHeader}>
          <h2 id="donecheck-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Mark or re-check rows. When every check is met, Accept result takes over.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={agentDoc.trail}>
                  <DoneCheck
                    title={TITLE}
                    checkedAt={outcome ?? "Checked 14:02"}
                    criteria={criteria}
                    onOverride={override}
                    onRecheck={recheck}
                    onAccept={() => setOutcome("Accepted just now")}
                    onSendBack={() => setOutcome("Sent back to the agent just now")}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <Button
                    size="sm"
                    appearance="outline"
                    mode="neutral"
                    iconStart="RotateCcw"
                    onClick={() => {
                      setCriteria(MIXED);
                      setOutcome(null);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  DoneCheck takes the &quot;done when&quot; checks from a TaskBrief, or any plain list, and shows whether each
                  one was met, with proof. Unverified never counts as met. A person can overrule the agent on any row.
                </p>
              </div>
              <CodeBlock
                code={`<DoneCheck
  title="Update the EU price list for spring"
  checkedAt="Checked 14:02"
  ${CRITERIA_CODE}
  onOverride={override}
  onRecheck={recheck}
  onAccept={accept}
  onSendBack={sendBack}
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
