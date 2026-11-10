import {
  DEFAULT_THEME,
  clearStoredTheme,
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
/** True when the snapshot came from the URL, storage or the panel; false for the plain default. */
let themeSaved = false;
/** The last query string read into the snapshot. A repeat read returns the same object. */
let lastSearch: string | null = null;
const themeListeners = new Set<() => void>();

function currentSearch(): string {
  return window.location.search.replace(/^\?/, "");
}

function loadThemeSnapshot(): ThemeState {
  const loc = currentSearch();
  lastSearch = loc;
  const found = themeFromSearch(new URLSearchParams(loc), "light") ?? readStoredTheme();
  themeSaved = found !== null;
  return found ?? DEFAULT_THEME;
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
  if (fromUrl && loc !== themeToSearch(themeSnapshot)) {
    themeSnapshot = fromUrl;
    themeSaved = true;
  }
  return themeSnapshot;
}

/** Previews follow the saved theme on every page. With none saved, they stay on the kit defaults. */
export function readPatternTheme(): ThemeState | null {
  if (typeof window === "undefined") return null;
  if (!themeLoaded) {
    themeLoaded = true;
    themeSnapshot = loadThemeSnapshot();
  }
  return themeSaved ? themeSnapshot : null;
}

export function publishTheme(next: ThemeState) {
  themeSnapshot = next;
  themeLoaded = true;
  themeSaved = true;
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

/** Forget the saved theme: previews go back to the kit default and follow the site's mode. */
export function resetTheme() {
  themeSnapshot = DEFAULT_THEME;
  themeLoaded = true;
  themeSaved = false;
  clearStoredTheme();
  if (window.location.pathname === URL_THEME_PATH && window.location.search) {
    lastSearch = "";
    window.history.replaceState(null, "", window.location.pathname);
  }
  document.documentElement.removeAttribute("data-preview-theme");
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
