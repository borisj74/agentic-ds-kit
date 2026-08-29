import { AppNav } from "@/ui/AppNav";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { PageHeader } from "@/ui/PageHeader";
import { RadioGroup } from "@/ui/RadioGroup";
import { Scoreboard } from "@/ui/Scoreboard";
import { Section } from "@/ui/Section";
import { Select } from "@/ui/Select";
import { Table } from "@/ui/Table";
import { Tag } from "@/ui/Tag";
import { Textarea } from "@/ui/Textarea";
import { PLAYGROUND_APPNAV_DEMO_GROUPS } from "@/lib/playground-nav";
import { InteractiveDemos } from "./InteractiveDemos";
import styles from "./components.module.css";
import playground from "../playground.module.css";

export default function ComponentsPage() {
  return (
    <div className={playground.page}>
      <div className={playground.wideShell}>
        <h1 className={playground.pageTitle}>Components</h1>
        <p className={playground.pageLead}>Live kit examples — one per contract. No screenshots.</p>

        <div className={styles.grid}>
          <div id="appnav" className={styles.anchor}>
            <Section title="AppNav" description="Grouped sidebar navigation for catalog shells">
              <div className={styles.appNavDemo}>
                <AppNav title="Kit sandbox" groups={PLAYGROUND_APPNAV_DEMO_GROUPS} />
              </div>
            </Section>
          </div>

          <div id="button" className={styles.anchor}>
            <Section title="Button">
              <div className={styles.row}>
                <Button variant="primary" size="md">
                  Primary
                </Button>
                <Button variant="secondary" size="md">
                  Secondary
                </Button>
                <Button variant="tertiary" size="sm">
                  Tertiary
                </Button>
                <Button variant="danger" size="sm">
                  Danger
                </Button>
              </div>
            </Section>
          </div>

          <div id="scoreboard" className={styles.anchor}>
            <Section title="Scoreboard">
              <Scoreboard
                items={[
                  { title: "Revenue", metric: "$12k", trend: "up", trendLabel: "+4%" },
                  { title: "Users", metric: "840", trend: "neutral", trendLabel: "Flat" },
                ]}
              />
            </Section>
          </div>

          <div id="scorecard" className={styles.anchor}>
            <Section title="Scorecard">
              <Scoreboard
                items={[{ title: "Active users", metric: "1,240", trend: "up", trendLabel: "+3%" }]}
              />
            </Section>
          </div>

          <div id="field" className={styles.anchor}>
            <Section title="Field + Input / Textarea / Select">
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
            </Section>
          </div>

          <div id="input" className={styles.anchor}>
            <Section title="Input">
              <Field label="Email" htmlFor="demo-input-only">
                <Input id="demo-input-only" type="email" placeholder="you@example.com" />
              </Field>
            </Section>
          </div>

          <div id="textarea" className={styles.anchor}>
            <Section title="Textarea">
              <Field label="Notes" htmlFor="demo-textarea-only">
                <Textarea id="demo-textarea-only" rows={3} />
              </Field>
            </Section>
          </div>

          <div id="select" className={styles.anchor}>
            <Section title="Select">
              <Field label="Timezone" htmlFor="demo-select-only">
                <Select
                  id="demo-select-only"
                  options={[
                    { value: "utc", label: "UTC" },
                    { value: "cet", label: "CET" },
                  ]}
                />
              </Field>
            </Section>
          </div>

          <div id="checkbox" className={styles.anchor}>
            <Section title="Checkbox & RadioGroup">
              <div className={styles.stack}>
                <Checkbox id="demo-check" label="Subscribe to updates" />
                <RadioGroup
                  name="demo-plan"
                  legend="Plan"
                  orientation="horizontal"
                  options={[
                    { value: "free", label: "Free" },
                    { value: "pro", label: "Pro" },
                  ]}
                  defaultValue="free"
                />
              </div>
            </Section>
          </div>

          <div id="radiogroup" className={styles.anchor}>
            <Section title="RadioGroup">
              <RadioGroup
                name="demo-rg-only"
                legend="Billing"
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "annual", label: "Annual" },
                ]}
                defaultValue="monthly"
              />
            </Section>
          </div>

          <div id="tag" className={styles.anchor}>
            <Section title="Tag">
              <div className={styles.row}>
                <Tag variant="neutral">Draft</Tag>
                <Tag variant="success">Active</Tag>
                <Tag variant="warning">Pending</Tag>
                <Tag variant="danger">Blocked</Tag>
              </div>
            </Section>
          </div>

          <div id="pageheader" className={styles.anchor}>
            <Section title="PageHeader">
              <PageHeader title="Example page" subtitle="Subtitle text" eyebrow="Eyebrow" />
            </Section>
          </div>

          <div id="table" className={styles.anchor}>
            <Section title="Table">
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
            </Section>
          </div>

          <div id="section" className={styles.anchor}>
            <Section title="Section" description="Grouped block with optional heading">
              <p className={styles.sectionBody}>Content inside a Section wrapper.</p>
            </Section>
          </div>

          <div id="tooltip" className={styles.anchor}>
            <Section title="Tooltip">
              <InteractiveDemos mode="tooltip" />
            </Section>
          </div>

          <div id="tabs" className={styles.anchor}>
            <Section title="Tabs">
              <InteractiveDemos mode="tabs" />
            </Section>
          </div>

          <div id="modal" className={styles.anchor}>
            <Section title="Modal">
              <InteractiveDemos mode="modal" />
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
