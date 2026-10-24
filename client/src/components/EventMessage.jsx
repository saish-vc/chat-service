export default function EventMessage({ type, username }) {
  const text =
    type === "joined"
      ? `${username} joined the room`
      : type === "left"
      ? `${username} left the room`
      : "Something happened";

  return (
    <div className="flex items-center justify-center py-1.5">
      <span className="chip bg-[var(--bg-hover)] text-[var(--text-muted)] text-xs border border-[var(--border)]">
        {text}
      </span>
    </div>
  );
}
