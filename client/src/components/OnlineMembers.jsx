import Avatar from "./Avatar";
import UserStatus from "./UserStatus";
import { useOnlineUsers } from "../hooks/useOnlineUsers";

export default function OnlineMembers({ roomId, currentUser }) {
  const { onlineUsers, joined } = useOnlineUsers(roomId);

  const allUsers =
    joined && currentUser
      ? [
          {
            _id: currentUser._id,
            username: currentUser.username,
            avatarColor: currentUser.avatarColor,
            online: true,
          },
          ...onlineUsers,
        ]
      : onlineUsers;

  const unique = [];
  const seen = new Set();
  for (const u of allUsers) {
    if (!seen.has(u._id)) {
      seen.add(u._id);
      unique.push(u);
    }
  }
  const sorted = unique.sort((a, b) => a.username.localeCompare(b.username));

  if (!roomId) {
    return (
      <div className="flex flex-col h-full p-3 overflow-y-auto">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Online
        </div>
        <div className="text-sm text-[var(--text-muted)] text-center py-8">
          Select a room to see who is online.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Online
        </span>
        <span className="text-xs text-[var(--text-muted)]">{sorted.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {sorted.length === 0 ? (
          <div className="text-sm text-[var(--text-muted)] text-center py-6">
            No one is online right now.
          </div>
        ) : (
          sorted.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <Avatar
                username={u.username}
                color={u.avatarColor || "#6366f1"}
                size={32}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {u.username}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {u._id === currentUser?._id ? "You" : "Member"}
                </div>
              </div>
              {u._id !== currentUser?._id && <UserStatus online={true} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
