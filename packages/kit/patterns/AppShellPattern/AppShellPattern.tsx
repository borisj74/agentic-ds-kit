"use client";

import {
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { AppHeader } from "../../ui/AppHeader";
import type { AppHeaderProps } from "../../ui/AppHeader";
import { Button } from "../../ui/Button";
import { Drawer } from "../../ui/Drawer";
import { SideNav } from "../../ui/SideNav";
import type { SideNavProps } from "../../ui/SideNav";
import "./AppShellPattern.css";

/** AppHeader props. The shell owns `radius` (always none). */
export type AppShellHeader = Omit<AppHeaderProps, "radius">;

/** The data SideNav takes. The shell owns `showHeader`, `radius`, and `side`. */
export type AppShellNav = Omit<SideNavProps, "showHeader" | "radius" | "side">;

export interface AppShellPatternProps {
  /**
   * AppHeader props (the shell injects the narrow-screen Menu Button), or a header you
   * built from `AppHeader.Root` and its blocks. A built header places
   * `AppShellPattern.MenuButton` itself, usually as the `AppHeader.Brand` logo.
   */
  header: AppShellHeader | ReactNode;
  /**
   * SideNav props, or a nav you built (a `SideNav`, or SideNav blocks). A built nav
   * renders in the rail when wide and inside the left Drawer when narrow; read
   * `useAppShell().navPlacement` to adapt it (e.g. always expanded in the Drawer), or pass
   * a function that gets the placement: `(placement) => <ShellNav placement={placement} />`.
   */
  nav: AppShellNav | ReactNode | ((placement: AppShellNavPlacement) => ReactNode);
  /** Drawer title on narrow screens. Default: `nav.title`, or "Navigation" for a built nav. */
  navLabel?: string;
  /** Page content: usually a `layout-canvas` or `layout-workspace`, or another pattern. */
  children: ReactNode;
  /** Extra class on the `layout-shell` root, e.g. to give it the viewport height. */
  className?: string;
}

export type AppShellNavPlacement = "rail" | "drawer";

export interface AppShellContextValue {
  /** Below --grid-breakpoint-md: no rail, the nav lives in the Drawer. */
  narrow: boolean;
  /** The narrow-screen Drawer is open. */
  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  /** Where the calling component renders: in the wide rail, in the narrow Drawer, or neither (null). */
  navPlacement: AppShellNavPlacement | null;
}

interface MenuSlot {
  ref: RefObject<HTMLSpanElement | null>;
  /** Counts mounted Menu Buttons; returns the unregister call. */
  register: () => () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);
const MenuSlotContext = createContext<MenuSlot | null>(null);

/** Shell state for custom chrome: `narrow`, `navOpen`, `openNav`, `closeNav`, `navPlacement`. Null outside AppShellPattern. */
export function useAppShell(): AppShellContextValue | null {
  return useContext(AppShellContext);
}

export interface AppShellMenuButtonProps {
  /** Rendered when wide (no Menu Button needed), e.g. `<AppHeader.Mark>A</AppHeader.Mark>`. Default nothing. */
  children?: ReactNode;
  /** Accessible name. Default "Open navigation". */
  ariaLabel?: string;
}

/**
 * The narrow-screen Menu Button (tertiary sm, lucide Menu) that opens the nav Drawer.
 * Renders `children` when wide. Place it in a built header, usually as the
 * `AppHeader.Brand` logo so it sits on the rail axis. Focus returns here when the Drawer closes.
 */
export function AppShellMenuButton({ children = null, ariaLabel = "Open navigation" }: AppShellMenuButtonProps) {
  const shell = useContext(AppShellContext);
  const slot = useContext(MenuSlotContext);

  useEffect(() => slot?.register(), [slot]);

  if (!shell?.narrow) return <>{children}</>;
  return (
    <span ref={slot?.ref} className="app-shell-pattern__menu">
      <Button variant="tertiary" size="sm" iconStart="Menu" ariaLabel={ariaLabel} onClick={shell.openNav} />
    </span>
  );
}

/*
 * Narrow = below --grid-breakpoint-md. matchMedia reads the token at runtime so
 * the shell follows it; 64rem is only the fallback. The stylesheet repeats 64rem
 * for the pre-hydration render (media queries cannot read var()).
 */
const BREAKPOINT_TOKEN = "--grid-breakpoint-md";
const BREAKPOINT_FALLBACK = "64rem";

function narrowQuery(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(BREAKPOINT_TOKEN).trim();
  return `(width < ${value || BREAKPOINT_FALLBACK})`;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(narrowQuery());
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(narrowQuery()).matches,
    () => false,
  );
}

