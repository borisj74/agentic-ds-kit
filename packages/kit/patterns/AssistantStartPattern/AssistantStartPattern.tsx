"use client";

import { useState } from "react";
import { Building2, ReceiptText } from "lucide-react";
import { AppHeader } from "../../ui/AppHeader";
import { Card } from "../../ui/Card";
import { Chat } from "../../ui/Chat";
import type { ChatMessage, ChatSuggestion } from "../../ui/Chat";
import { ListView } from "../../ui/ListView";
import type { ListViewItem } from "../../ui/ListView";
import { SideNavBrand } from "../../ui/SideNav";
import { Skeleton } from "../../ui/Skeleton";
import { AppShellPattern, useAppShell } from "../AppShellPattern";
import type { AppShellPatternProps } from "../AppShellPattern";
import "./AssistantStartPattern.css";

/**
 * ready: greeting, figures, suggestions and the Connected apps list.
 * loading: Chat loading (Skeleton suggestions, composer off) and Skeleton app rows, all aria-busy.
 * reconnect-error: QuickBooks failed to reconnect; its row says what answers now skip.
 */
export type AssistantStartState = "ready" | "loading" | "reconnect-error";

export interface AssistantStartPatternProps {
  state?: AssistantStartState;
  /** A question from the composer or a suggestion. The demo shows it in the thread while it thinks. */
  onSend?: (message: string) => void;
  /** Reconnect on a connected app's row, with the app's id. */
  onReconnect?: (id: string) => void;
  /** Ask in the Connected apps card header. */
  onAsk?: () => void;
  /** App shell props for your app (nav, account…), merged over the demo shell. */
  shell?: Partial<Omit<AppShellPatternProps, "children">>;
}

/** Demo shell: the app-shell example's flat chrome for Northwind, Assistant current. */
export const ASSISTANT_START_DEMO_SHELL: Omit<AppShellPatternProps, "children"> = {
  layout: "flat",
  className: "layout-shell--viewport",
  nav: {
    title: "Northwind",
    markIcon: Building2,
    // The product name at the nav's row size, so the page greeting carries the weight.
    header: (
      <SideNavBrand
        markIcon={Building2}
        title={
          <span className="app-shell-pattern__brand-text">
            <span className="app-shell-pattern__brand-name">Northwind</span>
          </span>
        }
      />
    ),
    groups: [
      {
        label: "Work",
        items: [
          { id: "assistant", label: "Assistant", icon: "MessageCircle", active: true },
          { id: "home", label: "Home", icon: "House" },
          { id: "invoices", label: "Invoices", icon: ReceiptText },
          { id: "customers", label: "Customers", icon: "Users" },
          { id: "revenue", label: "Revenue", icon: "ChartLine" },
        ],
      },
    ],
  },
  // Narrow top bar: the Menu Button and the page name, no mark and no search.
  narrowHeader: (
    <AppHeader.Root ariaLabel="Assistant" radius="none" data-search="false">
      <AppHeader.Brand logo={<AppShellPattern.MenuButton />}>
        <AppHeader.Title>Assistant</AppHeader.Title>
      </AppHeader.Brand>
    </AppHeader.Root>
  ),
  account: {
    name: "Maya Chen",
    initials: "MC",
    menu: [{ items: [{ id: "settings", label: "Settings", icon: "Settings" }] }, { items: [{ id: "sign-out", label: "Sign out", icon: "LogOut" }] }],
  },
};

const INTRO =
  "Ask about invoices, customers and revenue. Answers link the invoice or report they use. October MRR $184,320, down 3.1% vs September. 7 invoices overdue, $23,480.";

const SUGGESTIONS: ChatSuggestion[] = [
  { label: "Why did MRR drop 3.1% in October?", hint: "Looks at MRR movements · Sep and Oct", icon: "TrendingDown" },
  { label: "Draft dunning for 7 overdue invoices", hint: "One email per customer · $23,480 due", icon: "Mail" },
  { label: "Growth renewals due in December", hint: "Looks at Growth plan subscriptions", icon: "CalendarDays" },
  { label: "Explain the $1,240 credit on INV-1842", hint: "Looks at the invoice and its credit notes", icon: "FileText" },
];

function appRows(state: AssistantStartState, narrow: boolean): ListViewItem[] {
  const failed = state === "reconnect-error";
  return [
    {
      id: "stripe",
      primary: "Stripe",
      secondary: narrow ? "Synced 09:41" : "Payments and subscriptions · synced 09:41",
      badge: "Connected",
      badgeTone: "success",
    },
    {
      id: "quickbooks",
      primary: "QuickBooks",
      secondary: failed
        ? "Not connected. Answers skip ledger and tax data."
        : narrow
          ? "Last sync Nov 19 09:12"
          : "Ledger and tax · last sync Nov 19 09:12",
      ...(failed ? { icon: "CircleX", iconTone: "danger" as const } : {}),
      badge: "Sign-in expired",
      badgeTone: "warning",
      primaryAction: { id: "reconnect", label: "Reconnect", actionLabel: "Reconnect QuickBooks" },
    },
  ];
}

/**
 * The billing assistant's start page inside AppShellPattern (flat): a centred column with kit Chat
 * (guided empty state, embedded) and a Connected apps Card (ListView) naming the sources answers use.
 * After the first send, the thread fills the page and the Card leaves.
 */
export function AssistantStartPattern({ shell, ...props }: AssistantStartPatternProps) {
  const shellProps = { ...ASSISTANT_START_DEMO_SHELL, ...shell };
  return (
    <AppShellPattern {...shellProps}>
      <AssistantStartPage {...props} />
    </AppShellPattern>
  );
}

function AssistantStartPage({ state = "ready", onSend, onReconnect, onAsk }: Omit<AssistantStartPatternProps, "shell">) {
  const narrow = useAppShell()?.narrow ?? false;
  const loading = state === "loading";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const started = messages.length > 0;

  function send(message: string) {
    setMessages((current) => [...current, { id: `m${current.length}`, role: "user", content: message }]);
    setThinking(true);
    onSend?.(message);
  }

  return (
    <main className={`layout-canvas assistant-start-pattern${started ? " assistant-start-pattern--thread" : ""}`}>
      <div className="assistant-start-pattern__column">
        <Chat
          title="Billing assistant"
          embedded
          loading={loading}
          greeting="Good morning, Maya"
          intro={loading ? "Reading Stripe and QuickBooks" : INTRO}
          suggestions={SUGGESTIONS}
          placeholder={loading ? undefined : "e.g. Which invoices are over 30 days late?"}
          messages={messages}
          isThinking={thinking}
          onStop={() => setThinking(false)}
          onSend={send}
        />
        {started ? null : (
          <Card
            size="sm"
            flush={!loading}
            title="Connected apps"
            headingLevel={2}
            description="Sources for every answer"
            headerAction={loading ? undefined : { label: "Ask", iconStart: "MessageCircle", appearance: "outline", mode: "neutral", onClick: onAsk }}
            aria-busy={loading || undefined}
          >
            {loading ? (
              <Skeleton layout="list" lines={2} label="Loading connected apps" />
            ) : (
              <ListView
                label="Connected apps"
                size={narrow ? "lg" : "sm"}
                flush
                items={appRows(state, narrow)}
                onAction={(id) => onReconnect?.(id)}
              />
            )}
          </Card>
        )}
      </div>
    </main>
  );
}
