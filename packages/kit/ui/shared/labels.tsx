"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * Screen-reader labels the kit writes itself (close buttons, pager arrows, picker panels…).
 * English by default. Wrap the app (or one subtree) in KitLabelsProvider to translate or reword
 * them; any key you leave out keeps its English default. A component's own `ariaLabel` /
 * `aria-label` prop, where it has one, still wins over these.
 */
export interface KitLabels {
  /** Drawer, ModalCard: the X button. */
  close: string;
  /** Modal: the click-away scrim. */
  closeDialog: string;
  /** Toast: the X button. */
  dismiss: string;
  /** AlertDialog: the group around Cancel / action. */
  dialogActions: string;
  /** Pagination (full): arrow buttons, visible text or icon-only. */
  previous: string;
  next: string;
  /** Pagination (compact, or icon-only): arrow buttons. */
  previousPage: string;
  nextPage: string;
  /** Pagination compact: the visible status, e.g. "2 of 10". */
  pageOf: (page: number, count: number) => string;
  /** Pagination compact: the spoken status, e.g. "Page 2 of 10". */
  pageStatus: (page: number, count: number) => string;
  /** DatePicker, DateRangePicker, DateTimePicker: month arrows. */
  previousMonth: string;
  nextMonth: string;
  /** DatePicker / DateRangePicker / DateTimePicker panels. */
  chooseDate: string;
  chooseDates: string;
  chooseDateAndTime: string;
  /** DateRangePicker: the preset buttons group. */
  presets: string;
  /** DateRangePicker footer: the typed start and end fields, and the word between them. */
  startDate: string;
  endDate: string;
  rangeTo: string;
  /** DateTimePicker: the time field. */
  time: string;
  /** TimePicker segments. */
  hour: string;
  minute: string;
  period: (current: string) => string;
  /** Carousel. */
  previousSlide: string;
  nextSlide: string;
  slide: (index: number, count: number) => string;
  /** NumberInput steppers. */
  decreaseValue: string;
  increaseValue: string;
  /** Tag, Badge: the remove button. */
  remove: (name: string) => string;
  /** FileUpload. */
  files: string;
  uploading: (fileName: string) => string;
  retry: string;
  /** LoadError (and every kit piece that shows one): the retry Button. */
  tryAgain: string;
  retryFile: (fileName: string) => string;
  removeFile: (fileName: string) => string;
  /** TagInput: the suggestion list. */
  suggestions: string;
  /** TagInput: a typed tag that is already in the list. */
  tagExists: (tag: string) => string;
  /** TagInput: maxTags is reached. */
  tagLimit: (max: number) => string;
  /** TagInput: count for screen readers when maxTags is set. */
  tagCount: (count: number, max: number) => string;
  /** TagInput: first Backspace on an empty query highlights the last tag. */
  removeTagHint: (tag: string) => string;
  /** DropdownMenu: the search field. */
  searchOptions: string;
  /** Command: the key footer ("↑↓ Navigate", "↵ Open"; Esc uses `close`). */
  navigate: string;
  openItem: string;
  /** Command: the live result count read after each search, e.g. "3 results". */
  resultCount: (count: number) => string;
  /** Command: the Spinner while `loading`. */
  loadingResults: string;
  /** Command onAsk row: label, hint with no query, and hint with a query. */
  ask: string;
  askHint: string;
  askAbout: (query: string) => string;
  /** Calendar. */
  chooseMonth: string;
  calendarView: string;
  month: string;
  allDay: string;
  /** Chat. */
  conversation: string;
  suggestedPrompts: string;
  send: string;
  /** Chat: the composer description when a context chip is set. */
  chatContext: (label: string) => string;
  /** Chat: the suggestion and recent headings in the empty state. */
  chatSuggested: string;
  chatRecent: string;
  /** Chat: Stop while thinking, and the composer placeholder meanwhile. */
  chatStop: string;
  chatWorking: string;
  /** Chat: the collapsed step row on an answer, like "3 steps · 2.4s". */
  chatSteps: (count: number, duration?: string) => string;
  /** Chat: the error's secondary action. */
  chatCopyDetails: string;
  /** CodeSnippet: the code region with no title or language, or "<language> code". */
  code: string;
  languageCode: (language: string) => string;
  /** CodeSnippet copy button after copying (before, it uses `copy`). */
  copied: string;
  /** MessageActions and CodeSnippet (MessageActions retry uses `retry`). */
  copy: string;
  edit: string;
  goodResponse: string;
  badResponse: string;
  moreActions: string;
  /** Tabs overflow="more": the trigger that holds the tabs that don't fit. */
  moreTabs: string;
  whatWentWrong: string;
  /** Alert: the tone word in the header, e.g. "Warning · Billing". */
  info: string;
  success: string;
  warning: string;
  danger: string;
  /** Avatar presence: the word added to the avatar name, e.g. "Ana Ruiz, Online". */
  online: string;
  away: string;
  offline: string;
  /** AvatarGroup: the +N leftover count, e.g. "3 more". */
  moreAvatars: (count: number) => string;
  /** MultiSelect: what the +N overflow Count counts, read as "2 more selected". */
  moreSelected: string;
  /** Delta goodWhen: the word before a judged change, e.g. "Better · +6.3 pts". */
  better: string;
  worse: string;
  /** insight-stack pattern: the toggle under each finding that shows its evidence. */
  why: string;
  /** insight-stack pattern: the word beside the confidence value, and the confidence Meter's name. */
  confidence: string;
  /** app-shell pattern: the skip link, first in the tab order, that jumps to the page's main content. */
  skipToMain: string;
}

