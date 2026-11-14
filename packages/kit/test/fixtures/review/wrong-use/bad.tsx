import { Button } from "agentic-ds-kit";

export function Bad() {
  return (
    <div>
      <Button href="/billing">Go to billing</Button>
      <Button>Save</Button>
      <Button appearance="solid" mode="primary">Publish</Button>
      <Button appearance="ghost" mode="neutral" iconStart="Trash2" />
    </div>
  );
}
