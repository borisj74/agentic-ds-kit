export type ChatMessageRole = "user" | "assistant";

export interface ChatMessage {
  id?: string;
  role: ChatMessageRole;
  content: string;
  timestamp?: string;
}

export interface ChatMenuItem {
  id?: string;
  label: string;
  tone?: "default" | "danger";
  onSelect?: () => void;
}

export type ChatRadius = "lg" | "none";

export interface ChatProps {
  title?: string;
  status?: string;
  messages?: ChatMessage[];
  suggestions?: string[];
  placeholder?: string;
  emptyState?: string;
  isThinking?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSend?: (message: string) => void;
  onClose?: () => void;
  closeLabel?: string;
  menuItems?: ChatMenuItem[];
  menuLabel?: string;
  /** `lg` is the standalone card. `none` squares the panel and drops the outer block/end borders so Chat can sit flush in a workspace rail. */
  radius?: ChatRadius;
  className?: string;
}
