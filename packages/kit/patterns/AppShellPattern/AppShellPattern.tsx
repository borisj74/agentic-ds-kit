"use client";

import {
  createContext,
  Fragment,
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
import { Command } from "../../ui/Command";
import type { CommandGroup } from "../../ui/Command";
import { Input } from "../../ui/Input";
import { Modal } from "../../ui/Modal";
import { ModalCard } from "../../ui/ModalCard";
import type { KitIcon } from "../../ui/Button";
import { Empty } from "../../ui/Empty";
import { ListView } from "../../ui/ListView";
import type { NotificationItem } from "../../ui/NotificationStack";
import { Popover } from "../../ui/Popover";
import {
  SideNavAccount,
  SideNavBrand,
  SideNavFooter,
  SideNavHeader,
  SideNavItem,
  SideNavNav,
  SideNavRoot,
  SideNavSection,
  SideNavSlot,
  SideNavToggle,
  useSideNav,
} from "../../ui/SideNav";
import type { SideNavGroup, SideNavItemData, SideNavProps } from "../../ui/SideNav";
import { Tabs } from "../../ui/Tabs";
import type { TabItem } from "../../ui/Tabs";
import { Tooltip } from "../../ui/Tooltip";
import "./AppShellPattern.css";

/** AppHeader props. The shell owns `radius` (always none). */
export type AppShellHeader = Omit<AppHeaderProps, "radius">;

/** The data SideNav takes. The shell owns `showHeader`, `radius`, and `side`. */
export type AppShellNav = Omit<SideNavProps, "showHeader" | "radius" | "side">;

/** inset (default): nav on the page background, content in a raised card. flat: nav on the surface with a hairline edge, page on the subtle background, edge to edge. */
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
  /** Second line, e.g. a role or an email. */
  secondary?: string;
  src?: string;
  initials?: string;
  /** DropdownMenu groups, e.g. Settings, a Theme submenu, Sign out. */
  menu: DropdownMenuGroup[];
  /** (id) => void for a picked menu item. */
  onSelect?: (id: string) => void;
  /** Accessible name of the menu trigger. Default "Account menu". */
  menuLabel?: string;
}

/** Sidebar quick actions: a field that opens the kit command menu (Command in a Modal), with a search Button beside it. */
export interface AppShellSearch {
  /** Command groups and items. */
  groups: CommandGroup[];
  /** (id) => void for a picked command. The menu closes first. */
  onSelect?: (id: string) => void;
  /** Field placeholder and accessible name. Default "Quick actions". */
  placeholder?: string;
  /** Name of the icon-only search Button beside the field. Default "Search". */
  searchLabel?: string;
  /** Runs when the search Button is used. Default: opens the command menu. */
  onSearch?: () => void;
  /** Placeholder inside the command menu. Default "Search pages and actions". */
  commandPlaceholder?: string;
  /** Command menu title (Modal title and Command label). Default "Search". */
  title?: string;
  /** Listen for ⌘K / Ctrl+K and show the hint. Default true. */
  shortcut?: boolean;
}

/** Workspace switcher in the nav's top row: mark, name and a chevron, opening a kit DropdownMenu. */
export interface AppShellWorkspace {
  /** Current workspace name. */
  name: string;
  /** Logo or mark before the name (a Lucide name, component or element). */
  mark?: KitIcon;
  /** DropdownMenu groups: other workspaces, then actions such as Create workspace. */
  menu: DropdownMenuGroup[];
  onSelect?: (id: string) => void;
}

