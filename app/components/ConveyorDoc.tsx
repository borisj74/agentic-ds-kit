"use client";

import { useState } from "react";
import { Badge, Card, Conveyor } from "agentic-ds-kit";
import type { ConveyorOrientation } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import doc from "./ConveyorDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl } from "./ControlsPanel";

const ORIENTATIONS: ConveyorOrientation[] = ["horizontal", "vertical"];
const CONTENTS = ["cards", "chips"] as const;

type ContentKind = (typeof CONTENTS)[number];

/** Draft invoices to move through: cards, not KPIs (KPIs belong in Scoreboard, which wraps). */
const INVOICES = [
  { id: "INV-1887", customer: "Northwind Traders", amount: "$1,088.40", due: "Due 1 Dec" },
  { id: "INV-1886", customer: "Contoso Retail", amount: "$8,215.00", due: "Due 28 Nov" },
  { id: "INV-1885", customer: "Fabrikam Labs", amount: "$7,630.00", due: "Due 27 Nov" },
  { id: "INV-1884", customer: "Tailspin Freight", amount: "$6,905.00", due: "Due 26 Nov" },
  { id: "INV-1883", customer: "Adatum Health", amount: "$6,120.00", due: "Due 25 Nov" },
  { id: "INV-1882", customer: "Litware Inc.", amount: "$2,480.00", due: "Due 24 Nov" },
  { id: "INV-1881", customer: "Proseware", amount: "$1,940.00", due: "Due 22 Nov" },
  { id: "INV-1880", customer: "Woodgrove Bank", amount: "$12,300.00", due: "Due 20 Nov" },
];

function invoiceCards(limit = INVOICES.length) {
  return INVOICES.slice(0, limit).map((invoice) => (
    <Card key={invoice.id} size="sm" title={invoice.id} description={invoice.customer}>
      <p className={doc.cardFigure}>
        {invoice.amount} · {invoice.due}
      </p>
    </Card>
  ));
}

const CHIPS = [
  "Open",
  "Overdue",
  "Paid",
  "Disputed",
  "Credits",
  "Refunds",
  "Trials",
  "Metered",
  "Collections",
  "Write-offs",
  "Pending",
  "On hold",
  "Chargebacks",
  "Settled",
];

function masterCode(orientation: ConveyorOrientation, content: ContentKind) {
  const lines = ["<Conveyor"];
  if (orientation !== "horizontal") lines.push(`  orientation="${orientation}"`);
  lines.push(`  label="${content === "chips" ? "Filters" : "Draft invoices"}"`);
  if (content === "chips") {
    lines.push(">");
    lines.push("  {chips}");
    lines.push("</Conveyor>");
  } else {
    lines.push(">");
    lines.push("  <div className=\"row\">{invoices.map((i) => <Card key={i.id} title={i.id} description={i.customer}>…</Card>)}</div>");
    lines.push("</Conveyor>");
  }
  return lines.join("\n");
}

export function ConveyorDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [orientation, setOrientation] = useState<ConveyorOrientation>("horizontal");
  const [content, setContent] = useState<ContentKind>("cards");
  const vertical = orientation === "vertical";
  const padClass = vertical
    ? `${doc.previewPad} ${doc.previewPadVertical}`
    : content === "chips"
      ? `${doc.previewPad} ${doc.previewPadChips}`
      : doc.previewPad;
  const label = content === "chips" ? "Filters" : "Draft invoices";

  const chips = CHIPS.map((chip) => (
    <Badge key={chip} tone="neutral">
      {chip}
    </Badge>
  ));

  const run =
    content === "chips" ? (
      <div className={vertical ? doc.chipCol : doc.chipRow}>{chips}</div>
    ) : (
      <div className={vertical ? doc.scoreStack : doc.cardRow}>{invoiceCards()}</div>
    );

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Conveyor</h2>
        <p className={styles.lede}>
          Arrows at both ends of a row or column that is too long to fit, so people can move it
          along without a scrollbar.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="conveyor-master">
        <div className={styles.masterHeader}>
          <h2 id="conveyor-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Switch what is inside and the direction. The arrows show only when there is something
            to scroll, and turn off at the ends.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={padClass}>
                  {vertical ? (
                    <div className={doc.verticalFrame}>
                      <Conveyor orientation={orientation} label={label}>
                        {run}
                      </Conveyor>
                    </div>
                  ) : (
                    <Conveyor orientation={orientation} label={label}>
                      {run}
                    </Conveyor>
                  )}
                </div>
              </div>
              <ControlsPanel>
                <RadioControl label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />
                <RadioControl label="Content" options={CONTENTS} value={content} onChange={setContent} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Conveyor around a run of chips or cards that does not fit: a row of Badge
                  chips, draft invoices, or a tall side list. It is not for KPIs: Scoreboard wraps
                  its figures and is the only metric picker. One component — put the run inside it. Arrows show
                  only when there is overflow, and each one disables at its end. A soft fade sits
                  where content passes under an arrow. A press moves most of a screenful, or the
                  step you set. Trackpad, wheel, and drag still work. Focus the run; arrow keys
                  scroll it. For
                  paged slides with a Slide 2 of 5 caption, use Carousel. In a box narrower than
                  40rem (--grid-breakpoint-sm), the arrows give way to swipe: the track keeps the
                  whole width and comes to rest on a whole piece. It stays a focus stop, so the
                  arrow keys still move it.
                </p>
              </div>
              <CodeBlock code={masterCode(orientation, content)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>A row that does not fit</h2>
              <div className={styles.exampleCanvas}>
                <div className={doc.previewPad}>
                  <Conveyor label="Draft invoices">
                    <div className={doc.cardRow}>{invoiceCards()}</div>
                  </Conveyor>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The arrows show only when there is something to scroll, and turn off at the ends.
                  Put chips or cards inside; KPIs go in Scoreboard, which wraps instead.
                </p>
              </div>
              <CodeBlock
                code={`<Conveyor label="Draft invoices">
  <div className="row">{invoiceCards}</div>
</Conveyor>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Vertical list</h2>
              <div className={styles.exampleCanvas}>
                <div className={`${doc.previewPad} ${doc.previewPadVertical}`}>
                  <div className={doc.verticalFrame}>
                    <Conveyor orientation="vertical" label="Draft invoices">
                      <div className={doc.scoreStack}>
                        {invoiceCards(6)}
                      </div>
                    </Conveyor>
                  </div>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Vertical puts the arrows above and below. Give the Conveyor a height — a space
                  token or a fixed demo height — so the column can overflow.
                </p>
              </div>
              <CodeBlock
                code={`<Conveyor orientation="vertical" label="Draft invoices">
  {cards}
</Conveyor>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
