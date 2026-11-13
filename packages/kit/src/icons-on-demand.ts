/**
 * Opt-in: lets any Lucide icon name (not only the curated set) render in kit icon props, e.g.
 * `<Button iconStart="Telescope">`. Each extra icon loads as its own chunk on first use.
 *
 *   import "agentic-ds-kit/icons-on-demand";
 *
 * Import it once from a client module that every page loads (a providers file, or your root
 * client layout), so both the server render and the browser have it. Without it, names outside
 * the curated set render nothing (a dev warning says which); pass the Lucide component instead.
 */
import { LucideOnDemand } from "../ui/Button/LucideOnDemand";
import { setOnDemandIconRenderer } from "../ui/Button/iconRegistry";

setOnDemandIconRenderer(LucideOnDemand);

export { LucideOnDemand, setOnDemandIconRenderer };
