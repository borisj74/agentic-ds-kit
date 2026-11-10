"use client";

import { useLocationHash } from "@/lib/use-location-hash";
import { AccordionDoc } from "./AccordionDoc";
import { AlertDialogDoc } from "./AlertDialogDoc";
import { AnchorNavDoc } from "./AnchorNavDoc";
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
import { CodeSnippetDoc } from "./CodeSnippetDoc";
import { CollapsibleDoc } from "./CollapsibleDoc";
import { ComboboxDoc } from "./ComboboxDoc";
import { ColorPickerDoc } from "./ColorPickerDoc";
import { CommandDoc } from "./CommandDoc";
import { ContextMenuDoc } from "./ContextMenuDoc";
import { ConveyorDoc } from "./ConveyorDoc";
import { DataGridDoc } from "./DataGridDoc";
import { DataTableDoc } from "./DataTableDoc";
import { DatePickerDoc } from "./DatePickerDoc";
import { DateRangePickerDoc } from "./DateRangePickerDoc";
import { DateTimePickerDoc } from "./DateTimePickerDoc";
import { DividerDoc } from "./DividerDoc";
import { DrawerDoc } from "./DrawerDoc";
import { DropdownMenuDoc } from "./DropdownMenuDoc";
import { EmptyDoc } from "./EmptyDoc";
import { FieldDoc } from "./FieldDoc";
import { FieldSetDoc } from "./FieldSetDoc";
import { FileUploadDoc } from "./FileUploadDoc";
import { FilterBarDoc } from "./FilterBarDoc";
import { FilterButtonDoc } from "./FilterButtonDoc";
import { HeaderCellDoc } from "./HeaderCellDoc";
import { HelpPopoverDoc } from "./HelpPopoverDoc";
import { InputDoc } from "./InputDoc";
import { InputOTPDoc } from "./InputOTPDoc";
import { InsightCardDoc } from "./InsightCardDoc";
import { UsageMeterDoc } from "./UsageMeterDoc";
import { TaskBoardDoc } from "./TaskBoardDoc";
import { InvoiceDocumentDoc } from "./InvoiceDocumentDoc";
import { PricingPlansDoc } from "./PricingPlansDoc";
import { IntegrationPickerDoc } from "./IntegrationPickerDoc";
import { CommentsPanelDoc } from "./CommentsPanelDoc";
import { CommentThreadDoc } from "./CommentThreadDoc";
import { SetupGuideDoc } from "./SetupGuideDoc";
import { NotificationStackDoc } from "./NotificationStackDoc";
import { ExperimentCardDoc } from "./ExperimentCardDoc";
import { ChangeSummaryDoc } from "./ChangeSummaryDoc";
import { TraceWaterfallDoc } from "./TraceWaterfallDoc";
import { MemoryPanelDoc } from "./MemoryPanelDoc";
import { InlineDiffDoc } from "./InlineDiffDoc";
import { MessageActionsDoc } from "./MessageActionsDoc";
import { CitedAnswerDoc } from "./CitedAnswerDoc";
import { ContextWindowDoc } from "./ContextWindowDoc";
import { ModelPickerDoc } from "./ModelPickerDoc";
import { AgentSteeringDoc } from "./AgentSteeringDoc";
import { AutonomyDialDoc } from "./AutonomyDialDoc";
import { DecisionCardDoc } from "./DecisionCardDoc";
import { AgentInboxDoc } from "./AgentInboxDoc";
import { AgentLanesDoc } from "./AgentLanesDoc";
import { AgentTreeDoc } from "./AgentTreeDoc";
import { AgentFleetDoc } from "./AgentFleetDoc";
import { AgentPlanDoc } from "./AgentPlanDoc";
import { AgentTrailDoc } from "./AgentTrailDoc";
import { ApprovalCardDoc } from "./ApprovalCardDoc";
import { ToolCallCardDoc } from "./ToolCallCardDoc";
import { RunningNowDoc } from "./RunningNowDoc";
import { PermissionRequestDoc } from "./PermissionRequestDoc";
import { AgentMonitorDoc } from "./AgentMonitorDoc";
import { KbdDoc } from "./KbdDoc";
import { LineChartDoc } from "./LineChartDoc";
import { LinkListDoc } from "./LinkListDoc";
import { ListViewDoc } from "./ListViewDoc";
import { LoadingAnimationDoc } from "./LoadingAnimationDoc";
import { MeterDoc } from "./MeterDoc";
import { CountDoc } from "./CountDoc";
import { CurrencyInputDoc } from "./CurrencyInputDoc";
import { ModalCardDoc } from "./ModalCardDoc";
import { ModalDoc } from "./ModalDoc";
import { MultiSelectDoc } from "./MultiSelectDoc";
import { NavigationMenuDoc } from "./NavigationMenuDoc";
import { NumberInputDoc } from "./NumberInputDoc";
import { NumberTransitionDoc } from "./NumberTransitionDoc";
import { OtherComponent } from "./OtherComponents";
import { PageHeaderDoc } from "./PageHeaderDoc";
import { PaginationDoc } from "./PaginationDoc";
import { PieChartDoc } from "./PieChartDoc";
import { PopoverDoc } from "./PopoverDoc";
import { ProgressDoc } from "./ProgressDoc";
import { ProgressStepsDoc } from "./ProgressStepsDoc";
import { RadioGroupDoc } from "./RadioGroupDoc";
import { ResizableDoc } from "./ResizableDoc";
import { ScoreboardDoc } from "./ScoreboardDoc";
import { SectionDoc } from "./SectionDoc";
import { SegmentedControlDoc } from "./SegmentedControlDoc";
import { ScorecardDoc } from "./ScorecardDoc";
import { SelectDoc } from "./SelectDoc";
import { ShimmerTextDoc } from "./ShimmerTextDoc";
import { SideNavDoc } from "./SideNavDoc";
import { SkeletonDoc } from "./SkeletonDoc";
import { SliderDoc } from "./SliderDoc";
import { SpinnerDoc } from "./SpinnerDoc";
import { SwitchDoc } from "./SwitchDoc";
import { TableDoc } from "./TableDoc";
import { TabsDoc } from "./TabsDoc";
import { TagDoc } from "./TagDoc";
import { TagInputDoc } from "./TagInputDoc";
import { TextareaDoc } from "./TextareaDoc";
import { TimePickerDoc } from "./TimePickerDoc";
import { TileGroupDoc } from "./TileGroupDoc";
import { ThinkingAnimationDoc } from "./ThinkingAnimationDoc";
import { TimelineDoc } from "./TimelineDoc";
import { ToastDoc } from "./ToastDoc";
import { TooltipDoc } from "./TooltipDoc";
import { TreeViewDoc } from "./TreeViewDoc";
import { UsageListDoc } from "./UsageListDoc";
import { ComponentGallery } from "./ComponentGallery";
import playground from "../playground.module.css";

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
  usagemeter: "UsageMeter",
  taskboard: "TaskBoard",
  invoicedocument: "InvoiceDocument",
  pricingplans: "PricingPlans",
  integrationpicker: "IntegrationPicker",
  commentspanel: "CommentsPanel",
  commentthread: "CommentThread",
  setupguide: "SetupGuide",
  notificationstack: "NotificationStack",
  experimentcard: "ExperimentCard",
  changesummary: "ChangeSummary",
  tracewaterfall: "TraceWaterfall",
  memorypanel: "MemoryPanel",
  inlinediff: "InlineDiff",
  messageactions: "MessageActions",
  citedanswer: "CitedAnswer",
  contextwindow: "ContextWindow",
  modelpicker: "ModelPicker",
  agentsteering: "AgentSteering",
  autonomydial: "AutonomyDial",
  decisioncard: "DecisionCard",
  agentinbox: "AgentInbox",
  agentlanes: "AgentLanes",
  agenttree: "AgentTree",
  agentfleet: "AgentFleet",
  agentplan: "AgentPlan",
  agenttrail: "AgentTrail",
  approvalcard: "ApprovalCard",
  toolcallcard: "ToolCallCard",
  runningnow: "RunningNow",
  permissionrequest: "PermissionRequest",
  agentmonitor: "AgentMonitor",
  kbd: "Kbd",
  textarea: "Textarea",
  timepicker: "TimePicker",
  tilegroup: "TileGroup",
  select: "Select",
  switch: "Switch",
  checkbox: "Checkbox",
  codesnippet: "CodeSnippet",
  collapsible: "Collapsible",
  combobox: "Combobox",
  colorpicker: "ColorPicker",
  command: "Command",
  contextmenu: "ContextMenu",
  conveyor: "Conveyor",
  count: "Count",
  currencyinput: "CurrencyInput",
  datagrid: "DataGrid",
  datatable: "DataTable",
  datepicker: "DatePicker",
  daterangepicker: "DateRangePicker",
  datetimepicker: "DateTimePicker",
  divider: "Divider",
  headercell: "HeaderCell",
  helppopover: "HelpPopover",
  radiogroup: "RadioGroup",
  resizable: "Resizable",
  field: "Field",
  fieldset: "FieldSet",
  filterbar: "FilterBar",
  filterbutton: "FilterButton",
  fileupload: "FileUpload",
  badge: "Badge",
  barchart: "Bar",
  breadcrumb: "Breadcrumb",
  tooltip: "Tooltip",
  tabs: "Tabs",
  tag: "Tag",
  taginput: "TagInput",
  modal: "Modal",
  multiselect: "MultiSelect",
  modalcard: "ModalCard",
  navigationmenu: "NavigationMenu",
  sidenav: "SideNav",
  drawer: "Drawer",
  dropdownmenu: "DropdownMenu",
  empty: "Empty",
  pageheader: "PageHeader",
  pagination: "Pagination",
  piechart: "Pie",
  popover: "Popover",
  linechart: "Line",
  linklist: "LinkList",
  listview: "ListView",
  loadinganimation: "LoadingAnimation",
  meter: "Meter",
  numberinput: "NumberInput",
  numbertransition: "NumberTransition",
  shimmertext: "ShimmerText",
  skeleton: "Skeleton",
  slider: "Slider",
  spinner: "Spinner",
  thinkinganimation: "ThinkingAnimation",
  timeline: "Timeline",
  toast: "Toast",
  treeview: "TreeView",
  usagelist: "UsageList",
  progress: "Progress",
  progresssteps: "ProgressSteps",
  section: "Section",
  segmentedcontrol: "SegmentedControl",
  table: "Table",
  accordion: "Accordion",
  anchornav: "AnchorNav",
  alert: "Alert",
  alertdialog: "AlertDialog",
  appheader: "AppHeader",
  appnav: "AppNav",
  avatar: "Avatar",
  avatargroup: "AvatarGroup",
};

