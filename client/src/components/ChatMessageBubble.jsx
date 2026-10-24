import Avatar from "./Avatar";
import { useState, useEffect } from "react";

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (!isToday) {
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ChatMessageBubble({ message, isFirst, alignRight, showAvatar }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
  }, []);

  return (
    <div
      className={`flex gap-3 px-4 py-1.5 group ${
        alignRight ? "flex-row-reverse" : "flex-row"
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      {showAvatar ? (
        <Avatar
          username={message.username}
          color={message.avatarColor}
          size={34}
        />
      ) : null}
      <div className={`flex flex-col ${alignRight ? "items-end" : "items-start"} max-w-[75%]`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[200px] inline-block">
            {message.username}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <div
          className={`px-3 py-1.5 rounded-2xl text-sm leading-relaxed break-words ${
            alignRight
              ? "bg-[var(--accent)] text-white rounded-br-md"
              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-bl-md"
          }`}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}
