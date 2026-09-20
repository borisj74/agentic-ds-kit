"use client";

import { useState } from "react";
import { Switch } from "agentic-ds-kit";
import { TreeView } from "agentic-ds-kit";
import type { TreeViewItem, TreeViewSelection, TreeViewSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: TreeViewSize[] = ["sm", "md"];
const SELECTIONS: TreeViewSelection[] = ["none", "single", "multiple"];
const DESIGN_BRANCH = ["design", "sienna", "ammar", "caitlyn"];
const MASTER_EXPANDED = ["org", "design", "projects", "powersurge", "client-brief"];

const WORKSPACE: TreeViewItem[] = [
  {
    id: "org",
    label: "Organization",
    children: [
      { id: "eng", label: "Engineering", children: [] },
      {
        id: "design",
        label: "Design",
        children: [
          { id: "sienna", label: "Sienna Hewitt", icon: "User" },
          { id: "ammar", label: "Ammar Foley", icon: "User" },
          { id: "caitlyn", label: "Caitlyn King", icon: "User" },
        ],
      },
      { id: "product", label: "Product", children: [] },
      { id: "marketing", label: "Marketing", children: [] },
      { id: "sales", label: "Sales", children: [] },
      { id: "finance", label: "Finance", children: [] },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    children: [
      {
        id: "powersurge",
        label: "Powersurge",
        children: [
          {
            id: "client-brief",
            label: "Client brief",
            children: [
              { id: "brief-v1", label: "Brief_v1" },
              { id: "brief-v2", label: "Brief_v2" },
            ],
          },
          { id: "deliverables", label: "Deliverables", children: [] },
        ],
      },
      { id: "ikigai", label: "Ikigai Labs", children: [] },
    ],
  },
  { id: "settings", label: "Settings", children: [] },
];

const WITH_DISABLED: TreeViewItem[] = [
  {
    id: "acme",
    label: "Acme",
    children: [
      { id: "north", label: "North America" },
      { id: "emea", label: "EMEA", disabled: true },
      {
        id: "apac",
        label: "APAC",
        children: [
          { id: "tokyo", label: "Tokyo" },
          { id: "sydney", label: "Sydney", disabled: true },
        ],
      },
    ],
  },
  { id: "archive", label: "Archive", disabled: true, children: [] },
];

function selectedFor(mode: TreeViewSelection): string[] {
  if (mode === "single") return ["sienna"];
  if (mode === "multiple") return DESIGN_BRANCH;
  return [];
}

function masterCode(
  size: TreeViewSize,
  selection: TreeViewSelection,
  showIcons: boolean,
  showLines: boolean,
  reorderable: boolean,
) {
  const lines = ["<TreeView", '  label="Workspace"'];
  if (size !== "md") lines.push(`  size="${size}"`);
  if (selection !== "none") lines.push(`  selection="${selection}"`);
  if (showIcons) lines.push("  showIcons");
  if (showLines) lines.push("  showLines");
  if (reorderable) lines.push("  reorderable");
  lines.push(`  defaultExpanded={${JSON.stringify(MASTER_EXPANDED)}}`);
  if (selection !== "none") {
    lines.push(`  defaultSelected={${JSON.stringify(selectedFor(selection))}}`);
  }
  lines.push("  items={workspace}");
  if (reorderable) lines.push("  onItemsChange={setWorkspace}");
  lines.push("/>");
  return lines.join("\n");
}

export function TreeViewDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<TreeViewSize>("md");
  const [selection, setSelection] = useState<TreeViewSelection>("multiple");
  const [showIcons, setShowIcons] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [reorderable, setReorderable] = useState(true);
  const [workspace, setWorkspace] = useState(WORKSPACE);
  const [selected, setSelected] = useState<string[]>(DESIGN_BRANCH);

  function changeSelection(next: TreeViewSelection) {
    setSelection(next);
    setSelected(selectedFor(next));
  }

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>TreeView</h1>
        <p className={styles.lede}>
          A nested list people open and close level by level, like teams in an organization,
          project folders or account hierarchies, to pick or check items.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="treeview-master">
        <div className={styles.masterHeader}>
          <h2 id="treeview-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Simple: selection single, icons off. Advanced: selection multiple, icons and reorderable
            on. Click chevrons to open folders; drag the grip or use Alt+arrow keys to move rows.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewSurface}>
                  <TreeView
                    label="Workspace"
                    items={workspace}
                    size={size}
                    selection={selection}
                    defaultExpanded={MASTER_EXPANDED}
                    selected={selection === "none" ? undefined : selected}
                    onSelectedChange={setSelected}
                    showIcons={showIcons}
                    showLines={showLines}
                    reorderable={reorderable}
                    onItemsChange={reorderable ? setWorkspace : undefined}
                  />
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
                  <span className={styles.panelLabel}>Selection</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Selection">
                    {SELECTIONS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="treeview-selection"
                          value={option}
                          checked={selection === option}
                          onChange={() => changeSelection(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>States</span>
                  <Switch label="Show icons" size="sm" checked={showIcons} onChange={setShowIcons} />
                  <Switch label="Show lines" size="sm" checked={showLines} onChange={setShowLines} />
                  <Switch
                    label="Reorderable"
                    size="sm"
                    checked={reorderable}
                    onChange={setReorderable}
                  />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use TreeView for data that nests: folders and files, an org chart, parent and
                  child accounts, product categories. Simple is chevrons and guide lines, one row
                  selected. Advanced is selection multiple, kit checkboxes, folder icons, and
                  reorderable with a grip Move menu. Do not use it for a flat list, app navigation,
                  or page sections that open and close.
                </p>
              </div>
              <CodeBlock code={masterCode(size, selection, showIcons, showLines, reorderable)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Simple</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewSurface}>
                  <TreeView
                    label="Workspace"
                    items={WORKSPACE}
                    selection="single"
                    defaultExpanded={MASTER_EXPANDED}
                    defaultSelected={["sienna"]}
                    showLines
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Chevrons and guide lines. Open and close teams and projects; one row is selected
                  at a time.
                </p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Advanced</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewSurface}>
                  <TreeView
                    label="Workspace"
                    items={WORKSPACE}
                    selection="multiple"
                    defaultExpanded={MASTER_EXPANDED}
                    defaultSelected={DESIGN_BRANCH}
                    showIcons
                    showLines
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Checkboxes that check whole branches, and folder icons. A mixed branch shows the
                  kit Checkbox indeterminate state.
                </p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Reorderable</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewSurface}>
                  <TreeView
                    label="Workspace"
                    items={WORKSPACE}
                    selection="multiple"
                    defaultExpanded={MASTER_EXPANDED}
                    defaultSelected={DESIGN_BRANCH}
                    showIcons
                    showLines
                    reorderable
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Drag the grip to reorder rows — drop above, below, or onto a folder to nest.
                  Click the grip for a Move menu. Alt+Up/Down swap siblings. Alt+Right nests into
                  the folder above. Alt+Left moves out. Save the tree from onItemsChange.
                </p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Size sm</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewSurface}>
                  <TreeView
                    label="Compact workspace"
                    items={WORKSPACE}
                    size="sm"
                    selection="single"
                    defaultExpanded={["org", "design"]}
                    showIcons
                    showLines
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>sm and md only. This kit has no Density.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewSurface}>
                  <TreeView
                    label="Accounts"
                    items={WITH_DISABLED}
                    selection="multiple"
                    defaultExpanded={["acme", "apac"]}
                    showIcons
                    showLines
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Disabled nodes stay visible and cannot be selected.</p>
              </div>
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewSurface}>
                  <TreeView label="Workspace" items={[]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>An empty tree keeps role=tree and its accessible name.</p>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
