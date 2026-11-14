import { Card } from "agentic-ds-kit";

export function Bad() {
  return (
    <Card>
      <div style={{ background: "#ffffff", padding: "12px", borderRadius: 6 }}>Hardcoded</div>
      <div style={{ color: "var(--color-blue-500)" }}>Ramp</div>
      <div className="p-[12px] bg-[#f3f4f6]">Tailwind</div>
    </Card>
  );
}
