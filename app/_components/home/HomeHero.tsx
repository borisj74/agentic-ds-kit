"use client";

import { useRouter } from "next/navigation";
import { Button } from "agentic-ds-kit";
import { HomeStory } from "./HomeStory";
import styles from "./Home.module.css";

/**
 * Hero, left-aligned and written for the person who owns the design system: the promise, one line,
 * and two ways in. Under it the story: one product screen, pinned, that agents
 * build, a brand repaints and a review checks as the reader scrolls. The kit Button has no link
 * form, so the two calls to action navigate with the router.
 */
export function HomeHero() {
  const router = useRouter();

  return (
    <div className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroTitle} data-motion="hero">
          Agents build with your system. It stays yours
        </h1>
        <p className={styles.heroLead} data-motion="hero">
          Nistha hands coding agents your components, tokens and rules as contracts they read first, so every screen they
          build stays on-system and on-brand.
        </p>
        <div className={styles.heroActions} data-motion="hero">
          <Button size="lg" iconEnd="ArrowRight" onClick={() => router.push("/start-here")}>
            Start here
          </Button>
          <Button size="lg" appearance="outline" mode="neutral" onClick={() => router.push("/components")}>
            Browse components
          </Button>
        </div>
      </div>
      <HomeStory />
    </div>
  );
}
