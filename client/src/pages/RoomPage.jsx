import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRooms } from "../hooks/useRooms";
import Button from "../components/Button";

export default function RoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, loading } = useRooms();

  useEffect(() => {
    const room = rooms.find((r) => r._id === id);
    if (room) {
      navigate(`/room/${id}`, { replace: true });
    }
  }, [rooms, id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <div className="text-sm">Loading room…</div>
        </div>
      </div>
    );
  }

  const room = rooms.find((r) => r._id === id);
  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="text-5xl mb-4 opacity-30">🛑</div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Room not found</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            This room doesn’t exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Back to rooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="w-full max-w-lg card p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="avatar w-12 h-12 text-lg bg-[var(--accent)] text-white font-semibold">
            {room.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{room.name}</h1>
            <p className="text-sm text-[var(--text-muted)]">{room.description || "No description"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-6">
          <span>👤 {room.memberCount} members</span>
          <span>💬 {room.memberCount > 0 ? `${room.memberCount} online` : "No one online"}</span>
        </div>

        <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            Created {new Date(room.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <Button onClick={() => navigate(`/room/${id}`)}>
            Open room
          </Button>
        </div>
      </div>
    </div>
  );
}
