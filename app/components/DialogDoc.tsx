"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import { Dialog } from "@/ui/Dialog";
import type { DialogSize } from "@/ui/Dialog";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SIZES: DialogSize[] = ["lg", "md"];
const STACK = { display: "grid", gap: "var(--space-4)" } as const;

type VariantKey = "plain" | "footer" | "noclose" | "large" | "scrollable";

function masterCode(size: DialogSize, showDescription: boolean, showClose: boolean) {
  const lines = [
    "<Dialog",
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
    '    <ButtonGroup ariaLabel="Dialog actions">',
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
    "</Dialog>",
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
  ariaLabel = "Dialog actions",
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
          Extra profile notes line {index + 1}. The header and footer stay put while this body
          scrolls.
        </p>
      ))}
    </div>
  );
}

export function DialogDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<DialogSize>("md");
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
        <h1 className={styles.heroTitle}>Dialog</h1>
        <p className={styles.lede}>Dismissible overlay. Not AlertDialog. Not Drawer.</p>
      </header>

      <section className={styles.master} aria-labelledby="dialog-master">
        <div className={styles.masterHeader}>
          <h2 id="dialog-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Open the dialog, then switch size, description, and close. Overlay click and Escape
            dismiss.
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
                <div className={styles.previewRow}>
                  <Button variant="primary" size="md" onClick={() => setOpen(true)}>
                    Open dialog
                  </Button>
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
                  Use Dialog for short forms and extra detail that can be dismissed. Use AlertDialog
                  when they must choose. Use Drawer for an edge panel.
                </p>
              </div>
              <CodeBlock code={masterCode(size, showDescription, showClose)} />
            </div>
            <Dialog
              open={open}
              title="Edit profile"
              description={showDescription ? "Make changes to your profile here." : undefined}
              size={size}
              showClose={showClose}
              onClose={close}
              footer={<Actions onClose={close} />}
            >
              <ProfileFields nameId="dialog-name" emailId="dialog-email" />
            </Dialog>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <Variant
              title="Plain"
              usage="Title and a short body. No description. Close is on."
              code={`<Dialog open={open} title="Edit profile" onClose={close}>\n  Make changes to your profile.\n</Dialog>`}
              onOpen={() => setVariantOpen("plain")}
            >
              <Dialog open={variantOpen === "plain"} title="Edit profile" onClose={close}>
                Make changes to your profile.
              </Dialog>
            </Variant>

            <Variant
              title="With footer"
              usage="Title, description, and footer actions. Overlay click and Escape still close."
              code={`<Dialog\n  open={open}\n  title="Edit profile"\n  description="Make changes to your profile here."\n  onClose={close}\n  footer={\n    <ButtonGroup ariaLabel="Dialog actions">\n      <Button variant="secondary" onClick={close}>Cancel</Button>\n      <Button variant="primary" onClick={save}>Save</Button>\n    </ButtonGroup>\n  }\n>\n  ...\n</Dialog>`}
              onOpen={() => setVariantOpen("footer")}
            >
              <Dialog
                open={variantOpen === "footer"}
                title="Edit profile"
                description="Make changes to your profile here."
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ProfileFields nameId="dialog-footer-name" emailId="dialog-footer-email" />
              </Dialog>
            </Variant>

            <Variant
              title="No close"
              usage="showClose is false. Footer still has Cancel. Overlay click and Escape still close."
              code={`<Dialog\n  open={open}\n  title="Edit profile"\n  showClose={false}\n  onClose={close}\n  footer={\n    <ButtonGroup ariaLabel="Dialog actions">\n      <Button variant="secondary" onClick={close}>Cancel</Button>\n      <Button variant="primary" onClick={save}>Save</Button>\n    </ButtonGroup>\n  }\n>\n  ...\n</Dialog>`}
              onOpen={() => setVariantOpen("noclose")}
            >
              <Dialog
                open={variantOpen === "noclose"}
                title="Edit profile"
                showClose={false}
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ProfileFields nameId="dialog-noclose-name" emailId="dialog-noclose-email" />
              </Dialog>
            </Variant>

            <Variant
              title="Large"
              usage="size lg. Use when the body needs more room than md."
              code={`<Dialog open={open} title="Edit profile" size="lg" onClose={close}>\n  ...\n</Dialog>`}
              onOpen={() => setVariantOpen("large")}
            >
              <Dialog
                open={variantOpen === "large"}
                title="Edit profile"
                description="Make changes to your profile here."
                size="lg"
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ProfileFields nameId="dialog-lg-name" emailId="dialog-lg-email" />
              </Dialog>
            </Variant>

            <Variant
              title="Scrollable"
              usage="Long body. Header and footer stay put. Body scrolls."
              code={`<Dialog open={open} title="Edit profile" onClose={close} footer={footer}>\n  {longBody}\n</Dialog>`}
              onOpen={() => setVariantOpen("scrollable")}
            >
              <Dialog
                open={variantOpen === "scrollable"}
                title="Edit profile"
                description="Make changes to your profile here."
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ScrollCopy />
              </Dialog>
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
            Open dialog
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
