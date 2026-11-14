import { Button, Card, Field, Input, LineChart, PageHeader, Scoreboard, Section } from "agentic-ds-kit";
import { DashboardPattern } from "@/components/patterns/dashboard";

export function Good() {
  return (
    <main>
      <DashboardPattern />
      <PageHeader title="Extra" />
      <Section title="More">
        <Scoreboard items={[]} />
        <LineChart data={[]} />
      </Section>
      <Card>
        <Field label="Email">
          <Input />
        </Field>
        <Button type="submit">Sign in</Button>
      </Card>
    </main>
  );
}
