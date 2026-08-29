"use client";

import { MoreHorizontal, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/ui/Button";
import controlStyles from "@/ui/shared/controls.module.css";
import inputStyles from "@/ui/Input/Input.module.css";
import { ThinkingAnimation } from "@/ui/ThinkingAnimation";
import type { ChatPatternProps } from "./ChatPattern.types";
import styles from "./ChatPattern.module.css";

export type {
  ChatPatternMenuItem,
  ChatPatternMessage,
  ChatPatternProps,
  ChatMessageRole,
} from "./ChatPattern.types";

export function ChatPattern({
  title = "Assistant",
  status = "Ready",
  messages = [],
  suggestions = [],
  placeholder = "Message the assistant…",
  emptyState = "Start a conversation.",
  isThinking = false,
  disabled = false,
  value,
  defaultValue = "",
  onValueChange,
  onSend,
  onClose,
  closeLabel = "Close chat",
  menuItems = [],
  menuLabel = "Chat settings",
  className = "",
}: ChatPatternProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const draft = value ?? internalValue;

  useEffect(() => {
    const messageLog = messagesRef.current;
    if (!messageLog) return;
    messageLog.scrollTop = messageLog.scrollHeight;
  }, [isThinking, messages.length]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function updateDraft(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  function sendMessage(message = draft) {
    const nextMessage = message.trim();
    if (!nextMessage || disabled) return;
    onSend?.(nextMessage);
    updateDraft("");
  }

  return (
    <section className={`${styles.pattern} ${className}`.trim()} aria-label={`${title} chat`}>
      <header className={styles.header}>
        <span className={styles.identity}>
          <span className={styles.title}>{title}</span>
          {status ? (
            <span className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              {status}
            </span>
          ) : null}
        </span>
        <div className={styles.headerActions}>
          {menuItems.length > 0 ? (
            <div ref={menuRef} className={styles.config}>
              <button
                ref={menuButtonRef}
                type="button"
                className={styles.iconButton}
                aria-label={menuLabel}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MoreHorizontal aria-hidden="true" size={18} />
              </button>
              {menuOpen ? (
                <div className={styles.configMenu} role="menu" aria-label={menuLabel}>
                  {menuItems.map((item) => (
                    <button
                      key={item.id ?? item.label}
                      type="button"
                      role="menuitem"
                      className={`${styles.configItem}${item.tone === "danger" ? ` ${styles.configDanger}` : ""}`}
                      onClick={() => {
                        item.onSelect?.();
                        setMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {onClose ? (
            <button type="button" className={styles.iconButton} aria-label={closeLabel} onClick={onClose}>
              <X aria-hidden="true" size={18} />
            </button>
          ) : null}
        </div>
      </header>

      <div
        ref={messagesRef}
        className={styles.messages}
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        aria-busy={isThinking}
      >
        {messages.length === 0 && !isThinking ? <p className={styles.empty}>{emptyState}</p> : null}
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <article
              key={message.id ?? index}
              className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}
            >
              <div className={styles.messageContent}>
                <div className={styles.bubble}>{message.content}</div>
                {message.timestamp ? <span className={styles.timestamp}>{message.timestamp}</span> : null}
              </div>
            </article>
          );
        })}
        {isThinking ? (
          <div className={`${styles.message} ${styles.messageAssistant}`}>
            <div className={styles.thinking}>
              <ThinkingAnimation label="Thinking" size="md" />
            </div>
          </div>
        ) : null}
      </div>

      {suggestions.length > 0 ? (
        <div className={styles.suggestions} aria-label="Suggested prompts">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="tertiary"
              size="sm"
              disabled={disabled}
              onClick={() => sendMessage(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      ) : null}

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <div className={`${controlStyles.control} ${controlStyles.controlMd}`}>
          <input
            id={inputId}
            className={inputStyles.native}
            value={draft}
            placeholder={placeholder}
            aria-label={placeholder}
            disabled={disabled}
            onChange={(event) => updateDraft(event.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          ariaLabel="Send message"
          disabled={disabled || !draft.trim()}
          iconStart="Send"
        />
      </form>
    </section>
  );
}
