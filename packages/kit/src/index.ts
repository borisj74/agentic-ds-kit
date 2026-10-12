/** Public kit API. Import components, AppShellPattern and SignInPattern from `agentic-ds-kit`. */

import "./tokens";
import "./layout";

export * from "../ui/Accordion";
export * from "../ui/Alert";
export * from "../ui/AlertDialog";
export * from "../ui/AppHeader";
export * from "../ui/AppNav";
export * from "../ui/Avatar";
export * from "../ui/AvatarGroup";
export * from "../ui/Badge";
export * from "../ui/BarChart";
export * from "../ui/Breadcrumb";
export * from "../ui/Button";
export * from "../ui/ButtonGroup";
export * from "../ui/Calendar";
export * from "../ui/Card";
export * from "../ui/Carousel";
export * from "../ui/Conveyor";
export * from "../ui/Count";
export * from "../ui/Cell";
export * from "../ui/Chat";
export * from "../ui/Checkbox";
export * from "../ui/CodeSnippet";
export * from "../ui/Collapsible";
export * from "../ui/ColorPicker";
export * from "../ui/Command";
export * from "../ui/DataGrid";
export * from "../ui/DataTable";
export * from "../ui/DatePicker";
export * from "../ui/Divider";
export * from "../ui/Drawer";
export * from "../ui/DropdownMenu";
export * from "../ui/Empty";
export * from "../ui/Field";
export * from "../ui/FieldSet";
export * from "../ui/FileUpload";
export * from "../ui/FilterButton";
export * from "../ui/HeaderCell";
export * from "../ui/HelpPopover";
export * from "../ui/Input";
export * from "../ui/InputOTP";
export * from "../ui/InsightCard";
export * from "../ui/LineChart";
export * from "../ui/LinkList";
export * from "../ui/ListView";
export * from "../ui/LoadingAnimation";
export * from "../ui/Meter";
export * from "../ui/Modal";
export * from "../ui/ModalCard";
export * from "../ui/NavigationMenu";
export * from "../ui/NumberTransition";
export * from "../ui/PageHeader";
export * from "../ui/Pagination";
export * from "../ui/PieChart";
export * from "../ui/Progress";
export * from "../ui/ProgressSteps";
export * from "../ui/RadioGroup";
export * from "../ui/Scoreboard";
export * from "../ui/Scorecard";
export * from "../ui/Section";
export * from "../ui/Select";
export * from "../ui/ShimmerText";
export * from "../ui/SideNav";
export * from "../ui/Skeleton";
export * from "../ui/Slider";
export * from "../ui/Spinner";
export * from "../ui/Switch";
export * from "../ui/Table";
export * from "../ui/Tabs";
export * from "../ui/Tag";
export * from "../ui/Textarea";
export * from "../ui/ThinkingAnimation";
export * from "../ui/Timeline";
export * from "../ui/Toast";
export * from "../ui/Tooltip";
export * from "../ui/TreeView";
export * from "../ui/UsageList";

/** Chart data shapes, public so copied patterns (`agentic-ds-kit add`) can type their data. */
export type { ChartDatum, ChartSeries } from "../ui/shared/chartMath";

/**
 * Chrome patterns stay imports. Content patterns (dashboard, inbox, …) are copy-in only:
 * `npx agentic-ds-kit add <id>` (source in patterns/, not in dist).
 */
export * from "../ui/patterns/AppShellPattern";
export * from "../ui/patterns/SignInPattern";

