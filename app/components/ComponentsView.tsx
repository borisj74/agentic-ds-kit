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
import { DialogDoc } from "./DialogDoc";
import { DrawerDoc } from "./DrawerDoc";
import { HeaderCellDoc } from "./HeaderCellDoc";
import { InputDoc } from "./InputDoc";
import { InsightCardDoc } from "./InsightCardDoc";
import { OtherComponent } from "./OtherComponents";

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
  insightcard: "InsightCard",
  textarea: "Textarea",
  select: "Select",
  checkbox: "Checkbox",
  collapsible: "Collapsible",
  command: "Command",
  datatable: "DataTable",
  datepicker: "DatePicker",
  headercell: "HeaderCell",
  radiogroup: "RadioGroup",
  field: "Field",
  badge: "Badge",
  breadcrumb: "Breadcrumb",
  tooltip: "Tooltip",
  tabs: "Tabs",
  dialog: "Dialog",
  drawer: "Drawer",
  pageheader: "PageHeader",
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

  const resolved = hash === "modal" ? "dialog" : hash;
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
  if (id === "dialog") return <DialogDoc />;
  if (id === "drawer") return <DrawerDoc />;
  if (id === "headercell") return <HeaderCellDoc />;
  if (id === "input") return <InputDoc />;
  if (id === "insightcard") return <InsightCardDoc />;
  return <OtherComponent id={id} title={TITLES[id]} />;
}
