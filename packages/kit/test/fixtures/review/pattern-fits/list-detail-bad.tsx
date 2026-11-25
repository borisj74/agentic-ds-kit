import { Badge, Button, Card, Empty, Input, ListView, PageHeader, Section, SegmentedControl, Table } from "agentic-ds-kit";

export function Invoices() {
  return (
    <main>
      <PageHeader title="Invoices" />
      <Input id="search" ariaLabel="Search invoices" />
      <SegmentedControl ariaLabel="Show invoices" items={[]} />
      <ListView label="Invoices" items={[]} selection="single" />
      <Section title="INV-1842">
        <Badge>Overdue</Badge>
        <Button>Retry payment</Button>
        <Card title="Line items">
          <Table columns={[]} rows={[]} />
        </Card>
      </Section>
      <Empty title="No invoice open" />
    </main>
  );
}
