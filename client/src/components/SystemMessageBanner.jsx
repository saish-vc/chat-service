import { useEffect, useState } from "react";

export default function SystemMessageBanner({ messages = [], onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (messages.length > 0 && visible) {
      const t = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(t);
    }
  }, [messages, visible]);

  if (!visible || messages.length === 0) return null;

  const latest = messages[messages.length - 1];
  const isJoin = latest?.type === "joined";

  return (
    <div
      className={`bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
          {isJoin ? "User joined" : "User left"}
        </span>
        <span className="font-medium text-[var(--text-primary)]">
          {latest?.username || "Someone"}
        </span>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
