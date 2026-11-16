"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Calendar, Card, Checkbox, GridBackground, InputOTP } from "agentic-ds-kit";
import { HomeStage } from "./HomeStage";
import styles from "./Home.module.css";

const CODE_LENGTH = 6;

/** A short November schedule for the calendar card; the list view keeps it compact. */
const SCHEDULE = [
  { id: "review", title: "Design review", start: "2026-11-12T10:00", end: "2026-11-12T11:00" },
  { id: "sprint", title: "Review sprint wrap-up", start: "2026-11-13T14:00", end: "2026-11-13T15:00" },
  { id: "ship", title: "Ship 0.28", start: "2026-11-13", allDay: true },
];

/** Paper's right-hand card: a working verify step. Type six digits and Verify lights up. */
function VerifyCard() {
  const [code, setCode] = useState("482");
  const [verified, setVerified] = useState(false);

  return (
    <Card title="Verify it's you" description="Enter the 6-digit code we sent to +351 ••• ••• 821">
      <InputOTP
        id="home-hero-otp"
        ariaLabel="Verification code, example"
        value={code}
        onChange={(next) => {
          setCode(next);
          setVerified(false);
        }}
      />
      <Checkbox id="home-hero-trust" label="Trust this device for 30 days" defaultChecked />
      <Button
        block
        appearance="soft"
        mode={verified ? "neutral" : "primary"}
        iconStart={verified ? "Check" : undefined}
        disabled={code.length < CODE_LENGTH}
        onClick={() => setVerified(true)}
      >
        {verified ? "Verified" : "Verify"}
      </Button>
    </Card>
  );
}

/**
 * Hero (Paper Home J): the kit at a glance, the headline, two ways in, then the live agent
 * stage. A calendar and a verify card sit half off the edges on wide screens, as in Paper; both
 * work. The grid runs under the whole band and fades out from the middle. The kit Button has no
 * link form, so the two calls to action navigate with the router.
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
    <GridBackground variant="lines" className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroSide} data-side="start" data-motion="hero">
          <Calendar label="Example calendar" defaultView="list" defaultDate="2026-11-13" defaultEvents={SCHEDULE} headingLevel={3} />
        </div>
        <div className={styles.heroSide} data-side="end" data-motion="hero">
          <VerifyCard />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.statPill} data-motion="hero">
            <span>{`agentic-ds-kit ${short}`}</span>
            <span>{`${components} components`}</span>
            <span>{`${blocks} blocks`}</span>
            <span>{`${patterns} patterns`}</span>
          </p>
          <h1 className={styles.heroTitle} data-motion="hero">The design system for AI agents.</h1>
          <p className={styles.heroLead} data-motion="hero">
            Contracts, tokens and React components your coding agent reads before it writes a line of UI.
          </p>
          <div className={styles.heroActions} data-motion="hero">
            <Button size="lg" appearance="outline" mode="neutral" onClick={() => router.push("/components")}>
              Browse components
            </Button>
            <Button size="lg" iconEnd="ArrowRight" onClick={() => router.push("/start-here")}>
              Start here
            </Button>
          </div>
        </div>
        <HomeStage />
      </div>
    </GridBackground>
  );
}
