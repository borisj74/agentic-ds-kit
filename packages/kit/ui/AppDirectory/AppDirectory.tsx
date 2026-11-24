"use client";

import { useState } from "react";
import { IntegrationPicker } from "../IntegrationPicker";
import { CONNECTED_CATEGORY } from "../IntegrationPicker/integrationPicker.logic";
import type { AppDirectoryProps } from "./AppDirectory.types";
import { nisthaAttr } from "../shared/inspect";

export type { AppDirectoryProps, AppDirectoryApp } from "./AppDirectory.types";

/**
 * @deprecated Use `<IntegrationPicker connectFlow="detail" showConnected />`: the same catalogue, with
 * Connected as a category segment and the detail Drawer built in. AppDirectory now renders exactly that
 * and will be removed in a later release.
 */
export function AppDirectory(props: AppDirectoryProps) {
  const {
    apps,
    title = "Apps",
    note,
    categories,
    category: categoryProp,
    onCategoryChange,
    connectedOnly: connectedOnlyProp,
    defaultConnectedOnly = false,
    onConnectedOnlyChange,
    selectedId,
    defaultSelectedId,
    onSelectedChange,
    onConnect,
    onDisconnect,
    connectingId,
    onRequest,
    loading,
    error,
    onRetry,
    ...rest
  } = props;
  const [ownConnectedOnly, setOwnConnectedOnly] = useState(defaultConnectedOnly);
  const [ownCategory, setOwnCategory] = useState("all");
  const connectedOnly = connectedOnlyProp ?? ownConnectedOnly;
  const category = categoryProp ?? ownCategory;

  // Connected is now a category segment; keep the old chip props working on top of it.
  function setCategory(next: string) {
    const nextConnected = next === CONNECTED_CATEGORY;
    if (nextConnected !== connectedOnly) {
      if (connectedOnlyProp === undefined) setOwnConnectedOnly(nextConnected);
      onConnectedOnlyChange?.(nextConnected);
    }
    if (!nextConnected) {
      if (categoryProp === undefined) setOwnCategory(next);
      onCategoryChange?.(next);
    }
  }

  return (
    <IntegrationPicker
      {...rest}
      {...nisthaAttr("appdirectory", rest)}
      title={title}
      note={note}
      items={apps}
      categories={categories}
      category={connectedOnly ? CONNECTED_CATEGORY : category}
      onCategoryChange={setCategory}
      showConnected
      connectFlow="detail"
      selectedId={selectedId}
      defaultSelectedId={defaultSelectedId}
      onSelectedChange={onSelectedChange}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      connectingId={connectingId}
      onRequest={onRequest}
      loading={loading}
      error={error}
      onRetry={onRetry}
    />
  );
}
