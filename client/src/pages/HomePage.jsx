import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useRooms } from "../hooks/useRooms";

export default function HomePage() {
  const { user } = useAuth();
  const { rooms, loading, refresh } = useRooms();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Select a room from the sidebar to start chatting</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              {user?.avatarColor && (
                <div
                  className="avatar w-10 h-10 text-sm text-white font-semibold flex-shrink-0"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {(user.displayName || user.username || "?").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {user?.displayName || user?.username || "User"}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{user?.username}</div>
              </div>
            </div>

            <div className="text-sm text-[var(--text-secondary)] mb-4">
              {rooms.length === 0 && !loading ? (
                <span className="text-[var(--text-muted)]">No rooms yet. Create one in chat!</span>
              ) : loading ? (
                <span className="text-[var(--text-muted)]">Loading rooms…</span>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                    Available Rooms
                  </div>
                  {rooms.map((r) => (
                    <Link
                      key={r._id}
                      to={`/room/${r._id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] transition text-[var(--text-primary)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm"># {r.name}</span>
                        {r.description && (
                          <span className="text-xs text-[var(--text-muted)] truncate max-w-[140px]">
                            {r.description}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--accent)] font-medium">Chat &rarr;</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Button variant="outline" className="w-full" onClick={refresh} disabled={loading}>
              {loading ? "Loading…" : "Refresh rooms"}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Need to switch accounts?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition"
            >
              Sign in as someone else
            </Link>
          </p>
        </div>
      </main>
      <footer className="text-center py-4 text-xs text-[var(--text-muted)]">
        ChatWave — Real-time chat, instantly.
      </footer>
    </div>
  );
}
