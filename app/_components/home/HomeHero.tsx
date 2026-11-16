"use client";

import { useRouter } from "next/navigation";
import { Button, Calendar, Card, Checkbox, GridBackground, InputOTP } from "agentic-ds-kit";
import { HomeStage } from "./HomeStage";
import { useDemoLoop } from "./useDemoLoop";
import styles from "./Home.module.css";

const CODE = "482915";

/** Three weeks of a small schedule; the calendar card steps through them. */
const WEEKS = ["2026-11-13", "2026-11-20", "2026-11-27"];
const SCHEDULE = [
  { id: "review", title: "Design review", start: "2026-11-12T10:00", end: "2026-11-12T11:00" },
  { id: "ship", title: "Ship 0.28", start: "2026-11-13", allDay: true },
  { id: "sprint", title: "Review sprint wrap-up", start: "2026-11-13T14:00", end: "2026-11-13T15:00" },
  { id: "plan", title: "Q1 planning", start: "2026-11-17T09:30", end: "2026-11-17T11:00" },
  { id: "launch", title: "Launch checklist", start: "2026-11-19T15:00", end: "2026-11-19T16:00" },
  { id: "retro", title: "Retro", start: "2026-11-24T16:00", end: "2026-11-24T17:00" },
  { id: "freeze", title: "Code freeze", start: "2026-11-26", allDay: true },
];

/** Paper's left card: the kit Calendar in list view, stepping a week every few seconds. */
function CalendarCard() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(3200);
  return (
    // inert: a self-playing demo. Clicks would open the event drawer, which the landing page avoids.
    <div ref={ref} inert>
      <Calendar label="Example calendar" view="list" date={WEEKS[tick % WEEKS.length]} events={SCHEDULE} readOnly headingLevel={3} />
    </div>
  );
}

/** Paper's right card: the verify step plays itself. Digits type in, Verify lights up, then Verified. */
function VerifyCard() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(650);
  const phase = tick % 12;
  const typed = Math.min(phase, CODE.length);
  const verified = phase >= CODE.length + 2;

  return (
    <div ref={ref} inert>
      <Card title="Verify it's you" description="Enter the 6-digit code we sent to +351 ••• ••• 821">
        <InputOTP id="home-hero-otp" ariaLabel="Verification code, example" value={tick === 0 ? CODE.slice(0, 3) : CODE.slice(0, typed)} />
        <Checkbox id="home-hero-trust" label="Trust this device for 30 days" defaultChecked />
        <Button
          block
          appearance="soft"
          mode={verified ? "neutral" : "primary"}
          iconStart={verified ? "Check" : undefined}
          disabled={!verified && typed < CODE.length}
        >
          {verified ? "Verified" : "Verify"}
        </Button>
      </Card>
    </div>
  );
}

/**
 * Hero (Paper Home J): the kit at a glance, the headline, two ways in, then the live agent
 * stage. A calendar and a verify card sit half off the edges on wide screens, as in Paper; both
 * play short demo loops by themselves and open nothing on click. The grid runs under the whole band and fades out from the middle. The kit Button has no
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
          <CalendarCard />
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
