"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "agentic-ds-kit";
import { LayoutsDemo } from "../_components/LayoutsDemo";
import { PatternPreview, ScaledFrame, frameUrl } from "../_components/PatternPreview";
import { ScreenCard } from "../_components/ScreenCard";
import { usePatternTheme } from "../_components/ThemeScope";
import { CodeBlock } from "../components/CodeBlock";
import { PATTERN_BLURBS, PATTERN_VIEWS, isScreenSlug, type ScreenSlug } from "@/lib/pattern-screens";
import { patternPrompt } from "@/lib/pattern-prompt";
import { PATTERN_ITEMS, type PatternSlug } from "@/lib/playground-nav";
import appShell from "../../packages/kit/contracts/patterns/app-shell.json";
import billingSchedule from "../../packages/kit/contracts/patterns/billing-schedule.json";
import dashboard from "../../packages/kit/contracts/patterns/dashboard.json";
import emptyFirstRun from "../../packages/kit/contracts/patterns/empty-first-run.json";
import integrationSettings from "../../packages/kit/contracts/patterns/integration-settings.json";
import listDetail from "../../packages/kit/contracts/patterns/list-detail.json";
import onboarding from "../../packages/kit/contracts/patterns/onboarding.json";
import settings from "../../packages/kit/contracts/patterns/settings.json";
import settingsForm from "../../packages/kit/contracts/patterns/settings-form.json";
import signIn from "../../packages/kit/contracts/patterns/sign-in.json";
import styles from "./patterns.module.css";
import playground from "../playground.module.css";

interface PatternContract {
  id: string;
  add: string;
  import?: string;
  intent?: string;
  copyNote?: string;
  requires?: string[];
  contains?: string[];
  must?: string[];
  defaults?: string[];
  snippet?: string;
}

/** Docs slug → pattern contract. Slugs are the pattern ids. */
const CONTRACTS: Record<Exclude<PatternSlug, "layouts">, PatternContract> = {
  dashboard,
  "settings-form": settingsForm,
  "list-detail": listDetail,
  "empty-first-run": emptyFirstRun,
  "sign-in": signIn,
  "app-shell": appShell,
  "billing-schedule": billingSchedule,
  "integration-settings": integrationSettings,
  settings,
  onboarding,
};

function List({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function PatternsView({ slug, view }: { slug: PatternSlug; view?: string }) {
  const title = PATTERN_ITEMS.find((item) => item.slug === slug)?.label ?? "Patterns";
  const crumbs = [{ label: "Patterns", href: "/patterns" }, { label: title }];

  if (!isScreenSlug(slug)) {
    // Layouts is not a pattern: kit components composed in place, no add command.
    return (
      <div className={playground.page}>
        <div className={styles.article}>
          <Breadcrumb items={crumbs} />
          <h1 className={playground.pageTitle}>{title}</h1>
          <p className={playground.pageLead}>
            Top bar and side nav composed from kit components. No pattern needed: these need only the package.
          </p>
          <CodeBlock code={`import { AppHeader, Button, Drawer, PageHeader, SideNav } from "agentic-ds-kit";`} />
          <LayoutsDemo titleClassName={styles.sectionTitle} />
        </div>
      </div>
    );
  }

  return <ScreenPatternView slug={slug} title={title} crumbs={crumbs} initialView={view} />;
}

/**
 * A screen pattern's page: header, the preview of the chosen screen, its screens (each state as
 * a thumbnail you pick), then install, usage and the contract's lines.
 */
function ScreenPatternView({
  slug,
  title,
  crumbs,
  initialView,
}: {
  slug: ScreenSlug;
  title: string;
  crumbs: { label: string; href?: string }[];
  initialView?: string;
}) {
  const views = PATTERN_VIEWS[slug];
  const [view, setView] = useState(views.some((item) => item.id === initialView) ? initialView! : views[0].id);
  const previewRef = useRef<HTMLDivElement>(null);
  const theme = usePatternTheme();

  function pick(id: string) {
    setView(id);
    // Keep the link shareable (?view=) without a navigation, and bring the preview into view.
    const url = id === views[0].id ? window.location.pathname : `${window.location.pathname}?view=${encodeURIComponent(id)}`;
    window.history.replaceState(null, "", url);
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const contract = CONTRACTS[slug];
  const usage = [contract.import, "", contract.snippet].filter((line) => line !== undefined).join("\n");

  return (
    <div className={playground.page}>
      <article className={styles.article}>
        <Breadcrumb items={crumbs} />
        <h1 className={playground.pageTitle}>{title}</h1>
        <p className={playground.pageLead}>{PATTERN_BLURBS[slug]}</p>

        <div ref={previewRef} className={styles.previewAnchor}>
          <PatternPreview
            slug={slug}
            title={title}
            addCommand={contract.add}
            prompt={patternPrompt(title, contract, "default")}
            cursorPrompt={patternPrompt(title, contract, "cursor")}
            usage={usage}
            contract={JSON.stringify(contract, null, 2)}
            view={view}
          />
        </div>

        {views.length > 1 ? (
          <section className={styles.section} aria-labelledby={`${slug}-screens`}>
            <h2 id={`${slug}-screens`} className={styles.sectionTitle}>
              Screens <span className={styles.countBadge}>{views.length}</span>
            </h2>
            <div className={playground.screenList}>
              <div className={`${playground.screenGrid} ${playground.screenGridSmall}`}>
                {views.map((item) => (
                  <ScreenCard
                    key={item.id}
                    headingLevel={3}
                    title={item.label}
                    selected={item.id === view}
                    onSelect={() => pick(item.id)}
                    thumb={
                      <ScaledFrame
                        src={frameUrl(slug, item.id, theme?.mode ?? "light")}
                        title={`${title}: ${item.label}`}
                        interactive={false}
                      />
                    }
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby={`${slug}-install`}>
          <h2 id={`${slug}-install`} className={styles.sectionTitle}>
            Install
          </h2>
          <p className={playground.body}>{contract.copyNote?.replace(/`/g, "")}</p>
          <CodeBlock code={contract.add} label="Install command" />
          {contract.requires?.length ? (
            <p className={playground.body}>
              Also copies{" "}
              {contract.requires.map((id, index) => (
                <span key={id}>
                  {index ? ", " : null}
                  <code>{id}</code>
                </span>
              ))}{" "}
              beside it, which this pattern builds on (kept if you already have it).
            </p>
          ) : null}
        </section>

        <section className={styles.section} aria-labelledby={`${slug}-usage`}>
          <h2 id={`${slug}-usage`} className={styles.sectionTitle}>
            Usage
          </h2>
          <CodeBlock code={usage} label="Usage code" />
        </section>

        <section className={styles.section} aria-labelledby={`${slug}-must`}>
          <h2 id={`${slug}-must`} className={styles.sectionTitle}>
            What a copy keeps
          </h2>
          <p className={playground.body}>The contract&rsquo;s must lines: the kit look and accessibility. Ask before breaking one.</p>
          <List items={contract.must} />
        </section>

        <section className={styles.section} aria-labelledby={`${slug}-defaults`}>
          <h2 id={`${slug}-defaults`} className={styles.sectionTitle}>
            Defaults you can change
          </h2>
          <List items={contract.defaults} />
        </section>

        {contract.contains?.length ? (
          <section className={styles.section} aria-labelledby={`${slug}-built`}>
            <h2 id={`${slug}-built`} className={styles.sectionTitle}>
              Built from
            </h2>
            <ul className={styles.chips}>
              {contract.contains.map((id) => (
                <li key={id}>
                  <Link href={`/components/${id}`} className={styles.chip}>
                    {id}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </div>
  );
}
