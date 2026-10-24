export default function UserStatus({ online = false, lastSeen }) {
  const statusColor = online ? "bg-[var(--success)]" : "bg-[var(--text-muted)]";
  const label = online
    ? "Online"
    : lastSeen
    ? `Last seen ${new Date(lastSeen).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Offline";

  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span className={`inline-block w-2 h-2 rounded-full ${statusColor}`} />
      <span>{label}</span>
    </div>
  );
}