/** One tab of the notifications panel. */
export interface AppShellNotificationTab {
  id: string;
  /** Tab label; its unread count is added after it. */
  label: string;
  items: NotificationItem[];
  /** kit Empty title when the tab has no items. Default "Nothing new". */
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * Notifications as the first main nav row (icon, label, unread count Badge), opening a panel at the
 * sidebar's edge: title, kit Tabs with counts, a list, or kit Empty with a settings Button.
 */
export interface AppShellNotifications {
  tabs: AppShellNotificationTab[];
  /** Row label and panel title. Default "Notifications". */
  label?: string;
  /** (tabId, itemId) => void for a picked item. */
  onItemClick?: (tabId: string, id: string) => void;
  /** Settings Button label. Default "Notification settings". */
  settingsLabel?: string;
  onSettings?: () => void;
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
  /** Chrome look. Default "inset". */
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
  /** One muted line under the product name in the nav's brand (header-less shells, e.g. flat). Props nav only. */
  subtitle?: string;
  /** Notifications as the first main nav row, opening a panel at the sidebar's edge (a kit Popover; a kit Drawer when narrow). Props nav only. */
  notifications?: AppShellNotifications;
  /** Workspace switcher in the nav's top row, beside the collapse Toggle (replaces the brand there). Props nav only. */
  workspace?: AppShellWorkspace;
  /** Search field under the brand (an icon button with a tooltip on the collapsed rail) that opens the kit command menu; ⌘K opens it too. Props nav only. */
  search?: AppShellSearch;
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
  /** A search slot is configured. */
  hasSearch: boolean;
  /** Opens the command menu (closes the nav Drawer first). */
  openSearch: () => void;
  /** The notifications panel (Popover when wide, Drawer when narrow) is open. */
  notificationsOpen: boolean;
  /** Opens or closes the notifications panel (closes the nav Drawer first when opening). */
  setNotificationsOpen: (open: boolean) => void;
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
function AccountMenu({ name, secondary, src, initials, menu, onSelect, menuLabel = "Account menu" }: AppShellAccount) {
  const { rail } = useSideNav();
  return (
    <div className="app-shell-pattern__account">
      <SideNavAccount className="app-shell-pattern__account-card" name={name} secondary={secondary} src={src} initials={initials} />
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

/** Nav groups with the Projects group folded in. */
function navGroups(nav: AppShellNav, projects?: AppShellProjects): SideNavGroup[] {
  const groups: SideNavGroup[] = nav.groups ?? (nav.items ? [{ label: "", items: nav.items }] : []);
  if (!projects) return groups;
  const rows: SideNavItemData[] = [...projects.items];
  if (projects.onNew) {
    rows.push({
      id: "app-shell-new-project",
      label: projects.newLabel ?? "New project",
      icon: "Plus",
      onClick: projects.onNew,
    });
  }
  return [...groups, { label: projects.label ?? "Projects", items: rows }];
}

/**
 * Quick actions row: a read-only field with a ⌘K hint that opens the command menu, and an icon-only
 * search Button beside it. On the collapsed rail: one SideNav row (icon, with the rail tooltip).
 */
function SearchSlot({ search }: { search: AppShellSearch }) {
  const shell = useContext(AppShellContext);
  const { rail } = useSideNav();
  const id = useId();
  const label = search.placeholder ?? "Quick actions";
  const searchLabel = search.searchLabel ?? "Search";
  const shortcut = search.shortcut !== false;
  const open = () => shell?.openSearch();
  if (rail) {
    // A SideNav row on the rail, so it gets the same chip and the same tooltip outside the rail edge
    // as the nav rows (a plain Tooltip here would be clipped by the rail).
    return (
      <SideNavSection>
        <SideNavItem
          label={label}
          icon="Search"
          aria-haspopup="dialog"
          aria-keyshortcuts={shortcut ? "Meta+K Control+K" : undefined}
          onClick={open}
        />
      </SideNavSection>
    );
  }
  return (
    <div className="app-shell-pattern__quick">
      <Input
        id={id}
        className="app-shell-pattern__search"
        type="search"
        size="sm"
        iconStart="Zap"
        placeholder={label}
        ariaLabel={label}
        end={shortcut ? "⌘K" : undefined}
        readOnly
        aria-haspopup="dialog"
        aria-keyshortcuts={shortcut ? "Meta+K Control+K" : undefined}
        onClick={open}
        onKeyDown={(event) => {
          const typed = event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey;
          if (event.key === "Enter" || typed) {
            event.preventDefault();
            open();
          }
        }}
      />
      <Tooltip content={searchLabel} placement="bottom">
        <Button
          appearance="ghost"
          mode="neutral"
          size="sm"
          iconStart="Search"
          ariaLabel={searchLabel}
          aria-haspopup={search.onSearch ? undefined : "dialog"}
          onClick={search.onSearch ?? open}
        />
      </Tooltip>
    </div>
  );
}

/** Workspace switcher: a ghost kit DropdownMenu trigger with the mark, the name and a chevron. */
function WorkspaceSwitcher({ workspace }: { workspace: AppShellWorkspace }) {
  return (
    <span className="app-shell-pattern__workspace">
      <DropdownMenu
        appearance="ghost"
        mode="neutral"
        size="sm"
        trigger={workspace.name}
        iconStart={workspace.mark}
        iconEnd="ChevronsUpDown"
        groups={workspace.menu}
        onSelect={workspace.onSelect}
      />
    </span>
  );
}

const unreadCount = (items: NotificationItem[]) => items.filter((item) => !item.read).length;
const NOTIFICATIONS_ROW = "app-shell-notifications";

/** Panel content: title with a settings Button, then kit Tabs (each with its unread count) of lists or kit Empty. */
function NotificationsPanel({ notifications, titled = true }: { notifications: AppShellNotifications; titled?: boolean }) {
  const label = notifications.label ?? "Notifications";
  const settingsLabel = notifications.settingsLabel ?? "Notification settings";
  return (
    <div className="app-shell-pattern__notify-panel">
      {titled ? (
        <div className="app-shell-pattern__panel-head">
          <p className="app-shell-pattern__panel-title">{label}</p>
          {notifications.onSettings ? (
            <Button
              appearance="ghost"
              mode="neutral"
              size="sm"
              iconStart="Settings"
              ariaLabel={settingsLabel}
              onClick={notifications.onSettings}
            />
          ) : null}
        </div>
      ) : null}
      <Tabs
        size="sm"
        ariaLabel={label}
        items={notifications.tabs.map((tab) => {
          const count = unreadCount(tab.items);
          return {
            id: tab.id,
            label: count > 0 ? `${tab.label} (${count})` : tab.label,
            content:
              tab.items.length > 0 ? (
                <ListView
                  label={tab.label}
                  size="sm"
                  interaction="drill"
                  onOpen={(id) => notifications.onItemClick?.(tab.id, id)}
                  items={tab.items.map((item) => ({
                    id: item.id,
                    primary: item.title,
                    secondary: [item.body, item.createdAt].filter(Boolean).join(" · "),
                    icon: item.icon ?? "Bell",
                    badge: item.read ? undefined : "New",
                    badgeTone: "info" as const,
                  }))}
                />
              ) : (
                <Empty
                  title={tab.emptyTitle ?? "Nothing new"}
                  description={tab.emptyDescription}
                  icon="Bell"
                  actions={
                    notifications.onSettings ? (
                      <Button appearance="outline" mode="neutral" size="sm" onClick={notifications.onSettings}>
                        {settingsLabel}
                      </Button>
                    ) : undefined
                  }
                />
              ),
          };
        })}
      />
    </div>
  );
}

/**
 * The Notifications nav row. Wide: its control anchors a kit Popover (placement right) at the
 * sidebar's edge, over the content; the row reads as active while it is open. Collapsed rail: the
 * count becomes a dot on the icon. In the Drawer: the row opens the full-height notifications Drawer.
 */
function NotificationsRow({ notifications, placement }: { notifications: AppShellNotifications; placement: AppShellNavPlacement }) {
  const shell = useContext(AppShellContext);
  const { rail } = useSideNav();
  const label = notifications.label ?? "Notifications";
  const total = notifications.tabs.reduce((sum, tab) => sum + unreadCount(tab.items), 0);
  const open = Boolean(shell?.notificationsOpen);
  const className = [
    open ? "app-shell-pattern__nav-open" : "",
    open && rail ? "app-shell-pattern__nav-open--rail" : "",
    rail && total > 0 ? "app-shell-pattern__nav-dot" : "",
  ]
    .filter(Boolean)
    .join(" ");
  if (placement === "drawer") {
    return (
      <SideNavItem
        label={label}
        icon="Bell"
        badge={total > 0 ? String(total) : undefined}
        aria-haspopup="dialog"
        onClick={() => shell?.setNotificationsOpen(true)}
      />
    );
  }
  return (
    <SideNavItem
      label={label}
      icon="Bell"
      badge={total > 0 ? String(total) : undefined}
      className={className || undefined}
      aria-haspopup="dialog"
      aria-expanded={open}
      renderControl={(control) => (
        <span className={rail ? "app-shell-pattern__row-anchor app-shell-pattern__row-anchor--rail" : "app-shell-pattern__row-anchor"}>
          <Popover label={label} placement="right" open={open} onOpenChange={(next) => shell?.setNotificationsOpen(next)} trigger={control}>
            <NotificationsPanel notifications={notifications} />
          </Popover>
        </span>
      )}
    />
  );
}

/** Brand title for the nav header: the product name with an optional muted subtitle line. */
function brandTitle(title: string, subtitle?: string): ReactNode {
  if (!subtitle) return title;
  return (
    <span className="app-shell-pattern__brand-text">
      <span className="app-shell-pattern__brand-name">{title}</span>
      <span className="app-shell-pattern__brand-subtitle">{subtitle}</span>
    </span>
  );
}

/**
 * A props nav built from the SideNav compose parts, so rows can stay on the closed rail: a top row
 * (workspace switcher or brand, then the collapse Toggle), the quick actions row, the groups
 * (Notifications first, Projects folded in), then footer rows and the account menu.
 */
function ShellPropsNav({
  nav,
  placement,
  open,
  onOpenChange,
  showHeader,
  projects,
  account,
  search,
  subtitle,
  notifications,
  workspace,
}: {
  nav: AppShellNav;
  placement: AppShellNavPlacement;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  showHeader: boolean;
  projects?: AppShellProjects;
  account?: AppShellAccount;
  search?: AppShellSearch;
  subtitle?: string;
  notifications?: AppShellNotifications;
  workspace?: AppShellWorkspace;
}) {
  const inDrawer = placement === "drawer";
  const groups = navGroups(nav, projects);
  const rows = footerRows(nav.footer);
  const row = (item: SideNavItemData) => {
    const node = itemNode(item);
    return nav.renderItem ? <Fragment key={item.id}>{nav.renderItem(item, node)}</Fragment> : node;
  };
  const hasFooter = Boolean(nav.footer || account || nav.account);
  return (
    <SideNavRoot aria-label={nav["aria-label"] ?? nav.title} radius={inDrawer ? "md" : "none"} open={open} onOpenChange={onOpenChange}>
      {showHeader && !inDrawer ? (
        <SideNavHeader>
          {workspace ? (
            <WorkspaceSwitcher workspace={workspace} />
          ) : (
            (nav.header ?? <SideNavBrand title={brandTitle(nav.title, subtitle)} mark={nav.mark} markIcon={nav.markIcon} />)
          )}
          <SideNavToggle />
        </SideNavHeader>
      ) : null}
      {inDrawer && workspace ? (
        <SideNavSlot className="app-shell-pattern__search-slot">
          <WorkspaceSwitcher workspace={workspace} />
        </SideNavSlot>
      ) : null}
      {search ? (
        <SideNavSlot keepOnRail className="app-shell-pattern__search-slot">
          <SearchSlot search={search} />
        </SideNavSlot>
      ) : null}
      {nav.beforeGroups ? <SideNavSlot>{nav.beforeGroups}</SideNavSlot> : null}
      <SideNavNav>
        {groups.map((group, index) => (
          <SideNavSection key={group.label || `group-${index}`} label={group.label || undefined}>
            {index === 0 && notifications ? (
              <NotificationsRow key={NOTIFICATIONS_ROW} notifications={notifications} placement={placement} />
            ) : null}
            {group.items.map(row)}
          </SideNavSection>
        ))}
      </SideNavNav>
      {nav.afterGroups ? <SideNavSlot placement="after">{nav.afterGroups}</SideNavSlot> : null}
      {hasFooter ? (
        <SideNavFooter>
          {rows ? <SideNavSection>{rows.map(row)}</SideNavSection> : (nav.footer as ReactNode)}
          {account ? <AccountMenu {...account} /> : nav.account ? <SideNavAccount {...nav.account} /> : null}
        </SideNavFooter>
      ) : null}
    </SideNavRoot>
  );
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

/** Work panel content: kit Tabs. The header (h2 title, Close) is ModalCard's, or the Drawer's when narrow. */
function WorkPanelBody({ panel, tab, onTab }: { panel: AppShellWorkPanel; tab: string; onTab: (id: string) => void }) {
  return <Tabs className="app-shell-pattern__panel-tabs" size="sm" fill ariaLabel={panel.title} items={panel.tabs} value={tab} onChange={onTab} />;
}

/**
 * Product chrome at every width. Wide: AppHeader over SideNav + content (layout-shell /
 * layout-app), in a flat or inset look; the rail collapses to icons and an optional work
 * panel sits on the right. Narrow: no SideNav; a Menu Button opens the nav in a left Drawer
 * and the work panel opens in a right Drawer, which is a bottom sheet below 30rem.
 */
function AppShellPatternRoot({
  header,
  narrowHeader,
  nav,
  navLabel,
  mark,
  markIcon,
  layout = "inset",
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  projects,
  account,
  subtitle,
  search,
  notifications,
  workspace,
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
  const navProps = rawNavProps;

  // Notifications panel: a Popover at the sidebar's edge when wide, a Drawer when narrow.
  const [notificationsOpen, setNotificationsOpenState] = useState(false);

  // Command menu: the search slot, or ⌘K / Ctrl+K anywhere in the page.
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };
  const commandRef = useRef<HTMLDivElement>(null);
  // The Modal focuses its first control (Close); put focus in the command input instead.
  useEffect(() => {
    if (!searchOpen) return undefined;
    const frame = requestAnimationFrame(() => commandRef.current?.querySelector<HTMLInputElement>("input")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [searchOpen]);
  const searchShortcut = Boolean(search) && search?.shortcut !== false;
  useEffect(() => {
    if (!searchShortcut) return undefined;
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setSearchOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchShortcut]);

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
        ? (narrowHeader ?? <DefaultNarrowHeader title={navLabel ?? rawNavProps?.title} mark={brand.mark} markIcon={brand.markIcon} />)
        : null;
  const hasHeader = activeHeader != null;
  const headerProps = isPropsObject<AppShellHeader>(activeHeader) ? activeHeader : null;
  const headerNode = headerProps ? null : (activeHeader as ReactNode);
  const navNode = (placement: AppShellNavPlacement): ReactNode => (typeof nav === "function" ? nav(placement) : (nav as ReactNode));

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
      console.warn("AppShellPattern: the custom header has no AppShellPattern.MenuButton, so the nav cannot be opened on narrow screens.");
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
    hasSearch: Boolean(search),
    openSearch,
    notificationsOpen,
    setNotificationsOpen: (next: boolean) => {
      if (next) setMenuOpen(false);
      setNotificationsOpenState(next);
    },
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
        <aside
          id={panelId}
          className="app-shell-pattern__panel"
          aria-label={workPanel.title}
          onKeyDown={(event) => {
            // No focus trap: Escape closes the panel only while focus is inside it.
            if (event.key !== "Escape" || event.defaultPrevented) return;
            event.preventDefault();
            closePanel();
          }}
        >
          <ModalCard className="app-shell-pattern__panel-card" title={workPanel.title} onClose={closePanel}>
            <WorkPanelBody panel={workPanel} tab={tab} onTab={setTab} />
          </ModalCard>
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
                      <ShellPropsNav
                        nav={navProps}
                        placement="rail"
                        open={!collapsed}
                        onOpenChange={(open) => setCollapsed(!open)}
                        showHeader={!hasHeader}
                        projects={projects}
                        account={account}
                        search={search}
                        subtitle={subtitle}
                        notifications={notifications}
                        workspace={workspace}
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
                      <ShellPropsNav
                        nav={navProps}
                        placement="drawer"
                        open
                        showHeader={false}
                        projects={projects}
                        account={account}
                        search={search}
                        subtitle={subtitle}
                        notifications={notifications}
                        workspace={workspace}
                      />
                    ) : (
                      navNode("drawer")
                    )}
                  </AppShellContext.Provider>
                </div>
              </Drawer>
            ) : null}
            {search ? (
              <Modal open={searchOpen} title={search.title ?? "Search"} onClose={() => setSearchOpen(false)}>
                <Command
                  ref={commandRef}
                  label={search.title ?? "Search"}
                  placeholder={search.commandPlaceholder ?? "Search pages and actions"}
                  groups={search.groups}
                  onSelect={(id) => {
                    setSearchOpen(false);
                    search.onSelect?.(id);
                  }}
                />
              </Modal>
            ) : null}
            {narrow && notifications && rawNavProps ? (
              <Drawer
                open={notificationsOpen}
                title={notifications.label ?? "Notifications"}
                side="left"
                size="md"
                onClose={() => setNotificationsOpenState(false)}
                footer={
                  notifications.onSettings ? (
                    <Button appearance="outline" mode="neutral" size="md" block onClick={notifications.onSettings}>
                      {notifications.settingsLabel ?? "Notification settings"}
                    </Button>
                  ) : undefined
                }
              >
                <NotificationsPanel notifications={notifications} titled={false} />
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
