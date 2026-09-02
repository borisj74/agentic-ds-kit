"use client";

import { useCallback, useEffect, useState } from "react";
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
  CircleCheck,
  Info,
  TriangleAlert,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
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
  Database,
  Cloud,
  Wifi,
  Zap,
  Layers,
  LogIn,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./IconsFoundations.module.css";

const ICONS = [
  { name: "House", Icon: House },
  { name: "Search", Icon: Search },
  { name: "Menu", Icon: Menu },
  { name: "Settings", Icon: Settings },
  { name: "User", Icon: User },
  { name: "Bell", Icon: Bell },
  { name: "CalendarDays", Icon: CalendarDays },
  { name: "Check", Icon: Check },
  { name: "X", Icon: X },
  { name: "Plus", Icon: Plus },
  { name: "Minus", Icon: Minus },
  { name: "ArrowRight", Icon: ArrowRight },
  { name: "Download", Icon: Download },
  { name: "Upload", Icon: Upload },
  { name: "Pencil", Icon: Pencil },
  { name: "Copy", Icon: Copy },
  { name: "Trash2", Icon: Trash2 },
  { name: "Ellipsis", Icon: Ellipsis },
  { name: "Sparkles", Icon: Sparkles },
  { name: "CircleCheck", Icon: CircleCheck },
  { name: "Info", Icon: Info },
  { name: "TriangleAlert", Icon: TriangleAlert },
  { name: "CircleHelp", Icon: CircleHelp },
  { name: "ChevronLeft", Icon: ChevronLeft },
  { name: "ChevronRight", Icon: ChevronRight },
  { name: "ChevronUp", Icon: ChevronUp },
  { name: "ChevronDown", Icon: ChevronDown },
  { name: "Eye", Icon: Eye },
  { name: "EyeOff", Icon: EyeOff },
  { name: "Lock", Icon: Lock },
  { name: "Unlock", Icon: Unlock },
  { name: "Mail", Icon: Mail },
  { name: "Phone", Icon: Phone },
  { name: "MessageCircle", Icon: MessageCircle },
  { name: "Paperclip", Icon: Paperclip },
  { name: "Camera", Icon: Camera },
  { name: "Image", Icon: Image },
  { name: "File", Icon: File },
  { name: "Folder", Icon: Folder },
  { name: "FolderOpen", Icon: FolderOpen },
  { name: "Save", Icon: Save },
  { name: "Archive", Icon: Archive },
  { name: "RefreshCw", Icon: RefreshCw },
  { name: "RotateCcw", Icon: RotateCcw },
  { name: "Filter", Icon: Filter },
  { name: "SlidersHorizontal", Icon: SlidersHorizontal },
  { name: "CirclePlus", Icon: CirclePlus },
  { name: "CircleX", Icon: CircleX },
  { name: "ExternalLink", Icon: ExternalLink },
  { name: "Link", Icon: Link },
  { name: "Share2", Icon: Share2 },
  { name: "Play", Icon: Play },
  { name: "Pause", Icon: Pause },
  { name: "Clock", Icon: Clock },
  { name: "MapPin", Icon: MapPin },
  { name: "Globe", Icon: Globe },
  { name: "Heart", Icon: Heart },
  { name: "Star", Icon: Star },
  { name: "ShoppingCart", Icon: ShoppingCart },
  { name: "CreditCard", Icon: CreditCard },
  { name: "Package", Icon: Package },
  { name: "ChartBar", Icon: ChartBar },
  { name: "Database", Icon: Database },
  { name: "Cloud", Icon: Cloud },
  { name: "Wifi", Icon: Wifi },
  { name: "Zap", Icon: Zap },
  { name: "Layers", Icon: Layers },
  { name: "LogIn", Icon: LogIn },
  { name: "LogOut", Icon: LogOut },
  { name: "PanelLeftClose", Icon: PanelLeftClose },
  { name: "PanelLeftOpen", Icon: PanelLeftOpen },
  { name: "PanelRightClose", Icon: PanelRightClose },
  { name: "PanelRightOpen", Icon: PanelRightOpen },
] as const;

function CopyCode({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }, [value]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <button type="button" className={styles.token} onClick={onCopy} title={`Copy ${value}`}>
      {copied ? "Copied ✓" : value}
    </button>
  );
}

export function IconsFoundations() {
  return (
    <div className={colorStyles.colorSection}>
      <p className={styles.credit}>
        Interface icons provided by 
        <a href="https://lucide.dev/" target="_blank" rel="noreferrer">
          Lucide
        </a>
        .
      </p>
      <p className={colorStyles.lead}>
        Use Lucide’s consistent outline set with semantic icon colors and accessible labels.
      </p>

      <div className={styles.sections}>
        <section className={styles.scale}>
          <div className={colorStyles.hueHeader}>
            <h3 className={colorStyles.hueTitle}>Common icons</h3>
            <code className={colorStyles.huePattern}>lucide-react</code>
          </div>
          <p className={styles.note}>
            Start with familiar, literal symbols. Keep the same icon for the same concept across the
            product.
          </p>
          <div className={styles.grid}>
            {ICONS.map(({ name, Icon }) => (
              <div key={name} className={styles.card}>
                <Icon aria-hidden="true" />
                <CopyCode value={name} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.scale}>
          <div className={colorStyles.hueHeader}>
            <h3 className={colorStyles.hueTitle}>Usage</h3>
          </div>
          <p className={styles.note}>
            Import icons individually so unused assets are removed from the production bundle.
          </p>
          <pre className={styles.code}>
            <code>{`import { Search, Settings } from "lucide-react"

<Search aria-hidden="true" />
<button aria-label="Settings">
  <Settings aria-hidden="true" />
</button>`}</code>
          </pre>
        </section>

        <section className={styles.scale}>
          <div className={colorStyles.hueHeader}>
            <h3 className={colorStyles.hueTitle}>Rules</h3>
          </div>
          <ul className={styles.rules}>
            <li>
              Use semantic colors such as <code>--icon-default</code> and <code>--icon-muted</code>.
              Status color goes on the icon only when the meaning is real.
            </li>
            <li>Let controls determine icon size. Do not set one-off pixel sizes.</li>
            <li>
              Mark decorative icons <code>aria-hidden="true"</code>. Give every icon-only control an
              accessible label.
            </li>
            <li>Do not use brand marks as generic interface icons.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
