import {
  BarList,
  Badge,
  Button,
  Card,
  Chat,
  ComboChart,
  Heatmap,
  InsightCard,
  LineChart,
  ListView,
  PageHeader,
  Scoreboard,
  SegmentedControl,
  Select,
  Switch,
  Table,
  Tabs,
} from "agentic-ds-kit";

export function Bad() {
  return (
    <main>
      <PageHeader title="Overview" actions={<Button>Export</Button>} />
      <Tabs items={[{ id: "overview", label: "Overview" }]} />
      <Select id="period" options={[]} />
      <SegmentedControl ariaLabel="Granularity" items={[]} />
      <Switch label="Compare" />
      <InsightCard title="In short" />
      <Scoreboard items={[]} />
      <LineChart data={[]} />
      <ComboChart data={[]} bars={[]} line={{ key: "net", label: "Net" }} />
      <Heatmap rows={[]} columns={[]} data={[]} />
      <Card title="Top">
        <BarList data={[]} />
      </Card>
      <Table columns={[]} rows={[]} />
      <Badge>New</Badge>
      <ListView label="Changes" items={[]} />
      <Chat />
    </main>
  );
}
