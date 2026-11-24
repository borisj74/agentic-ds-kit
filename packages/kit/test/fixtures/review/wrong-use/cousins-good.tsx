import { Button, ButtonGroup, IconButton, SplitButton } from "agentic-ds-kit";

export function Good() {
  return (
    <div>
      <Button appearance="outline" mode="neutral">Cancel</Button>
      <SplitButton groups={[{ items: [{ id: "draft", label: "Save as draft" }] }]}>Save invoice</SplitButton>
      <ButtonGroup ariaLabel="Invoice actions">
        <IconButton appearance="outline" mode="neutral" icon="Download" ariaLabel="Download" />
        <IconButton appearance="outline" mode="neutral" icon="Ellipsis" ariaLabel="More" />
      </ButtonGroup>
    </div>
  );
}