/** A props object (preset chrome) rather than a built node. */
function isPropsObject<T extends object>(value: T | ReactNode): value is T {
  return typeof value === "object" && value !== null && !isValidElement(value) && !(Symbol.iterator in value);
}

/**
 * Product chrome at every width. Wide: AppHeader over SideNav + content
 * (layout-shell / layout-app, radius none, no gap). Narrow: no SideNav; a Menu
 * Button at the start of AppHeader opens the same nav in a left Drawer.
 * `header` and `nav` take preset props or nodes built from the kit blocks.
 */
function AppShellPatternRoot({ header, nav, navLabel, children, className = "" }: AppShellPatternProps) {
  const narrow = useNarrow();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLSpanElement>(null);
  const menuMounted = useRef(0);
  const [menuSlot] = useState<MenuSlot>(() => ({
    ref: menuRef,
    register: () => {
      menuMounted.current += 1;
      return () => {
        menuMounted.current -= 1;
      };
    },
  }));
  const wasOpen = useRef(false);
  const headerProps = isPropsObject<AppShellHeader>(header) ? header : null;
  const navProps = typeof nav !== "function" && isPropsObject<AppShellNav>(nav) ? nav : null;
  const headerNode = headerProps ? null : (header as ReactNode);
  const navNode = (placement: AppShellNavPlacement): ReactNode =>
    typeof nav === "function" ? nav(placement) : (nav as ReactNode);

  // Widening past the breakpoint closes the Drawer (adjusted during render, not in an effect).
  const [wasNarrow, setWasNarrow] = useState(narrow);
  if (wasNarrow !== narrow) {
    setWasNarrow(narrow);
    if (!narrow) setMenuOpen(false);
  }

  // Drawer restores whatever had focus before it opened; Safari does not focus a
  // clicked button, so the shell puts focus back on the Menu Button itself.
  useEffect(() => {
    if (wasOpen.current && !menuOpen) menuRef.current?.querySelector("button")?.focus();
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  // A built header must place AppShellPattern.MenuButton, or narrow screens lose the nav.
  useEffect(() => {
    if (narrow && !headerProps && menuMounted.current === 0) {
      console.warn(
        "AppShellPattern: the custom header has no AppShellPattern.MenuButton, so the nav cannot be opened on narrow screens.",
      );
    }
  }, [narrow, headerProps]);

  // A leaf pick closes the Drawer; parent disclosures (aria-expanded) do not.
  function closeOnPick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const control = target.closest("a[href], button");
    if (control && !control.hasAttribute("aria-expanded") && !control.hasAttribute("disabled")) {
      setMenuOpen(false);
    }
  }

  const shell: AppShellContextValue = {
    narrow,
    navOpen: menuOpen,
    openNav: () => setMenuOpen(true),
    closeNav: () => setMenuOpen(false),
    navPlacement: null,
  };

  return (
    <AppShellContext.Provider value={shell}>
      <MenuSlotContext.Provider value={menuSlot}>
        <div className={`layout-shell ${className}`.trim()}>
          {headerProps ? (
            <AppHeader
              {...headerProps}
              radius="none"
              logo={narrow ? <AppShellMenuButton /> : headerProps.logo}
            />
          ) : (
            headerNode
          )}
          <div className="layout-app app-shell-pattern__app">
            {narrow ? null : (
              <div className="app-shell-pattern__rail">
                <AppShellContext.Provider value={{ ...shell, navPlacement: "rail" }}>
                  {navProps ? <SideNav {...navProps} showHeader={false} radius="none" /> : navNode("rail")}
                </AppShellContext.Provider>
              </div>
            )}
            {children}
          </div>
          {narrow ? (
            <Drawer
              open={menuOpen}
              title={navLabel ?? navProps?.title ?? "Navigation"}
              side="left"
              size="sm"
              onClose={() => setMenuOpen(false)}
            >
              <div className="app-shell-pattern__drawer-nav" onClick={closeOnPick}>
                <AppShellContext.Provider value={{ ...shell, navPlacement: "drawer" }}>
                  {navProps ? (
                    <SideNav {...navProps} open showHeader={false} radius="md" onOpenChange={undefined} />
                  ) : (
                    navNode("drawer")
                  )}
                </AppShellContext.Provider>
              </div>
            </Drawer>
          ) : null}
        </div>
      </MenuSlotContext.Provider>
    </AppShellContext.Provider>
  );
}

/**
 * `AppShellPattern.MenuButton` is `AppShellMenuButton`. From a Server Component use the
 * named export: dot access on a client component does not cross the server boundary.
 */
export const AppShellPattern = Object.assign(AppShellPatternRoot, { MenuButton: AppShellMenuButton });
