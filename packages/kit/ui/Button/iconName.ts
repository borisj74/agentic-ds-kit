/** `LayoutDashboard`, `layout-dashboard` and `layoutdashboard` all map to one key. */
export function normalizeIconName(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "").toLowerCase();
}
