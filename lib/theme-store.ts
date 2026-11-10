import {
  DEFAULT_THEME,
  readStoredTheme,
  themeFromSearch,
  themeToSearch,
  writeStoredTheme,
  type ThemeState,
} from "./theme-playground";

/** Only the Theme page mirrors the theme into its URL, so a link to it can carry one. */
const URL_THEME_PATH = "/theme";

let themeSnapshot = DEFAULT_THEME;
let themeLoaded = false;
/** The last query string read into the snapshot. A repeat read returns the same object. */
let lastSearch: string | null = null;
const themeListeners = new Set<() => void>();

function currentSearch(): string {
  return window.location.search.replace(/^\?/, "");
}

function loadThemeSnapshot(): ThemeState {
  const loc = currentSearch();
  lastSearch = loc;
  return themeFromSearch(new URLSearchParams(loc), "light") ?? readStoredTheme() ?? DEFAULT_THEME;
}

/**
 * The theme for the current page. useSyncExternalStore calls this on every render, so it must
 * return the same object until something changes. A query string is parsed once per distinct
 * value: a partial query (`?preset=nistha&mode=light`) no longer builds a new state each call.
 */
export function ensureThemeSnapshot(): ThemeState {
  if (typeof window === "undefined") return themeSnapshot;
  const loc = currentSearch();
  if (!themeLoaded) {
    themeLoaded = true;
    themeSnapshot = loadThemeSnapshot();
    return themeSnapshot;
  }
  if (loc === lastSearch) return themeSnapshot;
  lastSearch = loc;
  const fromUrl = themeFromSearch(new URLSearchParams(loc), "light");
  if (fromUrl && loc !== themeToSearch(themeSnapshot)) themeSnapshot = fromUrl;
  return themeSnapshot;
}

/** Previews follow the saved theme on every page. With none saved, they stay on the kit defaults. */
export function readPatternTheme(): ThemeState | null {
  if (typeof window === "undefined") return null;
  if (themeLoaded) return themeSnapshot;
  const stored = readStoredTheme();
  if (!stored) return null;
  themeSnapshot = stored;
  themeLoaded = true;
  lastSearch = currentSearch();
  return themeSnapshot;
}

export function publishTheme(next: ThemeState) {
  themeSnapshot = next;
  themeLoaded = true;
  writeStoredTheme(next);
  if (window.location.pathname === URL_THEME_PATH) {
    const search = themeToSearch(next);
    lastSearch = search;
    const nextUrl = `${window.location.pathname}?${search}`;
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }
  themeListeners.forEach((listener) => listener());
}

/** Back to the kit default (Nistha, light). */
export function resetTheme() {
  publishTheme(DEFAULT_THEME);
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
