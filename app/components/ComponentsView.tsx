"use client";

import { useEffect, useState } from "react";
import { AccordionDoc } from "./AccordionDoc";
import { AlertDialogDoc } from "./AlertDialogDoc";
import { AlertDoc } from "./AlertDoc";
import { AppHeaderDoc } from "./AppHeaderDoc";
import { AppNavDoc } from "./AppNavDoc";
import { AvatarDoc } from "./AvatarDoc";
import { AvatarGroupDoc } from "./AvatarGroupDoc";
import { BadgeDoc } from "./BadgeDoc";
import { BarChartDoc } from "./BarChartDoc";
import { BreadcrumbDoc } from "./BreadcrumbDoc";
import { ButtonDoc } from "./ButtonDoc";
import { ButtonGroupDoc } from "./ButtonGroupDoc";
import { CalendarDoc } from "./CalendarDoc";
import { CardDoc } from "./CardDoc";
import { CarouselDoc } from "./CarouselDoc";
import { CellDoc } from "./CellDoc";
import { ChatDoc } from "./ChatDoc";
import { CheckboxDoc } from "./CheckboxDoc";
import { CollapsibleDoc } from "./CollapsibleDoc";
import { CommandDoc } from "./CommandDoc";
import { ConveyorDoc } from "./ConveyorDoc";
import { DataGridDoc } from "./DataGridDoc";
import { DataTableDoc } from "./DataTableDoc";
import { DatePickerDoc } from "./DatePickerDoc";
import { DrawerDoc } from "./DrawerDoc";
import { DropdownMenuDoc } from "./DropdownMenuDoc";
import { EmptyDoc } from "./EmptyDoc";
import { FieldDoc } from "./FieldDoc";
import { HeaderCellDoc } from "./HeaderCellDoc";
import { HelpPopoverDoc } from "./HelpPopoverDoc";
import { InputDoc } from "./InputDoc";
import { InputOTPDoc } from "./InputOTPDoc";
import { InsightCardDoc } from "./InsightCardDoc";
import { LineChartDoc } from "./LineChartDoc";
import { ListViewDoc } from "./ListViewDoc";
import { LoadingAnimationDoc } from "./LoadingAnimationDoc";
import { ModalCardDoc } from "./ModalCardDoc";
import { ModalDoc } from "./ModalDoc";
import { NavigationMenuDoc } from "./NavigationMenuDoc";
import { NumberTransitionDoc } from "./NumberTransitionDoc";
import { OtherComponent } from "./OtherComponents";
import { PageHeaderDoc } from "./PageHeaderDoc";
import { PaginationDoc } from "./PaginationDoc";
import { PieChartDoc } from "./PieChartDoc";
import { ProgressDoc } from "./ProgressDoc";
import { ProgressStepsDoc } from "./ProgressStepsDoc";
import { RadioGroupDoc } from "./RadioGroupDoc";
import { ScoreboardDoc } from "./ScoreboardDoc";
import { SectionDoc } from "./SectionDoc";
import { ScorecardDoc } from "./ScorecardDoc";
import { SelectDoc } from "./SelectDoc";
import { ShimmerTextDoc } from "./ShimmerTextDoc";
import { SideNavDoc } from "./SideNavDoc";
import { SliderDoc } from "./SliderDoc";
import { SpinnerDoc } from "./SpinnerDoc";
import { SwitchDoc } from "./SwitchDoc";
import { TableDoc } from "./TableDoc";
import { TabsDoc } from "./TabsDoc";
import { TextareaDoc } from "./TextareaDoc";
import { ThinkingAnimationDoc } from "./ThinkingAnimationDoc";
import { TimelineDoc } from "./TimelineDoc";
import { ToastDoc } from "./ToastDoc";
import { TooltipDoc } from "./TooltipDoc";
import { TreeViewDoc } from "./TreeViewDoc";
import { ComponentGallery } from "./ComponentGallery";

