import type { Metadata } from "next";
import NextLink from "next/link";
import { Accordion } from "agentic-ds-kit";
import kitPackage from "agentic-ds-kit/package.json";
import { canonical } from "@/lib/site";
import { HOME_FAQ } from "@/lib/home.sample";
import { HomeAgents } from "./_components/home/HomeAgents";
import { HomeFooter } from "./_components/home/HomeFooter";
import { HomeHero } from "./_components/home/HomeHero";
import { HomeLoop } from "./_components/home/HomeLoop";
import { HomeMotion } from "./_components/home/HomeMotion";
import { HomeNav } from "./_components/home/HomeNav";
import { HomeTheme } from "./_components/home/HomeTheme";
import styles from "./_components/home/Home.module.css";

export const metadata: Metadata = {
  title: { absolute: "Nistha — a code-only design system for coding agents and product UI." },
  ...canonical("/"),
};

/**
 * Runs before first paint on a full load, so CSS can hide the motion targets until GSAP takes
 * them over. Without JS it never runs and everything stays visible (see HomeMotion).
 */
const MOTION_SCRIPT = 'document.documentElement.setAttribute("data-home-motion","pending")';

/**
 * The docs home: a quiet landing page with its own top nav (no docs sidebar), in Ink greys with the
 * Nistha brand colour on the logo and calls to action. The hero tells the whole story on one pinned
 * product screen (built from the kit, repainted by a brand, switched light or dark, checked by
 * review). How it works puts a contract beside its component; questions and how an agent uses the
 * kit end the page. Every preview is a real kit component with example data.
 */
export default function Home() {
  return (
    <HomeTheme className={styles.landing}>
      <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
      <HomeMotion />
      <NextLink className={styles.skip} href="#main">
        Skip to content
      </NextLink>
      <HomeNav version={kitPackage.version} />
      <main id="main" className={`layout-content ${styles.home}`} tabIndex={-1}>
        <HomeHero />

        {/* How it works: one line, then the contract beside the component it describes. */}
        <section className={styles.section} data-section="how" aria-labelledby="home-how">
          <header className={styles.headStack}>
            <p className={styles.label}>How it works</p>
            <h2 id="home-how" className={styles.sectionTitle}>
              Your agent reads the contract, then renders the real component
            </h2>
          </header>
          <div>
            <HomeLoop />
          </div>
        </section>

        <section className={styles.section} data-section="faq" aria-labelledby="home-faq">
          <div className={`layout-split--secondary ${styles.faqSplit}`}>
            <h2 id="home-faq" className={styles.sectionTitle}>
              Questions
            </h2>
            <div className={styles.faq}>
              <Accordion items={HOME_FAQ} defaultOpen="agent" />
            </div>
          </div>
        </section>

        <section className={styles.section} data-section="agents" aria-labelledby="home-agents">
          <header className={styles.agentsHead}>
            <h2 id="home-agents" className={styles.sectionTitle}>
              Your agent builds with the kit, not around it
            </h2>
            <p className={styles.sectionLead}>Connect once. It looks up the right part, adds it, then checks its own work.</p>
          </header>
          <div>
            <HomeAgents />
          </div>
        </section>

        <HomeFooter version={kitPackage.version} />
      </main>
    </HomeTheme>
  );
}