export function componentSlugFromHash(hash: string): string | null {
  const id = resolveHash(hash.toLowerCase());
  if (id === "gallery" || !(id in TITLES)) return null;
  return id;
}

export function ComponentDoc({ slug }: { slug: string }) {
  return <ComponentView hash={resolveHash(slug.toLowerCase())} />;
}

function resolveHash(hash: string): string {
  const aliases: Record<string, string> = {
    dialog: "modal",
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
    tags: "tag",
    chip: "tag",
    chips: "tag",
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
    "usage-list": "usagelist",
    usage: "usagelist",
    "filter-button": "filterbutton",
    filterchip: "filterbutton",
    "file-upload": "fileupload",
    upload: "fileupload",
    dropzone: "fileupload",
    "color-picker": "colorpicker",
    "colour-picker": "colorpicker",
    colourpicker: "colorpicker",
    "link-list": "linklist",
    quicklinks: "linklist",
    shortcut: "kbd",
    shortcuts: "kbd",
    kbd: "kbd",
    segmented: "segmentedcontrol",
    "segmented-control": "segmentedcontrol",
    tiles: "tilegroup",
    "tile-group": "tilegroup",
    plans: "tilegroup",
    placeholder: "skeleton",
    gauge: "meter",
    countbadge: "count",
    separator: "divider",
    hr: "divider",
    "code-snippet": "codesnippet",
    codeblock: "codesnippet",
  };
  return aliases[hash] ?? hash;
}

