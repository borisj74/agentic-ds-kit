import { Section, Table } from "agentic-ds-kit";
import { CodeBlock } from "../components/CodeBlock";
import playground from "../playground.module.css";

const TOKEN_COLUMNS = [
  { key: "token", header: "Token", emphasis: true },
  { key: "controls", header: "What it controls" },
  { key: "usedBy", header: "Used by" },
] as const;

const SURFACE_ROWS = [
  {
    token: "--surface-page / --text-primary",
    controls: "Default app background and body text.",
    usedBy: "Page shell, body, default copy.",
  },
  {
    token: "--surface-card",
    controls: "Elevated surfaces.",
    usedBy: "Card, Table, Modal, Drawer.",
  },
  {
    token: "--surface-muted",
    controls: "Subtle wells and supporting regions.",
    usedBy: "Sidebars, code wells, secondary panels.",
  },
  {
    token: "--surface-overlay",
    controls: "Scrim behind overlays.",
    usedBy: "Modal, Drawer, AlertDialog.",
  },
  {
    token: "--surface-brand / --brand-on-brand",
    controls: "Brand fill and text on that fill.",
    usedBy: "Primary Button, selected marks.",
  },
];

const ACTION_ROWS = [
  {
    token: "--action-primary / --action-on-primary",
    controls: "High-emphasis actions.",
    usedBy: "Button variant primary.",
  },
  {
    token: "--action-primary-hover / --action-primary-pressed",
    controls: "Primary interaction states.",
    usedBy: "Primary Button hover and press.",
  },
  {
    token: "--action-secondary",
    controls: "Lower-emphasis filled actions.",
    usedBy: "Secondary Button, supporting UI.",
  },
  {
    token: "--action-danger",
    controls: "Destructive actions.",
    usedBy: "Danger Button, destructive confirms.",
  },
  {
    token: "--focus-ring / --border-focus",
    controls: "Focus rings and focus borders.",
    usedBy: "Buttons, inputs, menus, other controls.",
  },
  {
    token: "--border-faint / --border-strong",
    controls: "Default and stronger separators.",
    usedBy: "Cards, tables, layout dividers.",
  },
];

const STATUS_ROWS = [
  {
    token: "--status-success / --status-success-subtle / --status-success-text",
    controls: "Success fill, well, and copy.",
    usedBy: "Badge, Alert, Toast.",
  },
  {
    token: "--status-warning / --status-warning-subtle / --status-warning-text",
    controls: "Warning fill, well, and copy.",
    usedBy: "Badge, Alert, Toast.",
  },
  {
    token: "--status-danger / --status-danger-subtle / --status-danger-text",
    controls: "Error fill, well, and copy.",
    usedBy: "Badge, Alert, invalid states.",
  },
  {
    token: "--status-info / --status-info-subtle / --status-info-text",
    controls: "Info fill, well, and copy.",
    usedBy: "Badge, Alert, informational notices.",
  },
];

const USAGE = `.page {
  background: var(--surface-page);
  color: var(--text-primary);
}`;

const DARK = `html {
  color-scheme: light;
}

html[data-theme="dark"] {
  color-scheme: dark;
}`;

const DARK_HTML = `<html lang="en" data-theme="dark">`;

const BRAND_HTML = `<html lang="en" data-color="violet">`;

const OVERRIDE = `:root {
  --action-primary: var(--color-violet-600);
  --action-primary-hover: var(--color-violet-700);
  --action-primary-pressed: var(--color-violet-800);
  --brand-primary: var(--color-violet-600);
  --focus-ring: var(--color-violet-500);
}

[data-theme="dark"] {
  --action-primary: var(--color-violet-400);
  --action-primary-hover: var(--color-violet-300);
  --brand-primary: var(--color-violet-400);
  --focus-ring: var(--color-violet-400);
}`;

