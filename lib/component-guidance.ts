// Derived from packages/kit/contracts/*.json. Do not hand-edit the map.
import contract_accordion from "../packages/kit/contracts/accordion.json";
import contract_alert from "../packages/kit/contracts/alert.json";
import contract_alertdialog from "../packages/kit/contracts/alertdialog.json";
import contract_appheader from "../packages/kit/contracts/appheader.json";
import contract_appnav from "../packages/kit/contracts/appnav.json";
import contract_avatar from "../packages/kit/contracts/avatar.json";
import contract_avatargroup from "../packages/kit/contracts/avatargroup.json";
import contract_badge from "../packages/kit/contracts/badge.json";
import contract_barchart from "../packages/kit/contracts/barchart.json";
import contract_breadcrumb from "../packages/kit/contracts/breadcrumb.json";
import contract_button from "../packages/kit/contracts/button.json";
import contract_buttongroup from "../packages/kit/contracts/buttongroup.json";
import contract_calendar from "../packages/kit/contracts/calendar.json";
import contract_card from "../packages/kit/contracts/card.json";
import contract_carousel from "../packages/kit/contracts/carousel.json";
import contract_cell from "../packages/kit/contracts/cell.json";
import contract_chat from "../packages/kit/contracts/chat.json";
import contract_checkbox from "../packages/kit/contracts/checkbox.json";
import contract_codesnippet from "../packages/kit/contracts/codesnippet.json";
import contract_collapsible from "../packages/kit/contracts/collapsible.json";
import contract_colorpicker from "../packages/kit/contracts/colorpicker.json";
import contract_command from "../packages/kit/contracts/command.json";
import contract_conveyor from "../packages/kit/contracts/conveyor.json";
import contract_count from "../packages/kit/contracts/count.json";
import contract_datagrid from "../packages/kit/contracts/datagrid.json";
import contract_datatable from "../packages/kit/contracts/datatable.json";
import contract_datepicker from "../packages/kit/contracts/datepicker.json";
import contract_divider from "../packages/kit/contracts/divider.json";
import contract_drawer from "../packages/kit/contracts/drawer.json";
import contract_dropdownmenu from "../packages/kit/contracts/dropdownmenu.json";
import contract_empty from "../packages/kit/contracts/empty.json";
import contract_field from "../packages/kit/contracts/field.json";
import contract_fieldset from "../packages/kit/contracts/fieldset.json";
import contract_fileupload from "../packages/kit/contracts/fileupload.json";
import contract_filterbutton from "../packages/kit/contracts/filterbutton.json";
import contract_headercell from "../packages/kit/contracts/headercell.json";
import contract_helppopover from "../packages/kit/contracts/helppopover.json";
import contract_input from "../packages/kit/contracts/input.json";
import contract_inputotp from "../packages/kit/contracts/inputotp.json";
import contract_insightcard from "../packages/kit/contracts/insightcard.json";
import contract_linechart from "../packages/kit/contracts/linechart.json";
import contract_linklist from "../packages/kit/contracts/linklist.json";
import contract_listview from "../packages/kit/contracts/listview.json";
import contract_loadinganimation from "../packages/kit/contracts/loadinganimation.json";
import contract_meter from "../packages/kit/contracts/meter.json";
import contract_modal from "../packages/kit/contracts/modal.json";
import contract_modalcard from "../packages/kit/contracts/modalcard.json";
import contract_navigationmenu from "../packages/kit/contracts/navigationmenu.json";
import contract_numbertransition from "../packages/kit/contracts/numbertransition.json";
import contract_pageheader from "../packages/kit/contracts/pageheader.json";
import contract_pagination from "../packages/kit/contracts/pagination.json";
import contract_piechart from "../packages/kit/contracts/piechart.json";
import contract_progress from "../packages/kit/contracts/progress.json";
import contract_progresssteps from "../packages/kit/contracts/progresssteps.json";
import contract_radiogroup from "../packages/kit/contracts/radiogroup.json";
import contract_scoreboard from "../packages/kit/contracts/scoreboard.json";
import contract_scorecard from "../packages/kit/contracts/scorecard.json";
import contract_section from "../packages/kit/contracts/section.json";
import contract_select from "../packages/kit/contracts/select.json";
import contract_shimmertext from "../packages/kit/contracts/shimmertext.json";
import contract_sidenav from "../packages/kit/contracts/sidenav.json";
import contract_skeleton from "../packages/kit/contracts/skeleton.json";
import contract_slider from "../packages/kit/contracts/slider.json";
import contract_spinner from "../packages/kit/contracts/spinner.json";
import contract_switch from "../packages/kit/contracts/switch.json";
import contract_table from "../packages/kit/contracts/table.json";
import contract_tabs from "../packages/kit/contracts/tabs.json";
import contract_tag from "../packages/kit/contracts/tag.json";
import contract_textarea from "../packages/kit/contracts/textarea.json";
import contract_thinkinganimation from "../packages/kit/contracts/thinkinganimation.json";
import contract_timeline from "../packages/kit/contracts/timeline.json";
import contract_toast from "../packages/kit/contracts/toast.json";
import contract_tooltip from "../packages/kit/contracts/tooltip.json";
import contract_treeview from "../packages/kit/contracts/treeview.json";
import contract_usagelist from "../packages/kit/contracts/usagelist.json";

