#!/usr/bin/env node
/**
 * Fills the catalog regions of README.md and packages/kit/README.md from
 * packages/kit/contracts/index.json, so the counts and lists never drift from the index.
 *
 *   node scripts/sync-readme-catalog.mjs          # rewrite both READMEs
 *   node scripts/sync-readme-catalog.mjs --check  # exit 1 when a README differs or the map is stale
 *
 * Each generated region sits between `<!-- catalog:<name> -->` and `<!-- /catalog:<name> -->`.
 * Text outside the markers is left alone.
 *
 * Components (blocks not included), blocks and patterns are counted separately, and each count
 * leaves out `status: "deprecated"` rows. Deprecated rows are still exported, so they get their own
 * line with a count and their names. The name lists leave them out too.
 * The index has no display names or README groups, so CATEGORIES below holds both: each entry is
 * a PascalCase name whose lowercase form is the index id. Every non-deprecated component and block
 * in the index must appear in CATEGORIES (or BLOCK_CATEGORIES), every deprecated one in
 * DEPRECATED_NAMES, and every name in these maps must be in the index, or the script fails.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(repoRoot, "packages/kit/contracts/index.json");

/** README groups for components that are not blocks, in README order. */
export const CATEGORIES = {
  Actions: ["Button", "IconButton", "ButtonGroup", "SplitButton", "DropdownMenu", "FilterButton", "FilterBar"],
  Forms: [
    "Input", "Textarea", "Select", "SegmentedControl", "TileGroup", "InputOTP", "Checkbox", "RadioGroup",
    "Switch", "Slider", "Field", "FieldSet", "SaveBar", "DatePicker", "DateRangePicker", "DateTimePicker",
    "TimePicker", "NumberInput", "CurrencyInput", "Combobox", "MultiSelect", "TagInput", "ColorPicker",
    "FileUpload",
  ],
  "Data & charts": [
    "Table", "DataTable", "DataGrid", "Cell", "HeaderCell", "ListView", "LinkList", "TreeView", "UsageList",
    "Scorecard", "Scoreboard", "LineChart", "BarChart", "BarList", "ComboChart", "Heatmap", "PieChart",
    "ScatterChart", "NumberTransition", "InsightCard", "Calendar", "Meter",
  ],
  Feedback: [
    "Alert", "Badge", "Tag", "Count", "Delta", "Kbd", "Tooltip", "Toast", "Empty", "LoadError", "Progress",
    "ProgressSteps", "Spinner", "LoadingAnimation", "ThinkingAnimation", "ShimmerText", "Skeleton",
  ],
  Overlays: ["Modal", "ModalCard", "Drawer", "AlertDialog", "Command", "HelpPopover", "Popover", "ContextMenu"],
  "Navigation & chrome": [
    "AppHeader", "AppNav", "SideNav", "AnchorNav", "Link", "NavigationMenu", "Breadcrumb", "Tabs",
    "Pagination", "PageHeader", "Section",
  ],
  Structure: [
    "Card", "Divider", "Accordion", "Collapsible", "Resizable", "Carousel", "Conveyor", "Avatar", "AvatarGroup",
    "Chat", "Timeline", "CodeSnippet",
  ],
  Agent: [
    "ApprovalCard", "AssumptionLog", "AgentTrail", "AgentPlan", "ToolCallCard", "PermissionRequest",
    "RedactionPreview", "RunningNow", "AgentMonitor", "AgentTree", "AgentInbox", "GuardrailLog",
    "DecisionCard", "DoneCheck", "AutonomyDial", "AgentSteering", "ModelPicker", "ContextWindow",
    "CitedAnswer", "MessageActions", "InlineDiff", "MemoryPanel", "TraceWaterfall", "UsageMeter", "TaskBrief",
  ],
  SaaS: [
    "SetupGuide", "NotificationStack", "ChangeSummary", "ExperimentCard", "CommentThread", "CommentsPanel",
    "IntegrationPicker", "PricingPlans", "InvoiceDocument", "BillingSchedule", "TaskBoard",
  ],
  Motion: ["BlurCrossfade", "TextReveal", "TiltCard", "GridBackground", "GradientText"],
};

/** README groups for blocks (`"kind": "block"`), in README order. */
export const BLOCK_CATEGORIES = {
  Agents: ["AgentOverview", "RunDetail", "PlanReview", "ChangeReview", "EvalSuite", "FailureClusters"],
  Productivity: ["WorkBoard", "ActivityFeed"],
  Analytics: ["KpiBoard"],
  Billing: ["UsageBilling"],
  Pricing: ["Plans"],
  "Social proof": ["LogoStrip"],
};

/** Display names for deprecated rows, which are not in a README group. Lowercase form is the id. */
export const DEPRECATED_NAMES = ["AgentFleet", "AgentLanes", "LiveSession", "AppDirectory"];

