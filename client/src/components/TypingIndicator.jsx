export default function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;

  const names = users.map((u) => u.username).filter(Boolean);
  if (names.length === 0) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-[var(--text-muted)]">
      <span className="flex items-center gap-0.5">
        <span className="inline-block w-1 h-1 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="inline-block w-1 h-1 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="inline-block w-1 h-1 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
      </span>
      <span className="ml-1">{label}</span>
    </div>
  );
}
