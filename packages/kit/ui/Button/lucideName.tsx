import { createElement, isValidElement, type ComponentType, type ReactElement } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { normalizeIconName } from "./iconName";
import { getOnDemandIconRenderer } from "./iconRegistry";
import {
  House,
  Search,
  Menu,
  Settings,
  User,
  Bell,
  CalendarDays,
  Check,
  X,
  Plus,
  Minus,
  ArrowRight,
  Download,
  Upload,
  Pencil,
  Copy,
  Trash2,
  Ellipsis,
  Sparkles,
  Circle,
  CircleCheck,
  Info,
  TriangleAlert,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Mail,
  Phone,
  MessageCircle,
  Paperclip,
  Camera,
  Image,
  File,
  Folder,
  FolderOpen,
  Save,
  Send,
  Archive,
  RefreshCw,
  RotateCcw,
  Filter,
  SlidersHorizontal,
  CirclePlus,
  CircleX,
  ExternalLink,
  Link,
  Share2,
  Play,
  Pause,
  Clock,
  MapPin,
  Globe,
  Heart,
  Star,
  ShoppingCart,
  CreditCard,
  Package,
  ChartBar,
  TrendingDown,
  TrendingUp,
  Database,
  Cloud,
  Wifi,
  Zap,
  Layers,
  LogIn,
  LogOut,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  GripVertical,
  LayoutDashboard,
  FileText,
  Users,
  ChartLine,
  Activity,
  Blocks,
  Brain,
  CheckCheck,
  ClipboardList,
  Compass,
  FileDiff,
  Hand,
  History,
  Inbox,
  LayoutGrid,
  ListChecks,
  LoaderCircle,
  MessageSquare,
  Network,
  Pin,
  Plug,
  Reply,
  Rocket,
  Scissors,
  Shield,
  SkipForward,
  Square,
  ThumbsDown,
  ThumbsUp,
  Unplug,
  UserMinus,
  Wrench,
} from "lucide-react";

const LUCIDE_BY_NAME: Record<string, LucideIcon> = {
  House,
  Search,
  Menu,
  Settings,
  User,
  Bell,
  CalendarDays,
  Check,
  X,
  Plus,
  Minus,
  ArrowRight,
  Download,
  Upload,
  Pencil,
  Copy,
  Trash2,
  Ellipsis,
  MoreHorizontal: Ellipsis,
  Sparkles,
  Circle,
  CircleCheck,
  Info,
  TriangleAlert,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Mail,
  Phone,
  MessageCircle,
  Paperclip,
  Camera,
  Image,
  File,
  Folder,
  FolderOpen,
  Save,
  Send,
  Archive,
  RefreshCw,
  RotateCcw,
  Filter,
  SlidersHorizontal,
  CirclePlus,
  CircleX,
  ExternalLink,
  Link,
  Share2,
  Play,
  Pause,
  Clock,
  MapPin,
  Globe,
  Heart,
  Star,
  ShoppingCart,
  CreditCard,
  Package,
  ChartBar,
  TrendingDown,
  TrendingUp,
  Database,
  Cloud,
  Wifi,
  Zap,
  Layers,
  LogIn,
  LogOut,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  GripVertical,
  LayoutDashboard,
  FileText,
  Users,
  ChartLine,
  Activity,
  Blocks,
  Brain,
  CheckCheck,
  ClipboardList,
  Compass,
  FileDiff,
  Hand,
  History,
  Inbox,
  LayoutGrid,
  ListChecks,
  LoaderCircle,
  MessageSquare,
  Network,
  Pin,
  Plug,
  Reply,
  Rocket,
  Scissors,
  Shield,
  SkipForward,
  Square,
  ThumbsDown,
  ThumbsUp,
  Unplug,
  UserMinus,
  Wrench,
};

/** Curated names, keyed by normalized name so `LayoutDashboard` and `layout-dashboard` both hit. */
const CURATED = new Map<string, LucideIcon>(
  Object.entries(LUCIDE_BY_NAME).map(([key, Icon]) => [normalizeIconName(key), Icon]),
);

/** Any component that renders an icon from the props the kit passes (a Lucide icon fits). */
export type KitIconComponent = ComponentType<
  Pick<LucideProps, "size" | "strokeWidth" | "className" | "aria-hidden">
>;

/**
 * An icon prop: a Lucide name (`"Rocket"` or `"rocket"`), a Lucide component
 * (`Rocket`), or an element you size yourself (`<Rocket size={16} />`).
 */
export type KitIcon = string | KitIconComponent | ReactElement;

/** True for a value LucideByName can render (name, component or element). */
export function isKitIcon(value: unknown): value is KitIcon {
  if (typeof value === "string" || typeof value === "function" || isValidElement(value)) return true;
  // forwardRef / memo components (every Lucide icon) are objects with $$typeof.
  return typeof value === "object" && value !== null && "$$typeof" in value;
}

const warnedNames = new Set<string>();

/**
 * Renders a kit icon prop. Curated names render synchronously. Any other Lucide name renders
 * only after `import "agentic-ds-kit/icons-on-demand"` (it then loads as its own chunk);
 * without it the icon is skipped and a dev warning names it. Components get the kit's size and
 * stroke; elements render as given.
 */
export function LucideByName({
  name,
  size,
  className,
}: {
  name?: KitIcon;
  size: number;
  className?: string;
}) {
  if (!name) return null;
  if (isValidElement(name)) return name;
  const Icon = typeof name === "string" ? CURATED.get(normalizeIconName(name)) : name;
  if (!Icon) {
    const OnDemand = getOnDemandIconRenderer();
    if (OnDemand) return createElement(OnDemand, { name: name as string, size, className });
    if (process.env.NODE_ENV !== "production" && !warnedNames.has(name as string)) {
      warnedNames.add(name as string);
      console.warn(
        `[agentic-ds-kit] Icon "${name as string}" is not in the curated set. Pass the Lucide component, or import "agentic-ds-kit/icons-on-demand" once to load any Lucide name.`,
      );
    }
    return null;
  }
  return createElement(Icon, { size, strokeWidth: ICON_STROKE, "aria-hidden": true, className });
}
