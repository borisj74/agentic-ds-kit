export const PLAYGROUND_THEME_STORAGE_KEY = "playground-theme";

export type PlaygroundTheme = "light" | "dark";

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

export const PLAYGROUND_THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${PLAYGROUND_THEME_STORAGE_KEY}");if(t==="dark")document.documentElement.setAttribute("data-theme","dark");}catch(e){}})();`;
