export const PLAYGROUND_THEME_STORAGE_KEY = "playground-theme";
export const PLAYGROUND_COLOR_STORAGE_KEY = "playground-color-theme";

export type PlaygroundTheme = "light" | "dark";
export type PlaygroundColorTheme = "blue" | "violet" | "teal";

export const PLAYGROUND_COLOR_THEMES: { value: PlaygroundColorTheme; label: string }[] = [
  { value: "blue", label: "Blue" },
  { value: "violet", label: "Violet" },
  { value: "teal", label: "Teal" },
];

function isColorTheme(value: string | null): value is PlaygroundColorTheme {
  return value === "blue" || value === "violet" || value === "teal";
}

export function readPlaygroundTheme(): PlaygroundTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function applyPlaygroundTheme(theme: PlaygroundTheme): void {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  try {
    localStorage.setItem(PLAYGROUND_THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function readPlaygroundColorTheme(): PlaygroundColorTheme {
  if (typeof document === "undefined") return "blue";
  const color = document.documentElement.getAttribute("data-color");
  return isColorTheme(color) ? color : "blue";
}

export function applyPlaygroundColorTheme(color: PlaygroundColorTheme): void {
  if (color === "blue") {
    document.documentElement.removeAttribute("data-color");
  } else {
    document.documentElement.setAttribute("data-color", color);
  }
  try {
    localStorage.setItem(PLAYGROUND_COLOR_STORAGE_KEY, color);
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export const PLAYGROUND_THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${PLAYGROUND_THEME_STORAGE_KEY}");if(t==="dark")document.documentElement.setAttribute("data-theme","dark");var c=localStorage.getItem("${PLAYGROUND_COLOR_STORAGE_KEY}");if(c==="violet"||c==="teal")document.documentElement.setAttribute("data-color",c);}catch(e){}})();`;
