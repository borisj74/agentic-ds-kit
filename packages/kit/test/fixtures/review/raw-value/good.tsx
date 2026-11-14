import { Card } from "agentic-ds-kit";

export function Good({ gap }: { gap: string }) {
  return (
    <Card>
      {/* A comment with #ffffff is not a value. */}
      <div style={{ background: "var(--bg-surface)", padding: 0, margin: "auto", width: "100%", gap }}>Tokens</div>
      <div style={{ color: "currentColor", borderColor: "transparent", boxShadow: "none" }}>Keywords</div>
      <div className="layout-content p-[var(--space-inset-md)]">Token in Tailwind</div>
    </Card>
  );
}
