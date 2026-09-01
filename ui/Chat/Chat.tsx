"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/ui/Button";
import { DropdownMenu } from "@/ui/DropdownMenu";
import { Input } from "@/ui/Input";
import { ThinkingAnimation } from "@/ui/ThinkingAnimation";
import type { ChatProps } from "./Chat.types";
import styles from "./Chat.module.css";

export type { ChatMessage, ChatMessageRole, ChatMenuItem, ChatProps, ChatRadius } from "./Chat.types";

export function Chat({
  title = "Assistant",
  status,
  messages = [],
  suggestions = [],
  placeholder = "How can we help you?",
  emptyState = "Start a conversation.",
  isThinking = false,
  disabled = false,
  value,
  defaultValue = "",
  onValueChange,
  onSend,
  onClose,
  closeLabel = "Close",
  menuItems = [],
  menuLabel = "More",
  radius = "lg",
  className = "",
}: ChatProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const draft = value ?? internalValue;

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTop = thread.scrollHeight;
  }, [isThinking, messages.length]);

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
    <section
      className={`${styles.panel} ${radius === "none" ? styles.radiusNone : ""} ${className}`.trim()}
      aria-label={title}
    >
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
            <DropdownMenu
              ariaLabel={menuLabel}
              iconStart="MoreHorizontal"
              variant="tertiary"
              size="sm"
              align="end"
              groups={[
                {
                  items: menuItems.map((item, index) => ({
                    id: item.id ?? `${item.label}-${index}`,
                    label: item.label,
                    danger: item.tone === "danger",
                  })),
                },
              ]}
              onSelect={(id) => {
                const item = menuItems.find((entry, index) => (entry.id ?? `${entry.label}-${index}`) === id);
                item?.onSelect?.();
              }}
            />
          ) : null}
          {onClose ? (
            <Button type="button" variant="tertiary" size="sm" iconStart="X" ariaLabel={closeLabel} onClick={onClose} />
          ) : null}
        </div>
      </header>

      <div
        ref={threadRef}
        className={styles.thread}
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
              {isUser ? null : <span className={styles.mark} aria-hidden="true" />}
              <div className={styles.body}>
                <p className={styles.copy}>{message.content}</p>
                {message.timestamp ? <span className={styles.timestamp}>{message.timestamp}</span> : null}
              </div>
            </article>
          );
        })}
        {isThinking ? (
          <div className={`${styles.message} ${styles.messageAssistant}`}>
            <span className={styles.mark} aria-hidden="true" />
            <ThinkingAnimation label="Thinking" size="md" />
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
        <Input
          id={inputId}
          value={draft}
          placeholder={placeholder}
          ariaLabel={placeholder}
          disabled={disabled}
          onChange={updateDraft}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          ariaLabel="Send"
          disabled={disabled || !draft.trim()}
          iconStart="Send"
        />
      </form>
    </section>
  );
}