/** Reads the index and checks it against the category maps. Returns { catalog, errors }. */
export function loadCatalog(index = JSON.parse(readFileSync(indexPath, "utf8"))) {
  const errors = [];
  const components = index.filter((row) => row.group === "component");
  const blocks = components.filter((row) => row.kind === "block");
  const patterns = index.filter((row) => row.group === "pattern");
  const live = (row) => row.status !== "deprecated";

  const byId = new Map(components.map((row) => [row.id, row]));
  const seen = new Set();
  const resolve = (map, wantBlock) => {
    const groups = [];
    for (const [label, names] of Object.entries(map)) {
      const kept = [];
      for (const name of names) {
        const id = name.toLowerCase();
        const row = byId.get(id);
        if (seen.has(id)) errors.push(`${name} is listed twice in the category map.`);
        seen.add(id);
        if (!row) errors.push(`${name} (${label}) is not in contracts/index.json.`);
        else if (!live(row)) errors.push(`${name} (${label}) is deprecated; remove it from the category map.`);
        else if ((row.kind === "block") !== wantBlock)
          errors.push(`${name} belongs in ${wantBlock ? "CATEGORIES" : "BLOCK_CATEGORIES"}.`);
        else kept.push(name);
      }
      groups.push({ label, names: kept });
    }
    return groups;
  };
  const componentGroups = resolve(CATEGORIES, false);
  const blockGroups = resolve(BLOCK_CATEGORIES, true);

  const deprecatedNames = [];
  const deprecatedIds = new Set();
  for (const name of DEPRECATED_NAMES) {
    const id = name.toLowerCase();
    const row = index.find((item) => item.id === id);
    if (deprecatedIds.has(id)) errors.push(`${name} is listed twice in DEPRECATED_NAMES.`);
    deprecatedIds.add(id);
    if (!row) errors.push(`${name} (DEPRECATED_NAMES) is not in contracts/index.json.`);
    else if (live(row)) errors.push(`${name} is not deprecated in contracts/index.json; move it out of DEPRECATED_NAMES.`);
  }
  // Deprecated rows in index order, so the line follows the index rather than the map.
  for (const row of index) {
    if (row.group === "foundation" || live(row)) continue;
    const name = DEPRECATED_NAMES.find((item) => item.toLowerCase() === row.id);
    if (name) deprecatedNames.push(name);
    else errors.push(`${row.id} is deprecated in contracts/index.json but not in DEPRECATED_NAMES in scripts/sync-readme-catalog.mjs.`);
  }

  for (const row of components) {
    if (live(row) && !seen.has(row.id)) {
      const map = row.kind === "block" ? "BLOCK_CATEGORIES" : "CATEGORIES";
      errors.push(`${row.id} is in contracts/index.json but not in ${map} in scripts/sync-readme-catalog.mjs.`);
    }
  }

  return {
    errors,
    catalog: {
      componentCount: components.filter((row) => row.kind !== "block" && live(row)).length,
      blockCount: blocks.filter(live).length,
      patternCount: patterns.filter(live).length,
      deprecatedCount: index.filter((row) => row.group !== "foundation" && !live(row)).length,
      deprecatedNames,
      componentGroups,
      blockGroups,
      patternIds: patterns.filter(live).map((row) => row.id),
    },
  };
}

const deprecatedLine = (c) =>
  c.deprecatedCount === 0
    ? "Deprecated (still exported): 0"
    : `Deprecated (still exported): ${c.deprecatedCount} — ${c.deprecatedNames.join(", ")}`;

const bullets = (groups) =>
  groups.filter((group) => group.names.length > 0).map((group) => `- **${group.label}** — ${group.names.join(", ")}`).join("\n");

/** Region renderers per README. Block regions get a newline on each side; inline ones do not. */
export const RENDERERS = {
  "README.md": {
    counts: (c) =>
      `\n- ${c.componentCount} components\n- ${c.blockCount} blocks\n- ${c.patternCount} patterns\n\n${deprecatedLine(c)}\n`,
    components: (c) => `\n${bullets(c.componentGroups)}\n`,
    blocks: (c) => `\n${bullets(c.blockGroups)}\n`,
    patterns: (c) => `\n${c.patternIds.map((id) => `\`${id}\``).join(", ")}\n`,
  },
  "packages/kit/README.md": {
    counts: (c) => `${c.componentCount} components and ${c.blockCount} **blocks**`,
    blocks: (c) => c.blockGroups.flatMap((group) => group.names).join(", "),
    deprecated: (c) => deprecatedLine(c),
    patterns: (c) => `${c.patternCount}: ${c.patternIds.join(", ")}`,
  },
};

/** Replaces every catalog region in `text`. Returns { text, errors }. */
export function fillRegions(text, renderers, catalog, file) {
  const errors = [];
  let out = text;
  for (const [name, render] of Object.entries(renderers)) {
    const open = `<!-- catalog:${name} -->`;
    const close = `<!-- /catalog:${name} -->`;
    const start = out.indexOf(open);
    const end = out.indexOf(close);
    if (start === -1 || end === -1 || end < start || out.indexOf(open, start + 1) !== -1) {
      errors.push(`${file}: needs exactly one ${open} … ${close} region.`);
      continue;
    }
    out = out.slice(0, start + open.length) + render(catalog) + out.slice(end);
  }
  return { text: out, errors };
}

function main() {
  const check = process.argv.includes("--check");
  const { catalog, errors } = loadCatalog();
  const changed = [];
  const updates = [];
  for (const [file, renderers] of Object.entries(RENDERERS)) {
    const path = join(repoRoot, file);
    const before = readFileSync(path, "utf8");
    const result = fillRegions(before, renderers, catalog, file);
    errors.push(...result.errors);
    if (result.text !== before) {
      changed.push(file);
      updates.push([path, result.text]);
    }
  }

  if (errors.length > 0) {
    console.error("README catalog: fix these first:");
    for (const error of errors) console.error(`  ${error}`);
    process.exit(1);
  }
  if (check) {
    if (changed.length === 0) {
      console.log("README catalogs match packages/kit/contracts/index.json.");
      return;
    }
    console.error("README catalog differs from packages/kit/contracts/index.json:");
    for (const file of changed) console.error(`  ${file}`);
    console.error("Run: npm run catalog:readme");
    process.exit(1);
  }
  for (const [path, text] of updates) writeFileSync(path, text);
  console.log(
    changed.length === 0
      ? "README catalogs already match."
      : `Updated ${changed.map((file) => relative(repoRoot, join(repoRoot, file))).join(", ")}.`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
