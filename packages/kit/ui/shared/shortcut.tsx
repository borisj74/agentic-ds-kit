import styles from "./shortcut.module.css";

const MODIFIER_SYMBOLS: Record<string, string> = {
  "⌘": "Meta",
  "⇧": "Shift",
  "⌥": "Alt",
  "⌃": "Control",
};

const MODIFIER_WORDS: Record<string, string> = {
  cmd: "Meta",
  command: "Meta",
  meta: "Meta",
  shift: "Shift",
  alt: "Alt",
  option: "Alt",
  opt: "Alt",
  ctrl: "Control",
  control: "Control",
};

const NAMED_KEYS: Record<string, string> = {
  esc: "Escape",
  escape: "Escape",
  "↵": "Enter",
  enter: "Enter",
  return: "Enter",
  "↑": "ArrowUp",
  "↓": "ArrowDown",
  "←": "ArrowLeft",
  "→": "ArrowRight",
  tab: "Tab",
  space: "Space",
  del: "Delete",
  delete: "Delete",
  backspace: "Backspace",
};

export interface ParsedShortcut {
  /** One chip per key, in display order. */
  keys: string[];
  /** True for a sequence such as "G I" (press G, then I) rather than one chord. */
  sequence: boolean;
}

/**
 * Splits a shortcut string into keys.
 * "⇧⌘P" → ⇧ ⌘ P. "Ctrl+K" or "Ctrl K" → Ctrl K (one chord). "G I" → G then I (a sequence). "Esc" → Esc.
 */
export function parseShortcut(shortcut: string): ParsedShortcut {
  const text = shortcut.trim();
  if (!text) return { keys: [], sequence: false };
  if (text.includes("+")) {
    return { keys: text.split("+").map((key) => key.trim()).filter(Boolean), sequence: false };
  }
  if (/\s/.test(text)) {
    const keys = text.split(/\s+/);
    const chord = keys.slice(0, -1).every((key) => MODIFIER_WORDS[key.toLowerCase()] || MODIFIER_SYMBOLS[key]);
    return { keys, sequence: !chord };
  }
  const keys: string[] = [];
  let rest = text;
  while (rest.length > 1 && MODIFIER_SYMBOLS[rest[0]]) {
    keys.push(rest[0]);
    rest = rest.slice(1);
  }
  keys.push(rest);
  return { keys, sequence: false };
}

function ariaKey(key: string): string {
  const lower = key.toLowerCase();
  return MODIFIER_SYMBOLS[key] ?? MODIFIER_WORDS[lower] ?? NAMED_KEYS[lower] ?? NAMED_KEYS[key] ?? (key.length === 1 ? key.toUpperCase() : key);
}

/** `aria-keyshortcuts` value for a chord ("⇧⌘P" → "Shift+Meta+P"). Undefined for a sequence, which the attribute can't express. */
export function ariaKeyShortcuts(shortcut?: string): string | undefined {
  if (!shortcut) return undefined;
  const parsed = parseShortcut(shortcut);
  if (parsed.keys.length === 0 || parsed.sequence) return undefined;
  return parsed.keys.map(ariaKey).join("+");
}

/**
 * Geist Mono key chips, one per key. Hidden from assistive tech: the item carries
 * `aria-keyshortcuts`, and a sequence adds a visually hidden "G then I".
 */
export function Keycaps({ shortcut, className }: { shortcut: string; className?: string }) {
  const parsed = parseShortcut(shortcut);
  if (parsed.keys.length === 0) return null;
  return (
    <span className={[styles.keys, className].filter(Boolean).join(" ")}>
      <span className={styles.chips} aria-hidden="true">
        {parsed.keys.map((key, index) => (
          <kbd key={`${key}-${index}`} className={styles.key}>
            {key}
          </kbd>
        ))}
      </span>
      {parsed.sequence ? <span className={styles.srOnly}>{parsed.keys.join(" then ")}</span> : null}
    </span>
  );
}
