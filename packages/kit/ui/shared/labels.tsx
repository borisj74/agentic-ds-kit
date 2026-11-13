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
  retryFile: (fileName: string) => string;
  removeFile: (fileName: string) => string;
  /** TagInput: the suggestion list. */
  suggestions: string;
  /** DropdownMenu: the search field. */
  searchOptions: string;
  /** Calendar. */
  chooseMonth: string;
  calendarView: string;
  month: string;
  allDay: string;
  /** Chat. */
  conversation: string;
  suggestedPrompts: string;
  send: string;
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
  whatWentWrong: string;
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
  retryFile: (fileName) => `Retry ${fileName}`,
  removeFile: (fileName) => `Remove ${fileName}`,
  suggestions: "Suggestions",
  searchOptions: "Search options",
  chooseMonth: "Choose month",
  calendarView: "Calendar view",
  month: "Month",
  allDay: "All day",
  conversation: "Conversation",
  suggestedPrompts: "Suggested prompts",
  send: "Send",
  code: "Code",
  languageCode: (language) => `${language} code`,
  copied: "Copied",
  copy: "Copy",
  edit: "Edit",
  goodResponse: "Good response",
  badResponse: "Bad response",
  moreActions: "More actions",
  whatWentWrong: "What went wrong?",
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
