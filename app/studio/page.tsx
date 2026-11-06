"use client";

import {
  Badge,
  Button,
  Card,
  Input,
  PageHeader,
  Scoreboard,
  Section,
  Timeline,
} from "agentic-ds-kit";
import { StudioControls } from "../_components/StudioControls";
import playground from "../playground.module.css";
import styles from "./studio.module.css";

export default function StudioPage() {
  return (
    <div className={playground.page}>
      <div className={playground.wideShell}>
        <PageHeader
          title="Studio"
          subtitle="Live font, weight, primary, radius, shadow, and theme. Split nav stays the agent API."
        />
        <StudioControls />
        <Section title="Components" size="sm">
          <div className={styles.preview}>
            <div className={styles.actions}>
              <Button appearance="solid" mode="primary" size="md">
                Save theme
              </Button>
              <Button appearance="outline" mode="neutral" size="md">
                Cancel
              </Button>
              <Badge appearance="soft" tone="success">
                Live
              </Badge>
            </div>
            <Input id="studio-preview-input" placeholder="Search the kit…" />
            <Scoreboard
              aria-label="Studio metrics"
              items={[
                { label: "Activation", value: "64%", delta: "+4%", trend: "up", hint: "this week" },
                { label: "Seats", value: "12", delta: "0", trend: "flat", hint: "of 20" },
                { label: "NPS", value: "72", delta: "+3", trend: "up", hint: "vs last survey" },
              ]}
            />
            <Card title="Raised surface" description="Cards use --bg-surface, --radius-surface-md, and --shadow-sm.">
              <Input id="studio-card-field" placeholder="Resting field" />
            </Card>
            <Timeline
              label="Delivery"
              items={[
                { status: "now", phase: "Now", title: "Token studio", body: "Live controls write semantic CSS variables." },
                { status: "next", phase: "Next", title: "Ship the kit", body: "Agents compose from contracts." },
                { status: "later", phase: "Later", title: "Product screens", body: "Copy a pattern and replace the data." },
              ]}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
