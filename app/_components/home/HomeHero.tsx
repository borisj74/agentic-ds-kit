"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Checkbox, GridBackground, InputOTP } from "agentic-ds-kit";
import { HomeStage } from "./HomeStage";
import styles from "./Home.module.css";

/**
 * Hero: the kit at a glance, the headline, two ways in, then the live agent stage. A faded verify
 * card sits half off the right edge on wide screens, as in Paper; it is decoration, hidden from
 * assistive tech and inert. Paper's calendar card on the left is left out: the kit has no inline
 * month picker, only the full event Calendar. The kit Button has no link form, so the two calls
 * to action navigate with the router.
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
      <div className={styles.heroSide} data-side="end" aria-hidden="true" inert>
        <Card title="Verify it's you" description="Enter the 6-digit code we sent to +351 ••• ••• 821">
          <InputOTP id="home-hero-otp" ariaLabel="Example code" defaultValue="482" />
          <Checkbox id="home-hero-trust" label="Trust this device for 30 days" defaultChecked />
          <Button block appearance="soft" mode="neutral" disabled>
            Verify
          </Button>
        </Card>
      </div>
      <GridBackground variant="lines" className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.statPill}>
            <span>{`agentic-ds-kit ${short}`}</span>
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