export function ComponentsView() {
  const locationHash = useLocationHash();
  // Until the hash is read the view would show the gallery: hide it, don't swap.
  return (
    <div className={locationHash === null ? playground.pending : undefined}>
      <ComponentView hash={locationHash?.toLowerCase() || "gallery"} />
    </div>
  );
}

function ComponentView({ hash }: { hash: string }) {
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
  if (resolved === "anchornav") return <AnchorNavDoc />;
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
  if (resolved === "codesnippet") return <CodeSnippetDoc />;
  if (resolved === "collapsible") return <CollapsibleDoc />;
  if (resolved === "combobox") return <ComboboxDoc />;
  if (resolved === "colorpicker") return <ColorPickerDoc />;
  if (resolved === "command") return <CommandDoc />;
  if (resolved === "contextmenu") return <ContextMenuDoc />;
  if (resolved === "conveyor") return <ConveyorDoc />;
  if (resolved === "count") return <CountDoc />;
  if (resolved === "currencyinput") return <CurrencyInputDoc />;
  if (resolved === "datagrid") return <DataGridDoc />;
  if (resolved === "datatable") return <DataTableDoc />;
  if (resolved === "datepicker") return <DatePickerDoc />;
  if (resolved === "daterangepicker") return <DateRangePickerDoc />;
  if (resolved === "datetimepicker") return <DateTimePickerDoc />;
  if (resolved === "divider") return <DividerDoc />;
  if (resolved === "modal") return <ModalDoc />;
  if (resolved === "multiselect") return <MultiSelectDoc />;
  if (resolved === "modalcard") return <ModalCardDoc />;
  if (resolved === "navigationmenu") return <NavigationMenuDoc />;
  if (resolved === "sidenav") return <SideNavDoc />;
  if (resolved === "drawer") return <DrawerDoc />;
  if (resolved === "dropdownmenu") return <DropdownMenuDoc />;
  if (resolved === "empty") return <EmptyDoc />;
  if (resolved === "field") return <FieldDoc />;
  if (resolved === "fieldset") return <FieldSetDoc />;
  if (resolved === "filterbar") return <FilterBarDoc />;
  if (resolved === "filterbutton") return <FilterButtonDoc />;
  if (resolved === "fileupload") return <FileUploadDoc />;
  if (resolved === "headercell") return <HeaderCellDoc />;
  if (resolved === "helppopover") return <HelpPopoverDoc />;
  if (resolved === "input") return <InputDoc />;
  if (resolved === "inputotp") return <InputOTPDoc />;
  if (resolved === "insightcard") return <InsightCardDoc />;
  if (resolved === "usagemeter") return <UsageMeterDoc />;
  if (resolved === "taskboard") return <TaskBoardDoc />;
  if (resolved === "invoicedocument") return <InvoiceDocumentDoc />;
  if (resolved === "pricingplans") return <PricingPlansDoc />;
  if (resolved === "integrationpicker") return <IntegrationPickerDoc />;
  if (resolved === "commentspanel") return <CommentsPanelDoc />;
  if (resolved === "commentthread") return <CommentThreadDoc />;
  if (resolved === "setupguide") return <SetupGuideDoc />;
  if (resolved === "notificationstack") return <NotificationStackDoc />;
  if (resolved === "experimentcard") return <ExperimentCardDoc />;
  if (resolved === "changesummary") return <ChangeSummaryDoc />;
  if (resolved === "tracewaterfall") return <TraceWaterfallDoc />;
  if (resolved === "memorypanel") return <MemoryPanelDoc />;
  if (resolved === "inlinediff") return <InlineDiffDoc />;
  if (resolved === "messageactions") return <MessageActionsDoc />;
  if (resolved === "citedanswer") return <CitedAnswerDoc />;
  if (resolved === "contextwindow") return <ContextWindowDoc />;
  if (resolved === "modelpicker") return <ModelPickerDoc />;
  if (resolved === "agentsteering") return <AgentSteeringDoc />;
  if (resolved === "autonomydial") return <AutonomyDialDoc />;
  if (resolved === "decisioncard") return <DecisionCardDoc />;
  if (resolved === "agentinbox") return <AgentInboxDoc />;
  if (resolved === "agentlanes") return <AgentLanesDoc />;
  if (resolved === "agenttree") return <AgentTreeDoc />;
  if (resolved === "agentfleet") return <AgentFleetDoc />;
  if (resolved === "agentplan") return <AgentPlanDoc />;
  if (resolved === "agenttrail") return <AgentTrailDoc />;
  if (resolved === "approvalcard") return <ApprovalCardDoc />;
  if (resolved === "toolcallcard") return <ToolCallCardDoc />;
  if (resolved === "runningnow") return <RunningNowDoc />;
  if (resolved === "permissionrequest") return <PermissionRequestDoc />;
  if (resolved === "agentmonitor") return <AgentMonitorDoc />;
  if (resolved === "kbd") return <KbdDoc />;
  if (resolved === "linechart") return <LineChartDoc />;
  if (resolved === "linklist") return <LinkListDoc />;
  if (resolved === "listview") return <ListViewDoc />;
  if (resolved === "loadinganimation") return <LoadingAnimationDoc />;
  if (resolved === "meter") return <MeterDoc />;
  if (resolved === "numberinput") return <NumberInputDoc />;
  if (resolved === "numbertransition") return <NumberTransitionDoc />;
  if (resolved === "pageheader") return <PageHeaderDoc />;
  if (resolved === "pagination") return <PaginationDoc />;
  if (resolved === "piechart") return <PieChartDoc />;
  if (resolved === "popover") return <PopoverDoc />;
  if (resolved === "progress") return <ProgressDoc />;
  if (resolved === "progresssteps") return <ProgressStepsDoc />;
  if (resolved === "radiogroup") return <RadioGroupDoc />;
  if (resolved === "resizable") return <ResizableDoc />;
  if (resolved === "scorecard") return <ScorecardDoc />;
  if (resolved === "scoreboard") return <ScoreboardDoc />;
  if (resolved === "section") return <SectionDoc />;
  if (resolved === "segmentedcontrol") return <SegmentedControlDoc />;
  if (resolved === "select") return <SelectDoc />;
  if (resolved === "shimmertext") return <ShimmerTextDoc />;
  if (resolved === "skeleton") return <SkeletonDoc />;
  if (resolved === "slider") return <SliderDoc />;
  if (resolved === "spinner") return <SpinnerDoc />;
  if (resolved === "switch") return <SwitchDoc />;
  if (resolved === "table") return <TableDoc />;
  if (resolved === "tabs") return <TabsDoc />;
  if (resolved === "tag") return <TagDoc />;
  if (resolved === "taginput") return <TagInputDoc />;
  if (resolved === "textarea") return <TextareaDoc />;
  if (resolved === "timepicker") return <TimePickerDoc />;
  if (resolved === "tilegroup") return <TileGroupDoc />;
  if (resolved === "thinkinganimation") return <ThinkingAnimationDoc />;
  if (resolved === "timeline") return <TimelineDoc />;
  if (resolved === "toast") return <ToastDoc />;
  if (resolved === "tooltip") return <TooltipDoc />;
  if (resolved === "treeview") return <TreeViewDoc />;
  if (resolved === "usagelist") return <UsageListDoc />;
  return <OtherComponent id={resolved} title={TITLES[resolved]} />;
}