const RADIUS = `--radius-control-sm: var(--radius-100);
--radius-control-md: var(--radius-200);
--radius-control-lg: var(--radius-300);
--radius-surface-sm: var(--radius-200);
--radius-surface-md: var(--radius-300);
--radius-surface-lg: var(--radius-400);
--radius-pill: var(--radius-full);`;

export default function ThemingPage() {
  return (
    <div className={playground.page}>
      <div className={playground.shell}>
        <h1 className={playground.pageTitle}>Theming</h1>
        <p className={playground.pageLead}>
          Semantic CSS variables. Override those tokens to change the look of the kit without
          rewriting component classes. Use the playground header to preview dark mode and brand
          hues.
        </p>

        <Section
          title="CSS variables"
          description="Importing from agentic-ds-kit loads tokens. Components read semantic vars, not primitive ramps."
          collapsible={false}
        >
          <div className={playground.stack}>
            <p className={playground.body}>
              Use roles such as --surface-page, --text-primary, and --action-primary. Do not use
              primitive --color-* ramps in components. Foundations shows the full scale.
            </p>
            <CodeBlock code={USAGE} />
          </div>
        </Section>

        <Section
          title="Token convention"
          description="Primitives are the source ramps. Semantics are the roles components consume."
          collapsible={false}
        >
          <p className={playground.body}>
            Light values live on :root. Dark values live on [data-theme="dark"]. Brand hues overlay
            brand, action, focus, and link roles via [data-color]. Hex in tokens.css
            is generated from tokens.json — components still only see var().
          </p>
        </Section>

        <Section
          title="Theme tokens"
          description="These families live in agentic-ds-kit/tokens.css. Override the role, not the component."
          collapsible={false}
        >
          <div className={playground.stack}>
            <Table
              size="sm"
              caption="Surfaces and default text."
              columns={[...TOKEN_COLUMNS]}
              rows={[...SURFACE_ROWS]}
            />
            <Table
              size="sm"
              caption="Actions, focus, and borders."
              columns={[...TOKEN_COLUMNS]}
              rows={[...ACTION_ROWS]}
            />
            <Table
              size="sm"
              caption="Status roles for Badge, Alert, and Toast."
              columns={[...TOKEN_COLUMNS]}
              rows={[...STATUS_ROWS]}
            />
          </div>
        </Section>

        <Section
          title="Dark mode"
          description="Set data-theme on the document element. The kit does not use a .dark class."
          collapsible={false}
        >
          <div className={playground.stack}>
            <CodeBlock code={DARK_HTML} />
            <CodeBlock code={DARK} />
            <p className={playground.body}>
              Omit the attribute for light. Pair color-scheme so native controls match. This
              playground stores the choice in localStorage and applies it before paint.
            </p>
          </div>
        </Section>

        <Section
          title="Brand color"
          description="Blue is the default. Violet and teal ship as data-color overlays."
          collapsible={false}
        >
          <div className={playground.stack}>
            <CodeBlock code={BRAND_HTML} />
            <p className={playground.body}>
              Valid values: violet, teal. Leave data-color unset for blue. Dark + brand is
              [data-theme="dark"][data-color="violet"].
            </p>
          </div>
        </Section>

        <Section
          title="Radius scale"
          description="Semantic radius aliases a primitive scale. Change the primitive to move a whole family."
          collapsible={false}
        >
          <div className={playground.stack}>
            <CodeBlock code={RADIUS} />
            <p className={playground.body}>
              Controls use --radius-control-*. Cards and dialogs use --radius-surface-*. Badges
              use --radius-pill. There is no single --radius token.
            </p>
          </div>
        </Section>

        <Section
          title="Override tokens"
          description="After tokens.css loads, reassign semantic roles in your stylesheet. Point them at primitive ramps."
          collapsible={false}
        >
          <div className={playground.stack}>
            <CodeBlock code={OVERRIDE} />
            <p className={playground.body}>
              Prefer data-color when violet or teal is enough. For another hue, override the
              brand, action, and focus roles together. Do not put hex in React components. If a
              role is missing from the kit, stop and ask — do not add a one-off.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
