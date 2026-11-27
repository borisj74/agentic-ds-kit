"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "agentic-ds-kit";
import { Field } from "agentic-ds-kit";
import { Input } from "agentic-ds-kit";
import { Modal } from "agentic-ds-kit";
import type { ModalSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, SizeControl, SwitchControl } from "./ControlsPanel";

const SIZES: ModalSize[] = ["sm", "md", "lg"];
const STACK = { display: "grid", gap: "var(--space-4)" } as const;
/* Not positioned: the contained Modal anchors to the whole preview, so its scrim fills it edge to edge. */
const FRAME: CSSProperties = {
  minHeight: "24rem",
  width: "100%",
};

type VariantKey = "footer" | "noclose" | "large" | "scrollable";

function masterCode(size: ModalSize, showDescription: boolean, showClose: boolean) {
  const lines = [
    "<Modal",
    "  open={open}",
    '  eyebrow="Billing · Invoices"',
    '  title="Edit invoice INV-2042"',
  ];
  if (showDescription) {
    lines.push('  description="Change the due date or the amount."');
  }
  lines.push(`  size="${size}"`);
  if (!showClose) lines.push("  showClose={false}");
  lines.push(
    "  onClose={close}",
    '  footerStart={<Button appearance="outline" mode="neutral" size="sm" iconStart="MessageCircle" onClick={ask}>Ask about this</Button>}',
    "  footer={",
    "    <>",
    '      <Button appearance="outline" mode="neutral" size="sm" onClick={close}>Cancel</Button>',
    '      <Button appearance="solid" mode="primary" size="sm" onClick={save}>Save changes</Button>',
    "    </>",
    "  }",
    ">",
    '  <Field label="Due date" htmlFor="due">',
    '    <Input id="due" />',
    "  </Field>",
    '  <Field label="Amount" htmlFor="amount">',
    '    <Input id="amount" />',
    "  </Field>",
    "</Modal>",
  );
  return lines.join("\n");
}

function Actions({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Button appearance="outline" mode="neutral" size="sm" onClick={onClose}>
        Cancel
      </Button>
      <Button appearance="solid" mode="primary" size="sm" onClick={onClose}>
        Save changes
      </Button>
    </>
  );
}

function Ask() {
  return (
    <Button appearance="outline" mode="neutral" size="sm" iconStart="MessageCircle">
      Ask about this
    </Button>
  );
}

function InvoiceFields({ dateId, amountId }: { dateId: string; amountId: string }) {
  return (
    <div style={STACK}>
      <Field label="Due date" htmlFor={dateId}>
        <Input id={dateId} defaultValue="Dec 4, 2026" />
      </Field>
      <Field label="Amount" htmlFor={amountId}>
        <Input id={amountId} defaultValue="$4,200.00" />
      </Field>
    </div>
  );
}

function ProfileFields({ nameId, emailId }: { nameId: string; emailId: string }) {
  return (
    <div style={STACK}>
      <Field label="Name" htmlFor={nameId}>
        <Input id={nameId} placeholder="Boris Jovanovic" />
      </Field>
      <Field label="Email" htmlFor={emailId}>
        <Input id={emailId} type="email" placeholder="you@example.com" />
      </Field>
    </div>
  );
}

function ScrollCopy() {
  return (
    <div style={STACK}>
      {Array.from({ length: 12 }, (_, index) => (
        <p key={index} style={{ margin: 0 }}>
          Extra profile notes line {index + 1}. The body scrolls while the title and footer stay put.
        </p>
      ))}
    </div>
  );
}

