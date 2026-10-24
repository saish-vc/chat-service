import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";

export default function Header({ room, currentUser }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-3">
        {currentUser ? (
          <Avatar
            username={currentUser.username}
            color={currentUser.avatarColor}
            size={30}
          />
        ) : null}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {room?.name || "Chat"}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {room?.memberCount ? `${room.memberCount} members` : "Room"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
