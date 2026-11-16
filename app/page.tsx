import type { Metadata } from "next";
import NextLink from "next/link";
import { Accordion } from "agentic-ds-kit";
import kitPackage from "agentic-ds-kit/package.json";
import { canonical } from "@/lib/site";
import { HOME_FAQ } from "@/lib/home.sample";
import { HomeAgents } from "./_components/home/HomeAgents";
import { HomeFooter } from "./_components/home/HomeFooter";
import { HomeHero } from "./_components/home/HomeHero";
import { HomeJobs } from "./_components/home/HomeJobs";
import { HomeLoop } from "./_components/home/HomeLoop";
import { HomeMotion } from "./_components/home/HomeMotion";
import { HomeNav } from "./_components/home/HomeNav";
import { HomeReview } from "./_components/home/HomeReview";
import { HomeTheme } from "./_components/home/HomeTheme";
import { HomeThemes } from "./_components/home/HomeThemes";
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

/** A section's small numbered label: "01 Contracts". */
function Label({ number, children }: { number: string; children: string }) {
  return (
    <p className={styles.label}>
      <span className={styles.labelNumber}>{number}</span>
      {children}
    </p>
  );
}

/**
 * The docs home, a quiet landing page with its own top nav (no docs sidebar), in the Ink colour
 * set so colour lives only in the product previews. The hero shows an agent Command screen built
 * from kit parts; How it works puts a contract beside its component; three numbered sections follow, each laid out its own way: contracts as job scenes,
 * tokens and themes, then the review step. Questions and how an agent
 * uses the kit end the page. Every preview is a real kit component or block with example data.
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
          <header className={styles.headStack} data-motion="reveal">
            <p className={styles.label}>How it works</p>
            <h2 id="home-how" className={styles.sectionTitle}>
              Your agent reads the contract, then renders the real component.
            </h2>
          </header>
          <div data-motion="reveal">
            <HomeLoop />
          </div>
        </section>

        {/* 01: label and title on the left, the lead on the right, then the scenes full width. */}
        <section className={styles.section} data-section="contracts" aria-labelledby="home-contracts">
          <header className={`layout-split ${styles.headSplit}`} data-motion="reveal">
            <div className={styles.headStack}>
              <Label number="01">Contracts</Label>
              <h2 id="home-contracts" className={styles.sectionTitle}>
                Pick the job. The kit has the whole scene.
              </h2>
            </div>
            <p className={styles.sectionLead}>
              Approving a plan, watching a run, chasing a failure, talking to an agent: each is one block your agent drops
              into a page, built from parts that each carry their own contract.
            </p>
          </header>
          <div data-motion="reveal">
            <HomeJobs />
          </div>
        </section>

        {/* 02: copy on the left, the themed workspace on the right. */}
        <section className={styles.section} data-section="themes" aria-labelledby="home-themes">
          <div className={`layout-split--secondary ${styles.themeSplit}`}>
            <header className={styles.headStack} data-motion="reveal">
              <Label number="02">Tokens and themes</Label>
              <h2 id="home-themes" className={styles.sectionTitle}>
                Components name roles, not colours.
              </h2>
              <p className={styles.sectionLead}>
                A button asks for the action colour and a card for the card surface. Swap the colour set or switch to dark,
                and the same markup follows without a single edit.
              </p>
            </header>
            <div data-motion="reveal">
              <HomeThemes />
            </div>
          </div>
        </section>

        {/* 03: the demo first, the copy beside it on wide screens. */}
        <section className={styles.section} data-section="review" aria-labelledby="home-review">
          <div className={`layout-split--primary ${styles.reviewSplit}`}>
            <div className={styles.reviewDemo} data-motion="reveal">
              <HomeReview />
            </div>
            <header className={styles.headStack} data-motion="reveal">
              <Label number="03">Review</Label>
              <h2 id="home-review" className={styles.sectionTitle}>
                It checks its own work before you do.
              </h2>
              <p className={styles.sectionLead}>
                The review command reads the files your agent changed and points at anything off-system: a raw value, a
                local copy of a kit part, a control nobody can name. Each finding comes with its fix.
              </p>
            </header>
          </div>
        </section>

        <section className={styles.section} data-section="faq" aria-labelledby="home-faq">
          <div className={`layout-split--secondary ${styles.faqSplit}`}>
            <h2 id="home-faq" className={styles.sectionTitle} data-motion="reveal">
              Questions
            </h2>
            <div className={styles.faq} data-motion="reveal">
              <Accordion items={HOME_FAQ} defaultOpen="agent" />
            </div>
          </div>
        </section>

        <section className={styles.section} data-section="agents" aria-labelledby="home-agents">
          <header className={styles.agentsHead} data-motion="reveal">
            <h2 id="home-agents" className={styles.sectionTitle}>
              Your agent builds with the kit, not around it.
            </h2>
            <p className={styles.sectionLead}>Connect once. It looks up the right part, adds it, then checks its own work.</p>
          </header>
          <div data-motion="reveal">
            <HomeAgents />
          </div>
        </section>

        <HomeFooter version={kitPackage.version} />
      </main>
    </HomeTheme>
  );
}
