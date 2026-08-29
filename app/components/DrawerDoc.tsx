"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import { Drawer } from "@/ui/Drawer";
import type { DrawerSide } from "@/ui/Drawer";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SIDES: DrawerSide[] = ["right", "left", "bottom", "top"];
const STACK = { display: "grid", gap: "var(--space-4)" } as const;

type VariantKey = "right" | "left" | "bottom" | "top" | "footer" | "scrollable";

function masterCode(side: DrawerSide, showDescription: boolean, showClose: boolean) {
  const lines = [
    "<Drawer",
    "  open={open}",
    '  title="Edit profile"',
  ];
  if (showDescription) {
    lines.push('  description="Make changes to your profile here."');
  }
  lines.push(`  side="${side}"`);
  if (!showClose) lines.push("  showClose={false}");
  lines.push(
    "  onClose={close}",
    "  footer={",
    '    <ButtonGroup ariaLabel="Drawer actions">',
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
    "</Drawer>",
  );
  return lines.join("\n");
}

function Actions({
  onClose,
  ariaLabel = "Drawer actions",
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

export function DrawerDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [side, setSide] = useState<DrawerSide>("right");
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
        <h1 className={styles.heroTitle}>Drawer</h1>
        <p className={styles.lede}>Edge panel. Not Modal. Not AlertDialog.</p>
      </header>

      <section className={styles.master} aria-labelledby="drawer-master">
        <div className={styles.masterHeader}>
          <h2 id="drawer-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Open the drawer, then switch side, description, and close. Overlay click and Escape
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
                    Open drawer
                  </Button>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Side</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Side">
                    {SIDES.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${side === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={side === step}
                        onClick={() => setSide(step)}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>State</span>
                  <Switch size="sm" label="Description" checked={showDescription} onChange={setShowDescription} />
                  <Switch size="sm" label="Close" checked={showClose} onChange={setShowClose} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Drawer for settings, filters, or detail alongside the page. Use Modal for a
                  centered short task. Use AlertDialog when they must choose.
                </p>
              </div>
              <CodeBlock code={masterCode(side, showDescription, showClose)} />
            </div>
            <Drawer
              open={open}
              title="Edit profile"
              description={showDescription ? "Make changes to your profile here." : undefined}
              side={side}
              showClose={showClose}
              onClose={close}
              footer={<Actions onClose={close} />}
            >
              <ProfileFields nameId="drawer-name" emailId="drawer-email" />
            </Drawer>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <Variant
              title="Right"
              usage="Default. Panel slides from the right. Use for SaaS settings."
              code={`<Drawer open={open} title="Edit profile" side="right" onClose={close}>\n  Make changes to your profile.\n</Drawer>`}
              onOpen={() => setVariantOpen("right")}
            >
              <Drawer open={variantOpen === "right"} title="Edit profile" side="right" onClose={close}>
                Make changes to your profile.
              </Drawer>
            </Variant>

            <Variant
              title="Left"
              usage="Panel slides from the left."
              code={`<Drawer open={open} title="Edit profile" side="left" onClose={close}>\n  Make changes to your profile.\n</Drawer>`}
              onOpen={() => setVariantOpen("left")}
            >
              <Drawer open={variantOpen === "left"} title="Edit profile" side="left" onClose={close}>
                Make changes to your profile.
              </Drawer>
            </Variant>

            <Variant
              title="Bottom"
              usage="Sheet from the bottom. Top corners use radius-lg."
              code={`<Drawer open={open} title="Edit profile" side="bottom" onClose={close}>\n  Make changes to your profile.\n</Drawer>`}
              onOpen={() => setVariantOpen("bottom")}
            >
              <Drawer open={variantOpen === "bottom"} title="Edit profile" side="bottom" onClose={close}>
                Make changes to your profile.
              </Drawer>
            </Variant>

            <Variant
              title="Top"
              usage="Panel slides from the top. Bottom corners use radius-lg."
              code={`<Drawer open={open} title="Edit profile" side="top" onClose={close}>\n  Make changes to your profile.\n</Drawer>`}
              onOpen={() => setVariantOpen("top")}
            >
              <Drawer open={variantOpen === "top"} title="Edit profile" side="top" onClose={close}>
                Make changes to your profile.
              </Drawer>
            </Variant>

            <Variant
              title="With footer"
              usage="Title, description, and footer actions. Overlay click and Escape still close."
              code={`<Drawer\n  open={open}\n  title="Edit profile"\n  description="Make changes to your profile here."\n  onClose={close}\n  footer={\n    <ButtonGroup ariaLabel="Drawer actions">\n      <Button variant="secondary" onClick={close}>Cancel</Button>\n      <Button variant="primary" onClick={save}>Save</Button>\n    </ButtonGroup>\n  }\n>\n  ...\n</Drawer>`}
              onOpen={() => setVariantOpen("footer")}
            >
              <Drawer
                open={variantOpen === "footer"}
                title="Edit profile"
                description="Make changes to your profile here."
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ProfileFields nameId="drawer-footer-name" emailId="drawer-footer-email" />
              </Drawer>
            </Variant>

            <Variant
              title="Scrollable"
              usage="Long body. Header and footer stay put. Body scrolls."
              code={`<Drawer open={open} title="Edit profile" onClose={close} footer={footer}>\n  {longBody}\n</Drawer>`}
              onOpen={() => setVariantOpen("scrollable")}
            >
              <Drawer
                open={variantOpen === "scrollable"}
                title="Edit profile"
                description="Make changes to your profile here."
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <ScrollCopy />
              </Drawer>
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
            Open drawer
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
