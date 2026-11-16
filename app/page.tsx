import type { Metadata } from "next";
import NextLink from "next/link";
import { Accordion, Link } from "agentic-ds-kit";
import index from "agentic-ds-kit/contracts/index.json";
import kitPackage from "agentic-ds-kit/package.json";
import { canonical } from "@/lib/site";
import { HOME_FAQ } from "@/lib/home.sample";
import { HomeAgents } from "./_components/home/HomeAgents";
import { HomeBento } from "./_components/home/HomeBento";
import { HomeFooter } from "./_components/home/HomeFooter";
import { HomeHero } from "./_components/home/HomeHero";
import { HomeScreens } from "./_components/home/HomeScreens";
import { HomeThemes } from "./_components/home/HomeThemes";
import styles from "./_components/home/Home.module.css";

export const metadata: Metadata = {
  title: { absolute: "Nistha — a code-only design system for coding agents and product UI." },
  ...canonical("/"),
};

type Entry = { group: string; kind?: string };
const entries = index as Entry[];
const all = entries.filter((entry) => entry.group === "component");
const blocks = all.filter((entry) => entry.kind === "block").length;
/** Components without the blocks, as the stat pill counts them. */
const components = all.filter((entry) => entry.kind !== "block");
const patterns = entries.filter((entry) => entry.group === "pattern").length;

/**
 * The docs home, a landing page: the hero with a live agent stage, the parts by category, whole
 * screens, themes, how agents use the kit, questions, then the footer. Every preview is a real kit
 * component with example data.
 */
export default function Home() {
  return (
    <div className={`layout-content ${styles.home}`}>
      <HomeHero version={kitPackage.version} components={components.length} blocks={blocks} patterns={patterns} />

      <section className={styles.section} aria-labelledby="home-parts">
        <header className={styles.sectionHead}>
          <h2 id="home-parts" className={styles.sectionTitle}>
            {`${components.length} parts, each with a contract an agent reads.`}
          </h2>
          <Link href="/components" linkAs={NextLink} variant="standalone">
            All components →
          </Link>
        </header>
        <HomeBento />
      </section>

      <section className={styles.section} aria-labelledby="home-screens">
        <header className={styles.sectionHead}>
          <h2 id="home-screens" className={styles.sectionTitle}>
            Start from a whole screen, then make it yours.
          </h2>
        </header>
        <HomeScreens />
      </section>

      <section className={styles.section} aria-labelledby="home-themes">
        <header className={styles.sectionHead}>
          <h2 id="home-themes" className={styles.sectionTitle}>
            One screen. Every theme.
          </h2>
          <p className={styles.sectionLead}>Same components, same markup. Flip one attribute and the tokens do the rest.</p>
        </header>
        <HomeThemes />
      </section>

      <section className={styles.section} aria-labelledby="home-agents">
        <header className={styles.sectionHead}>
          <h2 id="home-agents" className={styles.sectionTitle}>
            Your agent builds with the kit, not around it.
          </h2>
          <p className={styles.sectionLead}>Connect once. It looks up the right part, adds it, then checks its own work.</p>
        </header>
        <HomeAgents />
      </section>

      <section className={styles.section} aria-labelledby="home-faq">
        <header className={styles.sectionHead}>
          <h2 id="home-faq" className={styles.sectionTitle}>
            Questions, answered.
          </h2>
          <p className={styles.sectionLead}>
            {"Still stuck? The "}
            <Link href="/get-started" linkAs={NextLink}>
              getting started guide
            </Link>
            {" walks through a first screen."}
          </p>
        </header>
        <div className={styles.faq}>
          <Accordion items={HOME_FAQ} defaultOpen="agent" />
        </div>
      </section>

      <HomeFooter version={kitPackage.version} />
    </div>
  );
}