function currentHash(): string {
  if (typeof window === "undefined") return "gallery";
  return window.location.hash.replace(/^#/, "").toLowerCase() || "gallery";
}

const TITLES: Record<string, string> = {
  button: "Buttons",
  buttongroup: "ButtonGroup",
  calendar: "Calendar",
  card: "Cards",
  carousel: "Carousel",
  cell: "Cell",
  chat: "Chat",
  scorecard: "Scorecard",
  scoreboard: "Scoreboard",
  input: "Input",
  inputotp: "InputOTP",
  insightcard: "InsightCard",
  textarea: "Textarea",
  select: "Select",
  switch: "Switch",
  checkbox: "Checkbox",
  collapsible: "Collapsible",
  command: "Command",
  conveyor: "Conveyor",
  datagrid: "DataGrid",
  datatable: "DataTable",
  datepicker: "DatePicker",
  headercell: "HeaderCell",
  helppopover: "HelpPopover",
  radiogroup: "RadioGroup",
  field: "Field",
  fieldset: "FieldSet",
  badge: "Badge",
  barchart: "Bar",
  breadcrumb: "Breadcrumb",
  tooltip: "Tooltip",
  tabs: "Tabs",
  modal: "Modal",
  modalcard: "ModalCard",
  navigationmenu: "NavigationMenu",
  sidenav: "SideNav",
  drawer: "Drawer",
  dropdownmenu: "DropdownMenu",
  empty: "Empty",
  pageheader: "PageHeader",
  pagination: "Pagination",
  piechart: "Pie",
  linechart: "Line",
  listview: "ListView",
  loadinganimation: "LoadingAnimation",
  numbertransition: "NumberTransition",
  shimmertext: "ShimmerText",
  slider: "Slider",
  spinner: "Spinner",
  thinkinganimation: "ThinkingAnimation",
  timeline: "Timeline",
  toast: "Toast",
  treeview: "TreeView",
  progress: "Progress",
  progresssteps: "ProgressSteps",
  section: "Section",
  table: "Table",
  accordion: "Accordion",
  alert: "Alert",
  alertdialog: "AlertDialog",
  appheader: "AppHeader",
  appnav: "AppNav",
  avatar: "Avatar",
  avatargroup: "AvatarGroup",
};

function resolveHash(hash: string): string {
  const aliases: Record<string, string> = {
    dialog: "modal",
    fieldset: "field",
    sidebar: "sidenav",
    outsidebar: "sidenav",
    navmenu: "navigationmenu",
    "navigation-menu": "navigationmenu",
    chart: "barchart",
    charts: "barchart",
    pie: "piechart",
    "pie-chart": "piechart",
    bar: "barchart",
    "bar-chart": "barchart",
    line: "linechart",
    "line-chart": "linechart",
    "list-view": "listview",
    "data-grid": "datagrid",
    thinking: "thinkinganimation",
    "thinking-animation": "thinkinganimation",
    shimmer: "shimmertext",
    "shimmer-text": "shimmertext",
    loading: "loadinganimation",
    "loading-animation": "loadinganimation",
    spin: "spinner",
    stepper: "progresssteps",
    steps: "progresssteps",
    "progress-steps": "progresssteps",
    progressstep: "progresssteps",
    topbar: "appheader",
    "app-header": "appheader",
    masthead: "appheader",
    appbar: "appheader",
    "number-transition": "numbertransition",
    radio: "radiogroup",
    radios: "radiogroup",
    tab: "tabs",
    tablist: "tabs",
    kpi: "scorecard",
    kpicard: "scorecard",
    kpicards: "scorecard",
    "kpi-card": "scorecard",
    "kpi-cards": "scorecard",
    carousels: "carousel",
    conveyors: "conveyor",
    tree: "treeview",
    "tree-view": "treeview",
    "help-popover": "helppopover",
    help: "helppopover",
  };
  return aliases[hash] ?? hash;
}

export function ComponentsView() {
  const [hash, setHash] = useState("gallery");

  useEffect(() => {
    const sync = () => setHash(currentHash());
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const id = resolveHash(hash);
  if (id === "gallery") return <ComponentGallery />;
  const resolved = id in TITLES ? id : "gallery";
  if (resolved === "gallery") return <ComponentGallery />;

  if (resolved === "badge") return <BadgeDoc />;
  if (resolved === "barchart") return <BarChartDoc />;
  if (resolved === "breadcrumb") return <BreadcrumbDoc />;
  if (resolved === "button") return <ButtonDoc />;
  if (resolved === "buttongroup") return <ButtonGroupDoc />;
  if (resolved === "accordion") return <AccordionDoc />;
  if (resolved === "alert") return <AlertDoc />;
  if (resolved === "alertdialog") return <AlertDialogDoc />;
  if (resolved === "appheader") return <AppHeaderDoc />;
  if (resolved === "appnav") return <AppNavDoc />;
  if (resolved === "avatar") return <AvatarDoc />;
  if (resolved === "avatargroup") return <AvatarGroupDoc />;
  if (resolved === "calendar") return <CalendarDoc />;
  if (resolved === "card") return <CardDoc />;
  if (resolved === "carousel") return <CarouselDoc />;
  if (resolved === "cell") return <CellDoc />;
  if (resolved === "chat") return <ChatDoc />;
  if (resolved === "checkbox") return <CheckboxDoc />;
  if (resolved === "collapsible") return <CollapsibleDoc />;
  if (resolved === "command") return <CommandDoc />;
  if (resolved === "conveyor") return <ConveyorDoc />;
  if (resolved === "datagrid") return <DataGridDoc />;
  if (resolved === "datatable") return <DataTableDoc />;
  if (resolved === "datepicker") return <DatePickerDoc />;
  if (resolved === "modal") return <ModalDoc />;
  if (resolved === "modalcard") return <ModalCardDoc />;
  if (resolved === "navigationmenu") return <NavigationMenuDoc />;
  if (resolved === "sidenav") return <SideNavDoc />;
  if (resolved === "drawer") return <DrawerDoc />;
  if (resolved === "dropdownmenu") return <DropdownMenuDoc />;
  if (resolved === "empty") return <EmptyDoc />;
  if (resolved === "field") return <FieldDoc />;
  if (resolved === "headercell") return <HeaderCellDoc />;
  if (resolved === "helppopover") return <HelpPopoverDoc />;
  if (resolved === "input") return <InputDoc />;
  if (resolved === "inputotp") return <InputOTPDoc />;
  if (resolved === "insightcard") return <InsightCardDoc />;
  if (resolved === "linechart") return <LineChartDoc />;
  if (resolved === "listview") return <ListViewDoc />;
  if (resolved === "loadinganimation") return <LoadingAnimationDoc />;
  if (resolved === "numbertransition") return <NumberTransitionDoc />;
  if (resolved === "pageheader") return <PageHeaderDoc />;
  if (resolved === "pagination") return <PaginationDoc />;
  if (resolved === "piechart") return <PieChartDoc />;
  if (resolved === "progress") return <ProgressDoc />;
  if (resolved === "progresssteps") return <ProgressStepsDoc />;
  if (resolved === "radiogroup") return <RadioGroupDoc />;
  if (resolved === "scorecard") return <ScorecardDoc />;
  if (resolved === "scoreboard") return <ScoreboardDoc />;
  if (resolved === "section") return <SectionDoc />;
  if (resolved === "select") return <SelectDoc />;
  if (resolved === "shimmertext") return <ShimmerTextDoc />;
  if (resolved === "slider") return <SliderDoc />;
  if (resolved === "spinner") return <SpinnerDoc />;
  if (resolved === "switch") return <SwitchDoc />;
  if (resolved === "table") return <TableDoc />;
  if (resolved === "tabs") return <TabsDoc />;
  if (resolved === "textarea") return <TextareaDoc />;
  if (resolved === "thinkinganimation") return <ThinkingAnimationDoc />;
  if (resolved === "timeline") return <TimelineDoc />;
  if (resolved === "toast") return <ToastDoc />;
  if (resolved === "tooltip") return <TooltipDoc />;
  if (resolved === "treeview") return <TreeViewDoc />;
  return <OtherComponent id={resolved} title={TITLES[resolved]} />;
}
