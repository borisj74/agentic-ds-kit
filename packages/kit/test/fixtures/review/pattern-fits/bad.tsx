import { DataTable, LineChart, PageHeader, Scoreboard, Section } from "agentic-ds-kit";

export function Bad() {
  return (
    <main>
      <PageHeader title="Overview" />
      <Section title="Metrics">
        <Scoreboard items={[]} />
      </Section>
      <LineChart data={[]} />
      <DataTable columns={[]} rows={[]} />
    </main>
  );
}
