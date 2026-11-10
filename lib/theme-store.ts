import {
  DEFAULT_THEME,
  readStoredTheme,
  themeFromSearch,
  themeToSearch,
  writeStoredTheme,
  type ThemeState,
} from "./theme-playground";

let themeSnapshot = DEFAULT_THEME;
let themeLoaded = false;
const themeListeners = new Set<() => void>();

function loadThemeSnapshot(): ThemeState {
  const loc = window.location.search.replace(/^\?/, "");
  return themeFromSearch(new URLSearchParams(loc), "light") ?? readStoredTheme() ?? DEFAULT_THEME;
}

export function ensureThemeSnapshot(): ThemeState {
  if (typeof window === "undefined") return themeSnapshot;
  const loc = window.location.search.replace(/^\?/, "");
  const fromUrl = themeFromSearch(new URLSearchParams(loc), "light");
  if (!themeLoaded) {
    themeLoaded = true;
    themeSnapshot = fromUrl ?? readStoredTheme() ?? DEFAULT_THEME;
    return themeSnapshot;
  }
  if (fromUrl && loc !== themeToSearch(themeSnapshot)) themeSnapshot = fromUrl;
  return themeSnapshot;
}

/** Pattern previews follow a saved theme. With none saved, they stay on the kit defaults. */
export function readPatternTheme(): ThemeState | null {
  if (typeof window === "undefined") return null;
  if (themeLoaded) return themeSnapshot;
  return readStoredTheme();
}

export function publishTheme(next: ThemeState) {
  themeSnapshot = next;
  themeLoaded = true;
  writeStoredTheme(next);
  const nextUrl = `${window.location.pathname}?${themeToSearch(next)}`;
  if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
    window.history.replaceState(null, "", nextUrl);
  }
  themeListeners.forEach((listener) => listener());
}

export function subscribeTheme(onChange: () => void) {
  themeListeners.add(onChange);
  const onPop = () => {
    themeSnapshot = loadThemeSnapshot();
    themeLoaded = true;
    onChange();
  };
  window.addEventListener("popstate", onPop);
  return () => {
    themeListeners.delete(onChange);
    window.removeEventListener("popstate", onPop);
  };
}
