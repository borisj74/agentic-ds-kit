"use client";

import { useSyncExternalStore } from "react";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "../../ui/AppHeader";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { PageHeader } from "../../ui/PageHeader";
import { RunDetail } from "../../ui/RunDetail";
import { RUN_PAGE, RUNS, type RunDetailState } from "./run-detail-data";
import "./RunDetailPattern.css";

export interface RunDetailPatternProps {
  /** Which demo run to show. Default "failed". */
  state?: RunDetailState;
  /** The Runs list: the breadcrumb, and the back button below 640. Default "#". */
  runsHref?: string;
  onAsk?: () => void;
  onRetry?: (stepId: string) => void;
  onPause?: () => void;
  onStop?: () => void;
  /** Fill the viewport height (layout-shell--viewport). Default true; turn it off inside a framed preview. */
  viewport?: boolean;
}

/*
 * Narrow = below --grid-breakpoint-sm (640), read at runtime. Below it a back bar (Runs, Ask) takes the
 * AppHeader's place and the page header drops the breadcrumbs. 40rem is the fallback.
 */
function narrowQuery(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--grid-breakpoint-sm").trim();
  return `(width < ${value || "40rem"})`;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(narrowQuery());
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(narrowQuery()).matches, () => false);
}

const noop = () => {};

/**
 * Run detail page: AppHeader, a PageHeader with a Runs breadcrumb and Ask, then the kit RunDetail
 * block with every started step's call (calls="all") and the run trace. One agent, so no AgentTree.
 */
export function RunDetailPattern({
  state = "failed",
  runsHref = "#",
  onAsk = noop,
  onRetry = noop,
  onPause = noop,
  onStop = noop,
  viewport = true,
}: RunDetailPatternProps) {
  const narrow = useNarrow();
  const data = RUNS[state];
  const run = narrow ? { ...data.run, headline: data.headlineShort } : data.run;

  const ask = (
    <Button size="sm" appearance="outline" mode="neutral" iconStart="MessageCircle" onClick={onAsk}>
      Ask
    </Button>
  );

  return (
    <div className={["layout-shell run-detail-pattern", viewport ? "layout-shell--viewport" : ""].filter(Boolean).join(" ")}>
      {narrow ? (
        <nav className="layout-header run-detail-pattern__topbar" aria-label="Back">
          <Button size="lg" appearance="ghost" mode="neutral" iconStart={ArrowLeft}
            onClick={() => {
              window.location.href = runsHref;
            }}
          >
            {RUN_PAGE.runs}
          </Button>
          {ask}
        </nav>
      ) : (
        <AppHeader
          title={RUN_PAGE.product}
          radius="none"
          search={false}
          actions={<Avatar name={RUN_PAGE.account.name} initials={RUN_PAGE.account.initials} size="sm" />}
        />
      )}
      <main className="layout-content run-detail-pattern__content">
        <PageHeader
          title={RUN_PAGE.title}
          subtitle={narrow ? RUN_PAGE.metaShort : RUN_PAGE.meta}
          breadcrumbs={narrow ? undefined : [{ label: RUN_PAGE.runs, href: runsHref }, { label: RUN_PAGE.id }]}
          actions={narrow ? undefined : ask}
        />
        <RunDetail
          key={state}
          title={`Run ${RUN_PAGE.id}`}
          run={run}
          steps={data.steps}
          calls="all"
          trace={data.trace}
          defaultSelectedStepId={data.selected}
          onRetry={onRetry}
          onPause={onPause}
          onStop={onStop}
        />
        {data.callsNote ? (
          <div className="layout-split--secondary run-detail-pattern__note-row">
            <span aria-hidden="true" />
            <p className="run-detail-pattern__note">{data.callsNote}</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
