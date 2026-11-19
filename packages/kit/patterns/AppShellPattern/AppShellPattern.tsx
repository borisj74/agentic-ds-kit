"use client";

import {
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
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
import { DropdownMenu } from "../../ui/DropdownMenu";
import type { DropdownMenuGroup } from "../../ui/DropdownMenu";
import { SideNav, SideNavAccount, SideNavItem, SideNavSection, useSideNav } from "../../ui/SideNav";
import type { SideNavGroup, SideNavItemData, SideNavProps } from "../../ui/SideNav";
import { Tabs } from "../../ui/Tabs";
import type { TabItem } from "../../ui/Tabs";
import "./AppShellPattern.css";

/** AppHeader props. The shell owns `radius` (always none). */
export type AppShellHeader = Omit<AppHeaderProps, "radius">;

/** The data SideNav takes. The shell owns `showHeader`, `radius`, and `side`. */
export type AppShellNav = Omit<SideNavProps, "showHeader" | "radius" | "side">;

/** flat: nav on a soft neutral fill, page edge to edge, hairline dividers. inset: nav on the page background, content in a raised card. */
export type AppShellLayout = "flat" | "inset";

/** A "Projects" group added after the nav groups (props nav only). */
export interface AppShellProjects {
  /** Group caption. Default "Projects". */
  label?: string;
  /** Short list of project rows (SideNavItemData). Keep it to a handful; link to a full list for more. */
  items: SideNavItemData[];
  /** Label of the last row, which starts a new project. Default "New project". */
  newLabel?: string;
  /** Runs when the new project row is picked. Without it the row is not shown. */
  onNew?: () => void;
}

/** The signed-in person, last in the nav footer, with a menu of account actions. */
export interface AppShellAccount {
  name: string;
  /** Second line, usually the email. */
  email?: string;
  src?: string;
  initials?: string;
  /** DropdownMenu groups, e.g. Settings, a Theme submenu, Sign out. */
  menu: DropdownMenuGroup[];
  /** (id) => void for a picked menu item. */
  onSelect?: (id: string) => void;
  /** Accessible name of the menu trigger. Default "Account menu". */
  menuLabel?: string;
}

/** Optional right work panel with tabs. Fixed width (--layout-rail). Off by default. */
export interface AppShellWorkPanel {
  /** Panel name: the aside's label, the Drawer title on narrow screens, and the toggle's name. */
  title: string;
  /** Tabs items (at least two), e.g. Details and Activity. */
  tabs: TabItem[];
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled start state. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Controlled active tab id. */
  tab?: string;
  /** Uncontrolled start tab id. Default the first tab. */
  defaultTab?: string;
  onTabChange?: (id: string) => void;
}

export interface AppShellPatternProps {
  /**
   * AppHeader props (the shell injects the Menu Button when narrow and the rail toggle when
   * wide, in the brand cell), or a header you built from `AppHeader.Root` and its compose
   * parts. A built header places `AppShellPattern.MenuButton` and `AppShellPattern.RailToggle`.
   * Optional: with no header there is no top bar when wide (SideNav shows its own brand
   * header and toggle) and `narrowHeader` is the top bar below the breakpoint.
   */
  header?: AppShellHeader | ReactNode;
  /**
   * Header-less shells only: the top bar below the breakpoint, where the nav moves into
   * the Drawer and needs a Menu Button. AppHeader props (the shell injects the Menu
   * Button) or a built header that places `AppShellPattern.MenuButton`. Default: AppHeader
   * titled `navLabel` or `nav.title`, with the Menu Button, then `markIcon` or `mark` (the
   * shell's, else the nav's when set) beside the title, and no search. Ignored when `header` is set.
   */
  narrowHeader?: AppShellHeader | ReactNode;
  /** Brand letter or node for the default `narrowHeader`. A props nav lends its own when unset. */
  mark?: AppShellNav["mark"];
  /** Icon mark for the default `narrowHeader` (a Lucide name, component, or element). Wins over `mark`. */
  markIcon?: AppShellNav["markIcon"];
  /**
   * SideNav props, or a nav you built (a `SideNav`, or SideNav compose parts). A built nav
   * renders in the rail when wide and inside the left Drawer when narrow; read
   * `useAppShell()` (`navPlacement`, `collapsed`) to adapt it, or pass a function that gets the placement.
   */
  nav: AppShellNav | ReactNode | ((placement: AppShellNavPlacement) => ReactNode);
  /** Drawer title on narrow screens. Default: `nav.title`, or "Navigation" for a built nav. */
  navLabel?: string;
  /** Chrome look. Default "flat". */
  layout?: AppShellLayout;
  /** Controlled rail collapse (icons only, labels in tooltips). Wide screens only. */
  collapsed?: boolean;
  /** Uncontrolled start state when nothing is stored for this browser session. Default false. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Adds a "Projects" group to a props nav. */
  projects?: AppShellProjects;
  /** The signed-in person and their menu, last in a props nav footer. */
  account?: AppShellAccount;
  /** Optional right work panel with tabs. Off unless open. */
  workPanel?: AppShellWorkPanel;
  /** Page content: usually a `layout-canvas` or `layout-workspace`, or another pattern. */
  children: ReactNode;
  /** Extra class on the `layout-shell` root, e.g. `layout-shell--viewport` to fill the viewport height. */
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
  /** A top bar shows: `header`, or `narrowHeader` below the breakpoint. False when wide with no header, so a built nav shows its own brand. */
  hasHeader: boolean;
  /** The wide rail is collapsed to icons. Always false when narrow. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** id of the wide rail wrapper, for aria-controls. */
  railId: string;
  /** A work panel is configured. */
  hasPanel: boolean;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  /** id of the work panel, for aria-controls. */
  panelId: string;
}

interface MenuSlot {
  ref: RefObject<HTMLSpanElement | null>;
  /** Counts mounted Menu Buttons; returns the unregister call. */
  register: () => () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);
const MenuSlotContext = createContext<MenuSlot | null>(null);
const PanelToggleRef = createContext<RefObject<HTMLSpanElement | null> | null>(null);

/** Shell state for custom chrome. Null outside AppShellPattern. */
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
 * Renders `children` when wide. Focus returns here when the Drawer closes.
 */
export function AppShellMenuButton({ children = null, ariaLabel = "Open navigation" }: AppShellMenuButtonProps) {
  const shell = useContext(AppShellContext);
  const slot = useContext(MenuSlotContext);

  useEffect(() => slot?.register(), [slot]);

  if (!shell?.narrow) return <>{children}</>;
  return (
    <span ref={slot?.ref} className="app-shell-pattern__menu">
      <Button
        appearance="ghost"
        mode="neutral"
        size="sm"
        iconStart="Menu"
        ariaLabel={ariaLabel}
        aria-expanded={shell.navOpen}
        aria-haspopup="dialog"
        onClick={shell.openNav}
      />
    </span>
  );
}

export interface AppShellRailToggleProps {
  /** Rendered when narrow (the Drawer replaces the rail). Default nothing. */
  children?: ReactNode;
  /** Accessible name. Default "Collapse sidebar" while open, "Expand sidebar" while collapsed; aria-expanded carries the state too. */
  ariaLabel?: string;
}

/** Wide-screen toggle that collapses the rail to icons. Renders `children` when narrow. */
export function AppShellRailToggle({ children = null, ariaLabel }: AppShellRailToggleProps) {
  const shell = useContext(AppShellContext);
  if (!shell || shell.narrow) return <>{children}</>;
  return (
    <Button
      appearance="ghost"
      mode="neutral"
      size="sm"
      iconStart={shell.collapsed ? "PanelLeftOpen" : "PanelLeftClose"}
      ariaLabel={ariaLabel ?? (shell.collapsed ? "Expand sidebar" : "Collapse sidebar")}
      aria-expanded={!shell.collapsed}
      aria-controls={shell.railId}
      onClick={() => {
        shell.setCollapsed(!shell.collapsed);
        // The header swaps brand layouts on collapse, which remounts this Button: keep focus on it.
        requestAnimationFrame(() =>
          document.querySelector<HTMLButtonElement>(`button[aria-controls="${CSS.escape(shell.railId)}"]`)?.focus(),
        );
      }}
    />
  );
}

/** Shows and hides the work panel (wide aside, narrow Drawer). Renders nothing without a workPanel. */
export function AppShellPanelToggle({ ariaLabel }: { ariaLabel?: string }) {
  const shell = useContext(AppShellContext);
  const ref = useContext(PanelToggleRef);
  if (!shell?.hasPanel) return null;
  return (
    <span ref={ref} className="app-shell-pattern__menu">
      <Button
        appearance="ghost"
        mode="neutral"
        size="sm"
        iconStart={shell.panelOpen ? "PanelRightClose" : "PanelRightOpen"}
        ariaLabel={ariaLabel ?? "Work panel"}
        aria-expanded={shell.panelOpen}
        aria-controls={shell.narrow ? undefined : shell.panelId}
        onClick={() => shell.setPanelOpen(!shell.panelOpen)}
      />
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

/*
 * Rail collapse is remembered for the browser session (sessionStorage). The server render
 * and first paint use defaultCollapsed, so hydration matches; the stored value applies after.
 */
const COLLAPSED_KEY = "agentic-ds-kit:app-shell:collapsed";
const collapsedListeners = new Set<() => void>();

function readCollapsed(): string | null {
  try {
    return window.sessionStorage.getItem(COLLAPSED_KEY);
  } catch {
    return null;
  }
}

function writeCollapsed(value: boolean) {
  try {
    window.sessionStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
  } catch {
    // Storage blocked (private mode, sandbox): the state still changes for this page.
  }
  collapsedListeners.forEach((listener) => listener());
}

function subscribeCollapsed(onChange: () => void) {
  collapsedListeners.add(onChange);
  return () => {
    collapsedListeners.delete(onChange);
  };
}

function useStoredCollapsed(fallback: boolean): [boolean, (next: boolean) => void] {
  const stored = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => null);
  // Storage can be blocked; keep an in-memory copy so the toggle still works.
  const [memory, setMemory] = useState<boolean | null>(null);
  const value = stored != null ? stored === "1" : (memory ?? fallback);
  return [
    value,
    (next) => {
      setMemory(next);
      writeCollapsed(next);
    },
  ];
}

/** A props object (preset chrome) rather than a built node. */
function isPropsObject<T extends object>(value: T | ReactNode): value is T {
  return typeof value === "object" && value !== null && !isValidElement(value) && !(Symbol.iterator in value);
}

/** One SideNavItemData row as a compose-part SideNav.Item (footer rows beside the account menu). */
function itemNode(item: SideNavItemData) {
  return (
    <SideNavItem
      key={item.id}
      label={item.label}
      icon={item.icon}
      badge={item.badge}
      active={item.active}
      disabled={item.disabled}
      href={item.href}
      onClick={item.onClick}
    >
      {item.items?.map(itemNode)}
    </SideNavItem>
  );
}

function footerRows(footer: AppShellNav["footer"]): SideNavItemData[] | null {
  const isRow = (value: unknown): value is SideNavItemData =>
    isPropsObject<SideNavItemData>(value as ReactNode) && typeof (value as SideNavItemData).label === "string";
  if (Array.isArray(footer)) return footer.every(isRow) ? footer : null;
  return isRow(footer) ? [footer] : null;
}

/** SideNav.Account (avatar, name, email) with a kit DropdownMenu of account actions beside it. */
function AccountMenu({ name, email, src, initials, menu, onSelect, menuLabel = "Account menu" }: AppShellAccount) {
  const { rail } = useSideNav();
  return (
    <div className="app-shell-pattern__account">
      <SideNavAccount className="app-shell-pattern__account-card" name={name} secondary={email} src={src} initials={initials} />
      {rail ? null : (
        <DropdownMenu
          appearance="ghost"
          mode="neutral"
          size="sm"
          iconStart="ChevronsUpDown"
          ariaLabel={menuLabel}
          align="end"
          groups={menu}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

/** Builds the SideNav props the shell renders: projects group and account footer folded in. */
function withSections(nav: AppShellNav, projects?: AppShellProjects, account?: AppShellAccount): AppShellNav {
  let groups: SideNavGroup[] | undefined = nav.groups;
  if (projects) {
    const rows: SideNavItemData[] = [...projects.items];
    if (projects.onNew) {
      rows.push({ id: "app-shell-new-project", label: projects.newLabel ?? "New project", icon: "Plus", onClick: projects.onNew });
    }
    groups = [...(groups ?? (nav.items ? [{ label: "", items: nav.items }] : [])), { label: projects.label ?? "Projects", items: rows }];
  }
  let footer = nav.footer;
  if (account) {
    const rows = footerRows(nav.footer);
    footer = (
      <>
        {rows ? <SideNavSection>{rows.map(itemNode)}</SideNavSection> : (nav.footer as ReactNode)}
        <AccountMenu {...account} />
      </>
    );
  }
  return { ...nav, groups, footer, account: account ? undefined : nav.account };
}

/**
 * Start region for a props header. Narrow: the Menu Button in the brand cell, then the mark
 * and title. Wide: the logo or mark in the brand cell (on the rail icon axis) and the title,
 * then the rail toggle at the end of a row as wide as the open rail, so it lines up with the nav's edge.
 * Wide and collapsed: only the logo or mark, as wide as the closed rail, with the expand toggle in the same cell.
 */
function headerStart(header: AppShellHeader, narrow: boolean, collapsed: boolean) {
  const titleNode = header.title ? <AppHeader.Title>{header.title}</AppHeader.Title> : null;
  const mark = header.mark ?? (header.logo || header.markIcon ? undefined : header.title?.charAt(0));
  const hasBrand = Boolean(header.logo || header.markIcon || mark);
  if (!narrow && collapsed) {
    // Collapsed rail: the brand shrinks to the rail's width and shows only the logo or mark.
    // The expand toggle shares its cell and takes over on hover or keyboard focus; a tap on the
    // logo expands the rail too. The title stays the header's accessible name (ariaLabel).
    return (
      <div className="app-shell-pattern__brand-row app-shell-pattern__brand-row--collapsed">
        <AppHeader.Brand className="app-shell-pattern__brand-mark" mark={mark} markIcon={header.markIcon} logo={header.logo} />
        <span className="app-shell-pattern__brand-toggle">
          <AppShellRailToggle />
        </span>
      </div>
    );
  }
  if (!narrow) {
    return (
      <div className="app-shell-pattern__brand-row">
        <AppHeader.Brand mark={mark} markIcon={header.markIcon} logo={header.logo}>
          {titleNode}
        </AppHeader.Brand>
        <AppShellRailToggle />
      </div>
    );
  }
  return (
    <AppHeader.Brand logo={<AppShellMenuButton />}>
      {hasBrand ? (
        <AppHeader.Brand className="app-shell-pattern__inner-brand" mark={mark} markIcon={header.markIcon} logo={header.logo}>
          {titleNode}
        </AppHeader.Brand>
      ) : (
        titleNode
      )}
    </AppHeader.Brand>
  );
}

/** The default narrowHeader: AppHeader with the Menu Button, then the mark and title. No search. */
function DefaultNarrowHeader({ title, mark, markIcon }: Pick<AppShellNav, "mark" | "markIcon"> & { title?: string }) {
  const titleNode = title ? <AppHeader.Title>{title}</AppHeader.Title> : null;
  return (
    <AppHeader.Root ariaLabel={title ?? "Application"} radius="none" data-search="false">
      <AppHeader.Brand logo={<AppShellMenuButton />}>
        {mark || markIcon ? (
          <AppHeader.Brand className="app-shell-pattern__inner-brand" mark={mark || undefined} markIcon={markIcon}>
            {titleNode}
          </AppHeader.Brand>
        ) : (
          titleNode
        )}
      </AppHeader.Brand>
      <AppHeader.Actions>
        <AppShellPanelToggle />
      </AppHeader.Actions>
    </AppHeader.Root>
  );
}

/** Work panel content: a close row and kit Tabs. */
function WorkPanelBody({
  panel,
  tab,
  onTab,
  onClose,
}: {
  panel: AppShellWorkPanel;
  tab: string;
  onTab: (id: string) => void;
  onClose?: () => void;
}) {
  return (
    <>
      {onClose ? (
        <div className="app-shell-pattern__panel-head">
          <p className="app-shell-pattern__panel-title">{panel.title}</p>
          <Button appearance="ghost" mode="neutral" size="sm" iconStart="X" ariaLabel={`Close ${panel.title}`} onClick={onClose} />
        </div>
      ) : null}
      <Tabs className="app-shell-pattern__panel-tabs" size="sm" ariaLabel={panel.title} items={panel.tabs} value={tab} onChange={onTab} />
    </>
  );
}

/**
 * Product chrome at every width. Wide: AppHeader over SideNav + content (layout-shell /
 * layout-app), in a flat or inset look; the rail collapses to icons and an optional work
 * panel sits on the right. Narrow: no SideNav; a Menu Button opens the nav in a left Drawer
 * and the work panel opens in a right Drawer.
 */
function AppShellPatternRoot({
  header,
  narrowHeader,
  nav,
  navLabel,
  mark,
  markIcon,
  layout = "flat",
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  projects,
  account,
  workPanel,
  children,
  className = "",
}: AppShellPatternProps) {
  const narrow = useNarrow();
  const railId = useId();
  const panelId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLSpanElement>(null);
  const panelToggleRef = useRef<HTMLSpanElement>(null);
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
  const rawNavProps = typeof nav !== "function" && isPropsObject<AppShellNav>(nav) ? nav : null;
  const navProps = rawNavProps ? withSections(rawNavProps, projects, account) : null;

  // Collapse: controlled prop, else a props nav's own open, else the session-stored state.
  const [storedCollapsed, setStoredCollapsed] = useStoredCollapsed(defaultCollapsed);
  const navControlled = rawNavProps?.open != null;
  const wideCollapsed = collapsedProp ?? (navControlled ? !rawNavProps.open : storedCollapsed);
  const collapsed = narrow ? false : wideCollapsed;
  const setCollapsed = (next: boolean) => {
    onCollapsedChange?.(next);
    rawNavProps?.onOpenChange?.(!next);
    if (collapsedProp == null && !navControlled) setStoredCollapsed(next);
  };

  // Work panel: off by default.
  const [panelOpenState, setPanelOpenState] = useState(workPanel?.defaultOpen ?? false);
  const panelOpen = Boolean(workPanel) && (workPanel?.open ?? panelOpenState);
  const setPanelOpen = (next: boolean) => {
    workPanel?.onOpenChange?.(next);
    if (workPanel?.open == null) setPanelOpenState(next);
  };
  const [tabState, setTabState] = useState(workPanel?.defaultTab ?? workPanel?.tabs[0]?.id ?? "");
  const tab = workPanel?.tab ?? tabState;
  const setTab = (id: string) => {
    workPanel?.onTabChange?.(id);
    if (workPanel?.tab == null) setTabState(id);
  };
  function closePanel() {
    setPanelOpen(false);
    panelToggleRef.current?.querySelector("button")?.focus();
  }

  // The shell's own mark wins; otherwise a props nav lends its mark to the narrow top bar.
  const brand = mark || markIcon ? { mark, markIcon } : { mark: rawNavProps?.mark, markIcon: rawNavProps?.markIcon };
  const activeHeader: AppShellHeader | ReactNode =
    header != null
      ? header
      : narrow
        ? (narrowHeader ?? (
            <DefaultNarrowHeader title={navLabel ?? rawNavProps?.title} mark={brand.mark} markIcon={brand.markIcon} />
          ))
        : null;
  const hasHeader = activeHeader != null;
  const headerProps = isPropsObject<AppShellHeader>(activeHeader) ? activeHeader : null;
  const headerNode = headerProps ? null : (activeHeader as ReactNode);
  const navNode = (placement: AppShellNavPlacement): ReactNode =>
    typeof nav === "function" ? nav(placement) : (nav as ReactNode);

  // Widening past the breakpoint closes the nav Drawer (adjusted during render, not in an effect).
  const [wasNarrow, setWasNarrow] = useState(narrow);
  if (wasNarrow !== narrow) {
    setWasNarrow(narrow);
    if (!narrow) setMenuOpen(false);
  }

  // Safari does not focus a clicked button, so the shell puts focus back on the Menu Button.
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
    hasHeader,
    collapsed,
    setCollapsed,
    railId,
    hasPanel: Boolean(workPanel),
    panelOpen,
    setPanelOpen,
    panelId,
  };

  const layoutClass = layout === "inset" ? "layout-shell--inset app-shell-pattern--inset" : "app-shell-pattern--flat";
  const headerActions =
    headerProps && workPanel && headerProps.end === undefined ? (
      <>
        <AppShellPanelToggle ariaLabel={workPanel.title} />
        {headerProps.actions}
      </>
    ) : (
      headerProps?.actions
    );

  const page = workPanel ? (
    <div className="app-shell-pattern__main" data-panel={!narrow && panelOpen ? "open" : undefined}>
      {children}
      {!narrow && panelOpen ? (
        <aside id={panelId} className="app-shell-pattern__panel" aria-label={workPanel.title}>
          <WorkPanelBody panel={workPanel} tab={tab} onTab={setTab} onClose={closePanel} />
        </aside>
      ) : null}
    </div>
  ) : (
    children
  );

  return (
    <AppShellContext.Provider value={shell}>
      <MenuSlotContext.Provider value={menuSlot}>
        <PanelToggleRef.Provider value={panelToggleRef}>
          <div className={`layout-shell ${layoutClass} ${className}`.trim()} data-layout={layout}>
            {headerProps ? (
              <AppHeader
                {...headerProps}
                radius="none"
                start={headerProps.start ?? headerStart(headerProps, narrow, collapsed)}
                actions={headerActions}
              />
            ) : (
              headerNode
            )}
            <div className="layout-app app-shell-pattern__app">
              {narrow ? null : (
                <div id={railId} className="app-shell-pattern__rail">
                  <AppShellContext.Provider value={{ ...shell, navPlacement: "rail" }}>
                    {navProps ? (
                      <SideNav
                        {...navProps}
                        open={!collapsed}
                        onOpenChange={(open) => setCollapsed(!open)}
                        showHeader={!hasHeader}
                        radius="none"
                      />
                    ) : (
                      navNode("rail")
                    )}
                  </AppShellContext.Provider>
                </div>
              )}
              {page}
            </div>
            {narrow ? (
              <Drawer
                open={menuOpen}
                title={navLabel ?? rawNavProps?.title ?? "Navigation"}
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
            {narrow && workPanel ? (
              <Drawer open={panelOpen} title={workPanel.title} side="right" size="md" onClose={() => setPanelOpen(false)}>
                <WorkPanelBody panel={workPanel} tab={tab} onTab={setTab} />
              </Drawer>
            ) : null}
          </div>
        </PanelToggleRef.Provider>
      </MenuSlotContext.Provider>
    </AppShellContext.Provider>
  );
}

/**
 * `AppShellPattern.MenuButton`, `.RailToggle` and `.PanelToggle` are the named exports. From a
 * Server Component use the named exports: dot access on a client component does not cross the server boundary.
 */
export const AppShellPattern = Object.assign(AppShellPatternRoot, {
  MenuButton: AppShellMenuButton,
  RailToggle: AppShellRailToggle,
  PanelToggle: AppShellPanelToggle,
});