export const DEFAULT_KIT_LABELS: KitLabels = {
  close: "Close",
  closeDialog: "Close dialog",
  dismiss: "Dismiss",
  dialogActions: "Dialog actions",
  previous: "Previous",
  next: "Next",
  previousPage: "Previous page",
  nextPage: "Next page",
  pageOf: (page, count) => `${page} of ${count}`,
  pageStatus: (page, count) => `Page ${page} of ${count}`,
  previousMonth: "Previous month",
  nextMonth: "Next month",
  chooseDate: "Choose date",
  chooseDates: "Choose dates",
  chooseDateAndTime: "Choose date and time",
  presets: "Presets",
  startDate: "Start date",
  endDate: "End date",
  rangeTo: "to",
  time: "Time",
  hour: "Hour",
  minute: "Minute",
  period: (current) => `Period, ${current}`,
  previousSlide: "Previous slide",
  nextSlide: "Next slide",
  slide: (index, count) => `Slide ${index} of ${count}`,
  decreaseValue: "Decrease value",
  increaseValue: "Increase value",
  remove: (name) => `Remove ${name}`,
  files: "Files",
  uploading: (fileName) => `Uploading ${fileName}`,
  retry: "Retry",
  tryAgain: "Try again",
  retryFile: (fileName) => `Retry ${fileName}`,
  removeFile: (fileName) => `Remove ${fileName}`,
  suggestions: "Suggestions",
  tagExists: (tag) => `${tag} is already added`,
  tagLimit: (max) => `Up to ${max} tags. Remove one to add another`,
  tagCount: (count, max) => `${count} of ${max} tags`,
  removeTagHint: (tag) => `Press Backspace to remove ${tag}`,
  searchOptions: "Search options",
  navigate: "Navigate",
  openItem: "Open",
  resultCount: (count) => (count === 1 ? "1 result" : `${count} results`),
  loadingResults: "Loading results",
  ask: "Ask Chat",
  askHint: "Ask about your workspace",
  askAbout: (query) => `Ask about “${query}”`,
  chooseMonth: "Choose month",
  calendarView: "Calendar view",
  month: "Month",
  allDay: "All day",
  conversation: "Conversation",
  suggestedPrompts: "Suggested prompts",
  send: "Send",
  chatContext: (label) => `Asking about ${label}`,
  chatSuggested: "Suggested",
  chatRecent: "Recent",
  chatStop: "Stop",
  chatWorking: "Working…",
  chatSteps: (count, duration) => `${count} ${count === 1 ? "step" : "steps"}${duration ? ` · ${duration}` : ""}`,
  chatCopyDetails: "Copy details",
  code: "Code",
  languageCode: (language) => `${language} code`,
  copied: "Copied",
  copy: "Copy",
  edit: "Edit",
  goodResponse: "Good response",
  badResponse: "Bad response",
  moreActions: "More actions",
  moreTabs: "More",
  whatWentWrong: "What went wrong?",
  info: "Info",
  success: "Success",
  warning: "Warning",
  danger: "Error",
  online: "Online",
  away: "Away",
  offline: "Offline",
  moreAvatars: (count) => `${count} more`,
  moreSelected: "more selected",
  better: "Better",
  worse: "Worse",
  why: "Why?",
  confidence: "Confidence",
  skipToMain: "Skip to main content",
};

const KitLabelsContext = createContext<KitLabels>(DEFAULT_KIT_LABELS);

export interface KitLabelsProviderProps {
  /** Only the keys you want to change; the rest stay English (or the outer provider's). */
  labels: Partial<KitLabels>;
  children: ReactNode;
}

export function KitLabelsProvider({ labels, children }: KitLabelsProviderProps) {
  const outer = useContext(KitLabelsContext);
  const value = useMemo(() => ({ ...outer, ...labels }), [outer, labels]);
  return <KitLabelsContext.Provider value={value}>{children}</KitLabelsContext.Provider>;
}

/** The labels in effect here: English defaults merged with every KitLabelsProvider above. */
export function useKitLabels(): KitLabels {
  return useContext(KitLabelsContext);
}
