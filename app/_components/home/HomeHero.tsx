"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, GridBackground } from "agentic-ds-kit";
import { HomeStage } from "./HomeStage";
import styles from "./Home.module.css";

/**
 * Hero: the kit at a glance, the headline, two ways in, then the live agent stage. The kit Button
 * has no link form, so the two calls to action navigate with the router.
 */
export function HomeHero({
  version,
  components,
  blocks,
  patterns,
}: {
  version: string;
  components: number;
  blocks: number;
  patterns: number;
}) {
  const router = useRouter();
  const short = version.split(".").slice(0, 2).join(".");

  return (
    <div className={styles.hero}>
      <GridBackground variant="lines" className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.statPill}>
            <Badge appearance="outline" tone="neutral" size="sm">{`agentic-ds-kit ${short}`}</Badge>
            <span>{`${components} components`}</span>
            <span>{`${blocks} blocks`}</span>
            <span>{`${patterns} patterns`}</span>
          </p>
          <h1 className={styles.heroTitle}>The design system for AI agents.</h1>
          <p className={styles.heroLead}>
            Contracts, tokens and React components your coding agent reads before it writes a line of UI.
          </p>
          <div className={styles.heroActions}>
            <Button size="lg" appearance="outline" mode="neutral" onClick={() => router.push("/components")}>
              Browse components
            </Button>
            <Button size="lg" iconEnd="ArrowRight" onClick={() => router.push("/start-here")}>
              Start here
            </Button>
          </div>
        </div>
      </GridBackground>
      <HomeStage />
    </div>
  );
}
