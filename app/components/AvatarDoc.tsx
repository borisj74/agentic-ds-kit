"use client";

import { useState } from "react";
import { Avatar } from "agentic-ds-kit";
import type { AvatarPresence, AvatarShape, AvatarSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import { FACES } from "./faces";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl, SizeControl, SwitchControl } from "./ControlsPanel";

const SIZES: AvatarSize[] = ["xs", "sm", "md", "lg", "xl"];
const SHAPES: AvatarShape[] = ["circle", "square"];
const PRESENCES: AvatarPresence[] = ["online", "away", "offline"];
const APPEARANCES = ["photo", "initials"] as const;

type Appearance = (typeof APPEARANCES)[number];

const PEOPLE = [
  { name: "Boris Jovanovic", initials: "BJ" },
  { name: "Ada Jones", initials: "AJ" },
  { name: "Mira", initials: "MI" },
] as const;

function masterCode(size: AvatarSize, appearance: Appearance, shape: AvatarShape, presence: boolean): string {
  const extra = `${shape === "square" ? ' shape="square"' : ""}${presence ? ' presence="online"' : ""}`;
  if (appearance === "photo") {
    return `<Avatar name="Maya Chen" src="${FACES["Maya Chen"]}" size="${size}"${extra} />`;
  }
  return `<Avatar name="Maya Chen" size="${size}"${extra} />`;
}

export function AvatarDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<AvatarSize>("md");
  const [appearance, setAppearance] = useState<Appearance>("photo");
  const [shape, setShape] = useState<AvatarShape>("circle");
  const [presence, setPresence] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Avatar</h2>
        <p className={styles.lede}>
          A person (circle) or an organisation (square), xs 20 to xl 48. Presence is a mark plus a word. Badge is for
          status. Not a button.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="avatar-master">
        <div className={styles.masterHeader}>
          <h2 id="avatar-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Switch size, source, shape and presence. Initials get a tint picked from the name.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Avatar
                    name="Maya Chen"
                    src={appearance === "photo" ? FACES["Maya Chen"] : undefined}
                    size={size}
                    shape={shape}
                    presence={presence ? "online" : undefined}
                  />
                </div>
              </div>
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
                <RadioControl label="Appearance" options={APPEARANCES} value={appearance} onChange={setAppearance} />
                <RadioControl label="Shape" options={SHAPES} value={shape} onChange={setShape} />
                <SwitchControl label="States" items={[{ label: "Presence", checked: presence, onChange: setPresence }]} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Always pass name. src is optional — a missing or broken image falls back to initials from
                  name. Use kit Avatar only. Badge is not for people. Several people go in AvatarGroup. A
                  Lucide User icon appears only if both the image and initials fail.
                </p>
              </div>
              <CodeBlock code={masterCode(size, appearance, shape, presence)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Photo</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Avatar key={step} name="Maya Chen" src={FACES["Maya Chen"]} size={step} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Photo avatars from xs to xl. The image is cropped to the shape.</p>
              </div>
              <CodeBlock
                code={SIZES.map((step) => `<Avatar name="Maya Chen" src="${FACES["Maya Chen"]}" size="${step}" />`).join(
                  "\n",
                )}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Initials</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {PEOPLE.map((person) => (
                    <Avatar key={person.name} name={person.name} size="md" />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Omit src to show initials. Two words become first-and-last letters (Boris Jovanovic → BJ).
                  One word uses the first two letters (Mira → MI). The tint comes from the name, so the same
                  person always gets the same one.
                </p>
              </div>
              <CodeBlock
                code={PEOPLE.map((person) => `<Avatar name="${person.name}" />`).join("\n")}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Avatar key={step} name="Ada Jones" size={step} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Sizes follow the text line: xs 20 (dense table), sm 24 (table row), md 32 (two-line list), lg 40
                  (card header), xl 48 (profile header). sm, md and lg used to be 32, 40 and 48.
                </p>
              </div>
              <CodeBlock
                code={SIZES.map((step) => `<Avatar name="Ada Jones" size="${step}" />`).join("\n")}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Shape</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Avatar name="Ana Ruiz" size="md" />
                  <Avatar name="Northwind Traders" size="md" shape="square" />
                  <Avatar name="Fernway Tours" size="sm" shape="square" />
                  <Avatar name="Quarry Coffee" size="xs" shape="square" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Circle for people, square for organisations such as customers and workspaces. In an invoice
                  table the customer is square and the owner is round.
                </p>
              </div>
              <CodeBlock
                code={'<Avatar name="Ana Ruiz" size="md" />\n<Avatar name="Northwind Traders" size="md" shape="square" />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Presence</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {PRESENCES.map((state) => (
                    <Avatar key={state} name="Leo Sato" size="md" presence={state} />
                  ))}
                  <Avatar name="Maya Chen" src={FACES["Maya Chen"]} size="lg" presence="online" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Online is a solid mark, away is half filled, offline is hollow. The word joins the
                  accessible name (Ana Ruiz, Online) and should also show in the row text, like Online ·
                  ana@acme.com. Translate the words with KitLabelsProvider (online, away, offline).
                </p>
              </div>
              <CodeBlock
                code={PRESENCES.map((state) => `<Avatar name="Leo Sato" size="md" presence="${state}" />`).join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
