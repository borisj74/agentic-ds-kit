import { Button, IconButton, SplitButton } from "agentic-ds-kit";

export function Bad() {
  return (
    <div>
      <Button>Save</Button>
      <SplitButton groups={[{ items: [{ id: "draft", label: "Save as draft" }] }]}>Publish</SplitButton>
      <IconButton icon="Plus" ariaLabel="Add invoice" />
      <IconButton appearance="outline" mode="neutral" icon="Download" />
    </div>
  );
}
