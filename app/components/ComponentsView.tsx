"use client";

import { useEffect, useState } from "react";
import { AccordionDoc } from "./AccordionDoc";
import { AlertDialogDoc } from "./AlertDialogDoc";
import { AlertDoc } from "./AlertDoc";
import { AvatarDoc } from "./AvatarDoc";
import { AvatarGroupDoc } from "./AvatarGroupDoc";
import { BadgeDoc } from "./BadgeDoc";
import { BreadcrumbDoc } from "./BreadcrumbDoc";
import { ButtonDoc } from "./ButtonDoc";
import { ButtonGroupDoc } from "./ButtonGroupDoc";
import { CalendarDoc } from "./CalendarDoc";
import { CardDoc } from "./CardDoc";
import { CellDoc } from "./CellDoc";
import { CheckboxDoc } from "./CheckboxDoc";
import { CollapsibleDoc } from "./CollapsibleDoc";
import { CommandDoc } from "./CommandDoc";
import { DataTableDoc } from "./DataTableDoc";
import { DatePickerDoc } from "./DatePickerDoc";
import { ModalCardDoc } from "./ModalCardDoc";
import { ModalDoc } from "./ModalDoc";
import { DrawerDoc } from "./DrawerDoc";
import { DropdownMenuDoc } from "./DropdownMenuDoc";
import { FieldDoc } from "./FieldDoc";
import { HeaderCellDoc } from "./HeaderCellDoc";
import { InputDoc } from "./InputDoc";
import { InputOTPDoc } from "./InputOTPDoc";
import { InsightCardDoc } from "./InsightCardDoc";
import { NavigationMenuDoc } from "./NavigationMenuDoc";
import { SideNavDoc } from "./SideNavDoc";
import { OtherComponent } from "./OtherComponents";
import { PaginationDoc } from "./PaginationDoc";
import { ProgressDoc } from "./ProgressDoc";
import { RadioGroupDoc } from "./RadioGroupDoc";
import { ScoreboardDoc } from "./ScoreboardDoc";
import { SectionDoc } from "./SectionDoc";
import { ScorecardDoc } from "./ScorecardDoc";
import { SelectDoc } from "./SelectDoc";
import { SwitchDoc } from "./SwitchDoc";
import { TabsDoc } from "./TabsDoc";
import { TextareaDoc } from "./TextareaDoc";

function currentHash(): string {
  if (typeof window === "undefined") return "button";
  return window.location.hash.replace(/^#/, "").toLowerCase() || "button";
}

const TITLES: Record<string, string> = {
  button: "Buttons",
  buttongroup: "ButtonGroup",
  calendar: "Calendar",
  card: "Cards",
  cell: "Cell",
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
  datatable: "DataTable",
  datepicker: "DatePicker",
  headercell: "HeaderCell",
  radiogroup: "RadioGroup",
  field: "Field",
  fieldset: "FieldSet",
  badge: "Badge",
  breadcrumb: "Breadcrumb",
  tooltip: "Tooltip",
  tabs: "Tabs",
  modal: "Modal",
  modalcard: "ModalCard",
  navigationmenu: "NavigationMenu",
  sidenav: "SideNav",
  drawer: "Drawer",
  dropdownmenu: "DropdownMenu",
  pageheader: "PageHeader",
  pagination: "Pagination",
  progress: "Progress",
  section: "Section",
  appnav: "AppNav",
  table: "Table",
  accordion: "Accordion",
  alert: "Alert",
  alertdialog: "AlertDialog",
  avatar: "Avatar",
  avatargroup: "AvatarGroup",
};

export function ComponentsView() {
  const [hash, setHash] = useState("button");

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

  const resolved =
    hash === "dialog"
      ? "modal"
      : hash === "fieldset"
        ? "field"
        : hash === "sidebar" || hash === "outsidebar"
          ? "sidenav"
          : hash === "navmenu" || hash === "navigation-menu"
            ? "navigationmenu"
            : hash === "radio" || hash === "radios"
              ? "radiogroup"
              : hash === "tab" || hash === "tablist"
                ? "tabs"
              : hash === "kpi" ||
                  hash === "kpicard" ||
                  hash === "kpicards" ||
                  hash === "kpi-card" ||
                  hash === "kpi-cards"
                ? "scorecard"
                : hash;
  const id = resolved in TITLES ? resolved : "button";
  if (id === "badge") return <BadgeDoc />;
  if (id === "breadcrumb") return <BreadcrumbDoc />;
  if (id === "button") return <ButtonDoc />;
  if (id === "buttongroup") return <ButtonGroupDoc />;
  if (id === "accordion") return <AccordionDoc />;
  if (id === "alert") return <AlertDoc />;
  if (id === "alertdialog") return <AlertDialogDoc />;
  if (id === "avatar") return <AvatarDoc />;
  if (id === "avatargroup") return <AvatarGroupDoc />;
  if (id === "calendar") return <CalendarDoc />;
  if (id === "card") return <CardDoc />;
  if (id === "cell") return <CellDoc />;
  if (id === "checkbox") return <CheckboxDoc />;
  if (id === "collapsible") return <CollapsibleDoc />;
  if (id === "command") return <CommandDoc />;
  if (id === "datatable") return <DataTableDoc />;
  if (id === "datepicker") return <DatePickerDoc />;
  if (id === "modal") return <ModalDoc />;
  if (id === "modalcard") return <ModalCardDoc />;
  if (id === "navigationmenu") return <NavigationMenuDoc />;
  if (id === "sidenav") return <SideNavDoc />;
  if (id === "drawer") return <DrawerDoc />;
  if (id === "dropdownmenu") return <DropdownMenuDoc />;
  if (id === "field") return <FieldDoc />;
  if (id === "headercell") return <HeaderCellDoc />;
  if (id === "input") return <InputDoc />;
  if (id === "inputotp") return <InputOTPDoc />;
  if (id === "insightcard") return <InsightCardDoc />;
  if (id === "pagination") return <PaginationDoc />;
  if (id === "progress") return <ProgressDoc />;
  if (id === "radiogroup") return <RadioGroupDoc />;
  if (id === "scorecard") return <ScorecardDoc />;
  if (id === "scoreboard") return <ScoreboardDoc />;
  if (id === "section") return <SectionDoc />;
  if (id === "select") return <SelectDoc />;
  if (id === "switch") return <SwitchDoc />;
  if (id === "tabs") return <TabsDoc />;
  if (id === "textarea") return <TextareaDoc />;
  return <OtherComponent id={id} title={TITLES[id]} />;
}
