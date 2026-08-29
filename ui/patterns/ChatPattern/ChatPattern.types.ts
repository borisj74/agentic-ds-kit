export type ChatMessageRole = "user" | "assistant";

export interface ChatPatternMessage {
  id?: string;
  role: ChatMessageRole;
  content: string;
  timestamp?: string;
}

export interface ChatPatternMenuItem {
  id?: string;
  label: string;
  tone?: "default" | "danger";
  onSelect?: () => void;
}

export interface ChatPatternProps {
  title?: string;
  status?: string;
  messages?: ChatPatternMessage[];
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
  menuItems?: ChatPatternMenuItem[];
  menuLabel?: string;
  className?: string;
}
