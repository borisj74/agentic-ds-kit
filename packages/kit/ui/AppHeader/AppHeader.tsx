import { useId } from "react";
import {
  AppHeaderActions,
  AppHeaderBrand,
  AppHeaderCenter,
  AppHeaderMark,
  AppHeaderRoot,
  AppHeaderSearch,
  AppHeaderSpacer,
  AppHeaderTitle,
} from "./AppHeader.blocks";
import type { AppHeaderProps } from "./AppHeader.types";

export type {
  AppHeaderProps,
  AppHeaderRadius,
  AppHeaderRootProps,
  AppHeaderBrandProps,
  AppHeaderMarkProps,
  AppHeaderTitleProps,
  AppHeaderCenterProps,
  AppHeaderSearchProps,
  AppHeaderActionsProps,
  AppHeaderSpacerProps,
} from "./AppHeader.types";

/**
 * Preset: brand, search, actions from props. Built from the blocks
 * (`AppHeader.Root`, `.Brand`, `.Title`, `.Search`, `.Actions`); compose those
 * directly to rearrange the bar.
 */
function AppHeaderPreset({
  title,
  mark,
  markIcon,
  logo,
  search = true,
  searchPlaceholder = "Search",
  searchValue,
  defaultSearchValue,
  onSearch,
  searchShortcut,
  searchId,
  actions,
  start,
  center,
  end,
  className,
  ariaLabel,
  radius = "none",
  ref,
  ...rest
}: AppHeaderProps) {
  const generatedId = useId();
  const markLetter = (mark && mark.length > 0 ? mark : title?.charAt(0)) || "·";

  const centerNode =
    center !== undefined ? (
      center === null || center === false ? null : <AppHeaderCenter>{center}</AppHeaderCenter>
    ) : search ? (
      <AppHeaderSearch
        id={searchId ?? generatedId}
        placeholder={searchPlaceholder}
        value={searchValue}
        defaultValue={defaultSearchValue}
        onSearch={onSearch}
        shortcut={searchShortcut}
      />
    ) : null;

  return (
    <AppHeaderRoot
      {...rest}
      ref={ref}
      className={className}
      radius={radius}
      ariaLabel={ariaLabel ?? title ?? "Application"}
      data-search={centerNode ? undefined : "false"}
    >
      {start !== undefined ? (
        <AppHeaderBrand>{start}</AppHeaderBrand>
      ) : (
        <AppHeaderBrand mark={markLetter} markIcon={markIcon} logo={logo}>
          {title ? <AppHeaderTitle>{title}</AppHeaderTitle> : null}
        </AppHeaderBrand>
      )}
      {centerNode}
      <AppHeaderActions>{end !== undefined ? end : actions}</AppHeaderActions>
    </AppHeaderRoot>
  );
}

/**
 * Product top chrome. `<AppHeader … />` is the preset; `AppHeader.Root`, `.Brand`,
 * `.Mark`, `.Title`, `.Search`, `.Center`, `.Spacer`, `.Actions` are the building
 * blocks (also exported as `AppHeaderRoot`, `AppHeaderBrand`, …).
 */
export const AppHeader = Object.assign(AppHeaderPreset, {
  Root: AppHeaderRoot,
  Brand: AppHeaderBrand,
  Mark: AppHeaderMark,
  Title: AppHeaderTitle,
  Search: AppHeaderSearch,
  Center: AppHeaderCenter,
  Spacer: AppHeaderSpacer,
  Actions: AppHeaderActions,
});
