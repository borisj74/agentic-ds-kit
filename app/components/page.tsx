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

          <Section title="Scoreboard">
            <Scoreboard
              items={[
                { title: "Revenue", metric: "$12k", trend: "up", trendLabel: "+4%" },
                { title: "Users", metric: "840", trend: "neutral", trendLabel: "Flat" },
              ]}
            />
          </Section>

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

          <Section title="Tag">
            <div className={styles.row}>
              <Tag variant="neutral">Draft</Tag>
              <Tag variant="success">Active</Tag>
              <Tag variant="warning">Pending</Tag>
              <Tag variant="danger">Blocked</Tag>
            </div>
          </Section>

          <Section title="PageHeader">
            <PageHeader title="Example page" subtitle="Subtitle text" eyebrow="Eyebrow" />
          </Section>

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

          <Section title="Tooltip, Tabs & Modal">
            <div className={styles.stack}>
              <InteractiveDemos />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
