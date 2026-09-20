"use client";

import { useState, type ReactNode } from "react";
import { Button } from "agentic-ds-kit";
import { ButtonGroup } from "agentic-ds-kit";
import { Drawer } from "agentic-ds-kit";
import type { DrawerSide, DrawerSize } from "agentic-ds-kit";
import { Field } from "agentic-ds-kit";
import { Input } from "agentic-ds-kit";
import { DatePicker } from "agentic-ds-kit";
import { RadioGroup } from "agentic-ds-kit";
import { Select } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIDES: DrawerSide[] = ["right", "left", "bottom", "top"];
const SIZES: DrawerSize[] = ["sm", "md", "lg"];

const SLOTS = [
  {
    value: "standard",
    label: "Standard delivery",
    badge: "Fastest",
    description: "25–35 min · Driver assigned now",
  },
  {
    value: "5-00",
    label: "5:00 PM – 5:15 PM",
    description: "Prep starts at 4:45 PM",
  },
  {
    value: "5-15",
    label: "5:15 PM – 5:30 PM",
    description: "Prep starts at 5:00 PM",
  },
  {
    value: "5-30",
    label: "5:30 PM – 5:45 PM",
    badge: "Most popular",
    description: "High demand",
  },
];

type VariantKey = "right" | "left" | "bottom" | "top" | "footer" | "scrollable" | "large";

function masterCode(side: DrawerSide, size: DrawerSize, showDescription: boolean, showClose: boolean) {
  const lines = [
    "<Drawer",
    "  open={open}",
    '  title="Pick a delivery time"',
  ];
  if (showDescription) {
    lines.push(`  description="We'll prepare your order as soon as possible."`);
  }
  lines.push(`  side="${side}"`);
  if (size !== "md") lines.push(`  size="${size}"`);
  if (!showClose) lines.push("  showClose={false}");
  lines.push(
    "  onClose={close}",
    "  footer={",
    "    <>",
    '      <Button variant="primary" size="lg" shape="pill" block>Confirm Delivery Time</Button>',
    '      <Button variant="secondary" size="lg" shape="pill" block onClick={close}>Cancel</Button>',
    "    </>",
    "  }",
    ">",
    "  <RadioGroup",
    '    name="delivery-time"',
    '    legend="Delivery time"',
    "    hideLegend",
    '    layout="card"',
    '    defaultValue="standard"',
    "    options={slots}",
    "  />",
    "</Drawer>",
  );
  return lines.join("\n");
}

function DeliveryFooter({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Button variant="primary" size="lg" shape="pill" block onClick={onClose}>
        Confirm Delivery Time
      </Button>
      <Button variant="secondary" size="lg" shape="pill" block onClick={onClose}>
        Cancel
      </Button>
    </>
  );
}