type ContractNotes = {
  useWhen?: string[];
  doNotUseWhen?: string[];
  doNot?: string[];
};

const contracts: Record<string, ContractNotes> = {
  "accordion": contract_accordion,
  "alert": contract_alert,
  "alertdialog": contract_alertdialog,
  "appheader": contract_appheader,
  "appnav": contract_appnav,
  "avatar": contract_avatar,
  "avatargroup": contract_avatargroup,
  "badge": contract_badge,
  "barchart": contract_barchart,
  "breadcrumb": contract_breadcrumb,
  "button": contract_button,
  "buttongroup": contract_buttongroup,
  "calendar": contract_calendar,
  "card": contract_card,
  "carousel": contract_carousel,
  "cell": contract_cell,
  "chat": contract_chat,
  "checkbox": contract_checkbox,
  "codesnippet": contract_codesnippet,
  "collapsible": contract_collapsible,
  "colorpicker": contract_colorpicker,
  "command": contract_command,
  "conveyor": contract_conveyor,
  "count": contract_count,
  "datagrid": contract_datagrid,
  "datatable": contract_datatable,
  "datepicker": contract_datepicker,
  "divider": contract_divider,
  "drawer": contract_drawer,
  "dropdownmenu": contract_dropdownmenu,
  "empty": contract_empty,
  "field": contract_field,
  "fieldset": contract_fieldset,
  "fileupload": contract_fileupload,
  "filterbutton": contract_filterbutton,
  "headercell": contract_headercell,
  "helppopover": contract_helppopover,
  "input": contract_input,
  "inputotp": contract_inputotp,
  "insightcard": contract_insightcard,
  "linechart": contract_linechart,
  "linklist": contract_linklist,
  "listview": contract_listview,
  "loadinganimation": contract_loadinganimation,
  "meter": contract_meter,
  "modal": contract_modal,
  "modalcard": contract_modalcard,
  "navigationmenu": contract_navigationmenu,
  "numbertransition": contract_numbertransition,
  "pageheader": contract_pageheader,
  "pagination": contract_pagination,
  "piechart": contract_piechart,
  "progress": contract_progress,
  "progresssteps": contract_progresssteps,
  "radiogroup": contract_radiogroup,
  "scoreboard": contract_scoreboard,
  "scorecard": contract_scorecard,
  "section": contract_section,
  "select": contract_select,
  "shimmertext": contract_shimmertext,
  "sidenav": contract_sidenav,
  "skeleton": contract_skeleton,
  "slider": contract_slider,
  "spinner": contract_spinner,
  "switch": contract_switch,
  "table": contract_table,
  "tabs": contract_tabs,
  "tag": contract_tag,
  "textarea": contract_textarea,
  "thinkinganimation": contract_thinkinganimation,
  "timeline": contract_timeline,
  "toast": contract_toast,
  "tooltip": contract_tooltip,
  "treeview": contract_treeview,
  "usagelist": contract_usagelist,
};

export function guidanceFor(id: string): { dos: string[]; donts: string[] } | null {
  const contract = contracts[id];
  if (!contract) return null;
  const dos = contract.useWhen ?? [];
  const donts = contract.doNotUseWhen?.length ? contract.doNotUseWhen : (contract.doNot ?? []);
  if (dos.length === 0 && donts.length === 0) return null;
  return { dos, donts };
}