export function ModalDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ModalSize>("md");
  const [showDescription, setShowDescription] = useState(true);
  const [showClose, setShowClose] = useState(true);
  const [open, setOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState<VariantKey | null>(null);

  const close = () => {
    setOpen(false);
    setVariantOpen(null);
  };

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Modal</h2>
        <p className={styles.lede}>Dismissible overlay. Composes ModalCard. Not AlertDialog. Not Drawer.</p>
      </header>

      <section className={styles.master} aria-labelledby="modal-master">
        <div className={styles.masterHeader}>
          <h2 id="modal-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Open the modal in the preview frame, then switch size, description, and close. The header
            has the eyebrow and Close; the footer has Ask on the left. Focus starts on the first field.
            Scrim click and Escape dismiss.
          </p>
          <DocTabList
            value={tab}
            onChange={(id) => {
              setTab(id as "preview" | "variants");
              if (id === "preview") setVariantOpen(null);
              else setOpen(false);
            }}
          />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div style={FRAME}>
                  <div className={styles.previewRow} style={{ minHeight: "24rem" }}>
                    <Button appearance="outline" mode="neutral" size="md" onClick={() => setOpen(true)}>
                      Open modal
                    </Button>
                  </div>
                  <Modal
                    contained
                    open={open}
                    eyebrow="Billing · Invoices"
                    title="Edit invoice INV-2042"
                    description={showDescription ? "Change the due date or the amount." : undefined}
                    size={size}
                    showClose={showClose}
                    onClose={close}
                    footerStart={<Ask />}
                    footer={<Actions onClose={close} />}
                  >
                    <InvoiceFields dateId="modal-due" amountId="modal-amount" />
                  </Modal>
                </div>
              </div>
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
                <SwitchControl
                  label="State"
                  items={[
                    { label: "Description", checked: showDescription, onChange: setShowDescription },
                    { label: "Close", checked: showClose, onChange: setShowClose },
                  ]}
                />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Modal for short forms and extra detail that can be dismissed. Use AlertDialog when
                  they must choose. Use Drawer for an edge panel. Use ModalCard when you need the panel
                  without an overlay. Product screens omit contained so Modal portals to the page.
                </p>
              </div>
              <CodeBlock code={masterCode(size, showDescription, showClose)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <Variant
              title="With footer"
              usage="Title, description, and footer actions. Scrim click and Escape still close."
              code={`<Modal\n  open={open}\n  title="Edit profile"\n  description="Make changes to your profile here."\n  onClose={close}\n  footer={\n    <>\n      <Button appearance="outline" mode="neutral" onClick={close}>Cancel</Button>\n      <Button appearance="solid" mode="primary" onClick={save}>Save</Button>\n    </>\n  }\n>\n  ...\n</Modal>`}
              onOpen={() => setVariantOpen("footer")}
            >
              <Modal
                open={variantOpen === "footer"}
                title="Edit profile"
                description="Make changes to your profile here."
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ProfileFields nameId="modal-footer-name" emailId="modal-footer-email" />
              </Modal>
            </Variant>

            <Variant
              title="No close"
              usage="showClose is false. Footer still has Cancel. Scrim click and Escape still close."
              code={`<Modal\n  open={open}\n  title="Edit profile"\n  showClose={false}\n  onClose={close}\n  footer={\n    <>\n      <Button appearance="outline" mode="neutral" onClick={close}>Cancel</Button>\n      <Button appearance="solid" mode="primary" onClick={save}>Save</Button>\n    </>\n  }\n>\n  ...\n</Modal>`}
              onOpen={() => setVariantOpen("noclose")}
            >
              <Modal
                open={variantOpen === "noclose"}
                title="Edit profile"
                showClose={false}
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ProfileFields nameId="modal-noclose-name" emailId="modal-noclose-email" />
              </Modal>
            </Variant>

            <Variant
              title="Large"
              usage="size lg, to review a list before you act. Below 480px it fills the screen."
              code={`<Modal open={open} title="Edit profile" size="lg" onClose={close}>\n  ...\n</Modal>`}
              onOpen={() => setVariantOpen("large")}
            >
              <Modal
                open={variantOpen === "large"}
                title="Edit profile"
                description="Make changes to your profile here."
                size="lg"
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ProfileFields nameId="modal-lg-name" emailId="modal-lg-email" />
              </Modal>
            </Variant>

            <Variant
              title="Scrollable"
              usage="Long body. Title and footer stay put, the body scrolls, and a divider shows above the footer while it does."
              code={`<Modal open={open} title="Edit profile" onClose={close} footer={footer}>\n  {longBody}\n</Modal>`}
              onOpen={() => setVariantOpen("scrollable")}
            >
              <Modal
                open={variantOpen === "scrollable"}
                title="Edit profile"
                description="Make changes to your profile here."
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ScrollCopy />
              </Modal>
            </Variant>
          </div>
        )}
      </section>
    </div>
  );
}

function Variant({
  title,
  usage,
  code,
  onOpen,
  children,
}: {
  title: string;
  usage: string;
  code: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <section className={styles.example}>
      <h2 className={styles.exampleTitle}>{title}</h2>
      <div className={styles.exampleCanvas}>
        <div className={styles.previewRow}>
          <Button appearance="outline" mode="neutral" size="md" onClick={onOpen}>
            Open modal
          </Button>
        </div>
      </div>
      <div>
        <h3 className={styles.usageTitle}>Usage</h3>
        <p className={styles.usageBody}>{usage}</p>
      </div>
      <CodeBlock code={code} />
      {children}
    </section>
  );
}
