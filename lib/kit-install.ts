import kitPackage from "../packages/kit/package.json";

export const KIT_LATEST = "latest";
export const KIT_CURRENT_VERSION: string = kitPackage.version;

const SKIP_VERSIONS = new Set(["0.1.0", "0.2.0"]);

export interface KitVersionOption {
  value: string;
  label: string;
}

export function kitInstallSpec(version: string): string {
  if (version === KIT_LATEST) return "agentic-ds-kit@latest";
  return `agentic-ds-kit@${version}`;
}

export function kitInstallCommand(version: string): string {
  return `npm install ${kitInstallSpec(version)}`;
}

export function newAppInstallCommand(version: string): string {
  return `mkdir my-app
cd my-app
npx create-next-app@latest . --yes
npm install ${kitInstallSpec(version)}`;
}

export function kitVersionOptions(published: string[] = []): KitVersionOption[] {
  const unique = new Set<string>();
  const versions = [KIT_CURRENT_VERSION, ...published]
    .filter((version) => {
      if (SKIP_VERSIONS.has(version) || unique.has(version)) return false;
      unique.add(version);
      return true;
    })
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }));

  return [
    { value: KIT_LATEST, label: "Latest (@latest)" },
    ...versions.map((value) => ({ value, label: value })),
  ];
}
