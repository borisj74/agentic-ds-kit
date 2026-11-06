export type HourCycle = "12" | "24";

export function parseTime(value?: string): { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  if (!match) return { hour: 9, minute: 0 };
  return {
    hour: Math.min(23, Math.max(0, Number(match[1]))),
    minute: Math.min(59, Math.max(0, Number(match[2]))),
  };
}

export function toTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatTime(value: string | undefined, cycle: HourCycle): string {
  const { hour, minute } = parseTime(value);
  const mm = String(minute).padStart(2, "0");
  if (cycle === "24") return `${String(hour).padStart(2, "0")}:${mm}`;
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${mm} ${period}`;
}

export function bump(value: number, delta: number, span: number): number {
  return (value + delta + span) % span;
}

export function togglePeriod(hour: number): number {
  return (hour + 12) % 24;
}
