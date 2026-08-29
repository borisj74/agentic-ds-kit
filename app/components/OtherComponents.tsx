"use client";

import { AppNav } from "@/ui/AppNav";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { PageHeader } from "@/ui/PageHeader";
import { RadioGroup } from "@/ui/RadioGroup";
import { Scoreboard } from "@/ui/Scoreboard";
import { Section } from "@/ui/Section";
import { Select } from "@/ui/Select";
import { Table } from "@/ui/Table";
import { Textarea } from "@/ui/Textarea";
import { PLAYGROUND_APPNAV_DEMO_GROUPS } from "@/lib/playground-nav";
import { InteractiveDemos } from "./InteractiveDemos";
import styles from "./components.module.css";
import doc from "./ComponentDoc.module.css";

export function OtherComponent({ id, title }: { id: string; title: string }) {
  return (
    <div>
      <header className={doc.hero}>
        <h1 className={doc.heroTitle}>{title}</h1>
        <p className={doc.lede}>Kit example. Florence-style docs start with Button.</p>
      </header>
      <div className={styles.anchor} id={id}>
        {id === "appnav" && (
          <div className={styles.appNavDemo}>
            <AppNav title="Agentic DS Kit" groups={PLAYGROUND_APPNAV_DEMO_GROUPS} />
          </div>
        )}
        {id === "scoreboard" && (
          <Scoreboard
            items={[
              { title: "Revenue", metric: "$12k", trend: "up", trendLabel: "+4%" },
              { title: "Users", metric: "840", trend: "neutral", trendLabel: "Flat" },
            ]}
          />
        )}
        {id === "scorecard" && (
          <Scoreboard items={[{ title: "Active users", metric: "1,240", trend: "up", trendLabel: "+3%" }]} />
        )}
        {id === "field" && (
          <div className={styles.stack}>
            <Field label="Name" htmlFor="demo-name" hint="Your display name">
              <Input id="demo-name" placeholder="Boris" />
            </Field>
            <Field label="Bio" htmlFor="demo-bio">
              <Textarea id="demo-bio" rows={3} placeholder="Short bio" />
            </Field>
            <Field label="Role" htmlFor="demo-role">
              <Select
                id="demo-role"
                options={[
                  { value: "designer", label: "Designer" },
                  { value: "developer", label: "Developer" },
                ]}
              />
            </Field>
          </div>
        )}
        {id === "input" && (
          <Field label="Email" htmlFor="demo-input-only">
            <Input id="demo-input-only" type="email" placeholder="you@example.com" />
          </Field>
        )}
        {id === "textarea" && (
          <Field label="Notes" htmlFor="demo-textarea-only">
            <Textarea id="demo-textarea-only" rows={3} />
          </Field>
        )}
        {id === "select" && (
          <Field label="Timezone" htmlFor="demo-select-only">
            <Select
              id="demo-select-only"
              options={[
                { value: "utc", label: "UTC" },
                { value: "cet", label: "CET" },
              ]}
            />
          </Field>
        )}
        {id === "radiogroup" && (
          <RadioGroup
            name="demo-rg-only"
            legend="Billing"
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "annual", label: "Annual" },
            ]}
            defaultValue="monthly"
          />
        )}
        {id === "pageheader" && <PageHeader title="Example page" subtitle="Subtitle text" eyebrow="Eyebrow" />}
        {id === "table" && (
          <Table
            caption="Sample rows"
            columns={[
              { key: "item", header: "Item" },
              { key: "value", header: "Value" },
            ]}
            rows={[
              { item: "Alpha", value: "1" },
              { item: "Beta", value: "2" },
            ]}
          />
        )}
        {id === "section" && (
          <Section title="Section" description="Grouped block with optional heading">
            <p className={styles.sectionBody}>Content inside a Section wrapper.</p>
          </Section>
        )}
        {id === "tooltip" && <InteractiveDemos mode="tooltip" />}
        {id === "tabs" && <InteractiveDemos mode="tabs" />}
      </div>
    </div>
  );
}
