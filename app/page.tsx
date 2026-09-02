import { Section } from "agentic-ds-kit";
import playground from "./playground.module.css";

export default function Home() {
  return (
    <div className={playground.page}>
      <div className={playground.shell}>
        <h1 className={playground.pageTitle}>Getting started</h1>
        <p className={playground.pageLead}>
          Code-only design system. Compose from kit contracts and components — do not invent local
          cousins.
        </p>

        <Section
          title="What this is"
          description="The npm package agentic-ds-kit: JSON contracts, tokens, and React components. This playground is the catalog that consumes it."
          collapsible={false}
        >
          <p className={playground.body}>
            Read packages/kit/contracts/index.json, open the matching contract, and import from
            agentic-ds-kit. If a pattern matches the screen, import that pattern from the package.
          </p>
        </Section>

        <Section
          title="Theming"
          description="Semantic CSS variables. Dark mode is data-theme on html. Brand hues are data-color."
          collapsible={false}
        >
          <p className={playground.body}>
            Override roles such as --action-primary in your CSS. Do not rewrite component classes
            or use primitive --color-* ramps in UI. Open Theming in the sidebar.
          </p>
        </Section>

        <Section
          title="Patterns"
          description="Blueprint compositions that only import kit components. Use these before inventing layouts."
          collapsible={false}
        >
          <p className={playground.body}>
            The dashboard lives under Patterns — SideNav, overview, task table, and assistant rail.
          </p>
        </Section>
      </div>
    </div>
  );
}