function DeliverySlots({ name }: { name: string }) {
  const [value, setValue] = useState("standard");
  return (
    <RadioGroup
      name={name}
      legend="Delivery time"
      hideLegend
      layout="card"
      value={value}
      onChange={setValue}
      options={SLOTS}
    />
  );
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
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
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
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
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
  const [side, setSide] = useState<DrawerSide>("bottom");
  const [size, setSize] = useState<DrawerSize>("md");
  const [showDescription, setShowDescription] = useState(true);
  const [showClose, setShowClose] = useState(false);
  const [open, setOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState<VariantKey | null>(null);
  const [startDate, setStartDate] = useState("2026-03-01");

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
            Bottom sheet for a delivery window. Switch side, size, description, and close. Overlay
            click and Escape dismiss.
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
                <div className={styles.previewRow}>
                  <Button variant="primary" size="md" onClick={() => setOpen(true)}>
                    Pick a delivery time
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
                  <Switch size="sm" label="Description" checked={showDescription} onChange={setShowDescription} />
                  <Switch size="sm" label="Close" checked={showClose} onChange={setShowClose} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Drawer for a sheet or side panel. Size is sm, md, or lg for left/right/bottom.
                  Use lg when the body has DatePicker or other overlays that must fit without
                  horizontal scroll. Compose kit RadioGroup for the slots and kit Buttons in the
                  footer. Use Modal for a centered short task. Use AlertDialog when they must choose.
                </p>
              </div>
              <CodeBlock code={masterCode(side, size, showDescription, showClose)} />
            </div>
            <Drawer
              open={open}
              title="Pick a delivery time"
              description={
                showDescription ? "We'll prepare your order as soon as possible." : undefined
              }
              side={side}
              size={size}
              showClose={showClose}
              onClose={close}
              footer={<DeliveryFooter onClose={close} />}
            >
              <DeliverySlots name="drawer-delivery" />
            </Drawer>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <Variant
              title="Right"
              usage="Panel slides from the right, inset from top, bottom, and right. Corners use radius-surface-lg."
              code={`<Drawer open={open} title="Edit profile" side="right" onClose={close}>\n  Make changes to your profile.\n</Drawer>`}
              onOpen={() => setVariantOpen("right")}
            >
              <Drawer open={variantOpen === "right"} title="Edit profile" side="right" onClose={close}>
                Make changes to your profile.
              </Drawer>
            </Variant>

            <Variant
              title="Left"
              usage="Panel slides from the left, inset from top, bottom, and left. Corners use radius-surface-lg."
              code={`<Drawer open={open} title="Edit profile" side="left" onClose={close}>\n  Make changes to your profile.\n</Drawer>`}
              onOpen={() => setVariantOpen("left")}
            >
              <Drawer open={variantOpen === "left"} title="Edit profile" side="left" onClose={close}>
                Make changes to your profile.
              </Drawer>
            </Variant>

            <Variant
              title="Bottom"
              usage="Floating sheet from the bottom. Corners use radius-surface-lg. Compose RadioGroup cards for a picker."
              code={`<Drawer open={open} title="Pick a delivery time" side="bottom" showClose={false} onClose={close} footer={footer}>\n  <RadioGroup layout="card" hideLegend ... />\n</Drawer>`}
              onOpen={() => setVariantOpen("bottom")}
            >
              <Drawer
                open={variantOpen === "bottom"}
                title="Pick a delivery time"
                description="We'll prepare your order as soon as possible."
                side="bottom"
                showClose={false}
                onClose={close}
                footer={<DeliveryFooter onClose={close} />}
              >
                <DeliverySlots name="drawer-bottom-delivery" />
              </Drawer>
            </Variant>

            <Variant
              title="Top"
              usage="Panel slides from the top, inset from top, left, and right. Corners use radius-surface-lg."
              code={`<Drawer open={open} title="Edit profile" side="top" onClose={close}>\n  Make changes to your profile.\n</Drawer>`}
              onOpen={() => setVariantOpen("top")}
            >
              <Drawer open={variantOpen === "top"} title="Edit profile" side="top" onClose={close}>
                Make changes to your profile.
              </Drawer>
            </Variant>

            <Variant
              title="Large with DatePicker"
              usage="size=lg for forms with DatePicker in a trailing column. The month grid stays inside the sheet — no horizontal scroll."
              code={`<Drawer open={open} title="Subscription" side="right" size="lg" onClose={close}>\n  <Field label="Term">…</Field>\n  <Field label="Start date" htmlFor="start-date">\n    <DatePicker id="start-date" value={date} onValueChange={setDate} />\n  </Field>\n</Drawer>`}
              onOpen={() => setVariantOpen("large")}
            >
              <Drawer
                open={variantOpen === "large"}
                title="Subscription"
                description="Choose term and start date."
                side="right"
                size="lg"
                onClose={close}
                footer={<Actions onClose={close} />}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--space-4)",
                  }}
                >
                  <Field label="Term" htmlFor="drawer-term">
                    <Select
                      id="drawer-term"
                      options={[
                        { value: "monthly", label: "Monthly" },
                        { value: "annual", label: "Annual" },
                      ]}
                      defaultValue="monthly"
                    />
                  </Field>
                  <Field label="Start date" htmlFor="drawer-start-date">
                    <DatePicker
                      id="drawer-start-date"
                      value={startDate}
                      onValueChange={setStartDate}
                    />
                  </Field>
                </div>
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
