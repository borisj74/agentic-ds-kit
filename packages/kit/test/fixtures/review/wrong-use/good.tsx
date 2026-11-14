import { Button, Empty, Link } from "agentic-ds-kit";

export function Good({ busy, kind }: { busy: boolean; kind: "solid" | "outline" }) {
  return (
    <div>
      <Link href="/billing">Go to billing</Link>
      <Button>Save</Button>
      <Button appearance="outline" mode="neutral">Cancel</Button>
      <Button appearance={kind}>Maybe</Button>
      {busy ? <Button>Retry</Button> : null}
      <Empty title="Nothing yet" actions={<Button>Create</Button>} />
      <Button appearance="ghost" mode="neutral" iconStart="Trash2" ariaLabel="Delete" />
    </div>
  );
}
