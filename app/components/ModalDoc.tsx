"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { Modal } from "@/ui/Modal";
import type { ModalSize } from "@/ui/Modal";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SIZES: ModalSize[] = ["sm", "md", "lg"];
const STACK = { display: "grid", gap: "var(--space-4)" } as const;
const FRAME: CSSProperties = {
  position: "relative",
  minHeight: "24rem",
  width: "100%",
  overflow: "hidden",
  borderRadius: "var(--radius-surface-md)",
};

type VariantKey = "footer" | "noclose" | "large" | "scrollable";

function masterCode(size: ModalSize, showDescription: boolean, showClose: boolean) {
  const lines = [
    "<Modal",
    "  open={open}",
    '  title="Edit profile"',
  ];
  if (showDescription) {
    lines.push('  description="Make changes to your profile here."');
  }
  lines.push(`  size="${size}"`);
  if (!showClose) lines.push("  showClose={false}");
  lines.push(
    "  onClose={close}",
    "  footer={",
    '    <ButtonGroup ariaLabel="Modal actions">',
    '      <Button variant="secondary" onClick={close}>Cancel</Button>',
    '      <Button variant="primary" onClick={save}>Save</Button>',
    "    </ButtonGroup>",
    "  }",
    ">",
    '  <Field label="Name" htmlFor="name">',
    '    <Input id="name" />',
    "  </Field>",
    '  <Field label="Email" htmlFor="email">',
    '    <Input id="email" type="email" />',
    "  </Field>",
    "</Modal>",
  );
  return lines.join("\n");
}

function StateSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className={styles.switch}>
      {label}
      <span className={styles.switchControl} data-checked={checked}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className={styles.switchThumb} />
      </span>
    </label>
  );
}

function Actions({
  onClose,
  ariaLabel = "Modal actions",
}: {
  onClose: () => void;
  ariaLabel?: string;
}) {
  return (
    <ButtonGroup ariaLabel={ariaLabel}>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onClose}>
        Save
      </Button>
    </ButtonGroup>
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
        <h1 className={styles.heroTitle}>Modal</h1>
        <p className={styles.lede}>Dismissible overlay. Composes ModalCard. Not AlertDialog. Not Drawer.</p>
      </header>

      <section className={styles.master} aria-labelledby="modal-master">
        <div className={styles.masterHeader}>
          <h2 id="modal-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Open the modal in the preview frame, then switch size, description, and close. Scrim click
            and Escape dismiss.
          </p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
              onClick={() => {
                setTab("preview");
                setVariantOpen(null);
              }}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "variants"}
              className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`}
              onClick={() => {
                setTab("variants");
                setOpen(false);
              }}
            >
              Variants
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div style={FRAME}>
                  <div className={styles.previewRow} style={{ minHeight: "24rem" }}>
                    <Button variant="primary" size="md" onClick={() => setOpen(true)}>
                      Open modal
                    </Button>
                  </div>
                  <Modal
                    contained
                    open={open}
                    title="Edit profile"
                    description={showDescription ? "Make changes to your profile here." : undefined}
                    size={size}
                    showClose={showClose}
                    onClose={close}
                    footer={<Actions onClose={close} />}
                  >
                    <ProfileFields nameId="modal-name" emailId="modal-email" />
                  </Modal>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${size === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={size === step}
                        onClick={() => setSize(step)}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>State</span>
                  <StateSwitch label="Description" checked={showDescription} onChange={setShowDescription} />
                  <StateSwitch label="Close" checked={showClose} onChange={setShowClose} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Modal for short forms and extra detail that can be dismissed. Use AlertDialog when
                  they must choose. Use Drawer for an edge panel. Use ModalCard when you need the panel
                  without an overlay. Product screens omit contained so Modal portals to the page.
                </p>
              </div>
              <CodeBlock code={masterCode(size, showDescription, showClose)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <Variant
              title="With footer"
              usage="Title, description, and footer actions. Scrim click and Escape still close."
              code={`<Modal\n  open={open}\n  title="Edit profile"\n  description="Make changes to your profile here."\n  onClose={close}\n  footer={\n    <ButtonGroup ariaLabel="Modal actions">\n      <Button variant="secondary" onClick={close}>Cancel</Button>\n      <Button variant="primary" onClick={save}>Save</Button>\n    </ButtonGroup>\n  }\n>\n  ...\n</Modal>`}
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
              code={`<Modal\n  open={open}\n  title="Edit profile"\n  showClose={false}\n  onClose={close}\n  footer={\n    <ButtonGroup ariaLabel="Modal actions">\n      <Button variant="secondary" onClick={close}>Cancel</Button>\n      <Button variant="primary" onClick={save}>Save</Button>\n    </ButtonGroup>\n  }\n>\n  ...\n</Modal>`}
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
              usage="size lg. Use when the body needs more room than md."
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
              usage="Long body. Title and footer stay put. Body scrolls inside the panel."
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
          <Button variant="primary" size="md" onClick={onOpen}>
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
