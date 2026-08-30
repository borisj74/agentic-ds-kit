import { Section } from "@/ui/Section";
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
          description="A Next.js playground that proves JSON contracts, a short always-on rule, and one skill help agents prototype without inventing local components."
          collapsible={false}
        >
          <p className={playground.body}>
            Read contracts/index.json, open the matching contract, and import from ui/. If a pattern
            matches the screen, compose from ui/patterns/.
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
