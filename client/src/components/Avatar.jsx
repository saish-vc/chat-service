export default function Avatar({ username, color, size = 36, showSize = true }) {
  if (!username) {
    return (
      <div
        className="avatar rounded-full bg-[var(--accent)] text-white font-semibold flex items-center justify-center"
        style={{ width: size, height: size, minWidth: size, fontSize: size * 0.38 }}
      >
        ?
      </div>
    );
  }

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div
      className="avatar text-white font-semibold flex items-center justify-center select-none"
      style={{
        width: size,
        height: size,
        minWidth: size,
        fontSize: size * 0.38,
        backgroundColor: color || "#6366f1",
      }}
      title={username}
    >
      {initials}
    </div>
  );
}
