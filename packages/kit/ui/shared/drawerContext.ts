import { createContext, useContext } from "react";

/** True inside a kit Drawer's body, so blocks that render there (e.g. SideNav) can fill it. */
export const DrawerBodyContext = createContext(false);

export function useInDrawer(): boolean {
  return useContext(DrawerBodyContext);
}
