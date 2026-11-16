"use client";

import { useRouter } from "next/navigation";
import { Button } from "agentic-ds-kit";
import { HomeCommand } from "./HomeCommand";
import styles from "./Home.module.css";

/**
 * Hero, left-aligned: the promise, one line under it and two ways in, then a large browser frame
 * with an agent Command screen built live from kit parts. The kit Button has no link form, so the
 * two calls to action navigate with the router.
 */
export function HomeHero() {
  const router = useRouter();

  return (
    <div className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroTitle} data-motion="hero">
          Your agent reads the contract. Then it writes the UI.
        </h1>
        <p className={styles.heroLead} data-motion="hero">
          Every Nistha component ships with a JSON contract, semantic tokens and a review step, so a coding agent builds
          screens that match your system on the first pass.
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
      <HomeCommand />
    </div>
  );
}
