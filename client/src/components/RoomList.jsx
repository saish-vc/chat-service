import { useState } from "react";
import { useRooms } from "../hooks/useRooms";
import Avatar from "./Avatar";
import Button from "./Button";
import Modal from "./Modal";
import Input from "./Input";
import { useNavigate } from "react-router-dom";

export default function RoomList({ activeRoomId, onSelectRoom }) {
  const { rooms, loading, onlineByRoom, createRoom, refresh } = useRooms();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleCreate = async () => {
    setNameError("");
    if (!name.trim() || name.trim().length < 2) {
      setNameError("Room name must be at least 2 characters");
      return;
    }
    setCreating(true);
    try {
      const room = await createRoom(name.trim(), description.trim());
      refresh();
      setShowCreate(false);
      setName("");
      setDescription("");
      onSelectRoom?.(room._id);
      navigate(`/room/${room._id}`, { replace: true });
    } catch (err) {
      setNameError(err?.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const onlineCount = (roomId) => {
    const users = onlineByRoom[roomId] || [];
    return users.length;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-[var(--bg-hover)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Rooms
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreate(true)}
          aria-label="Create a new room"
        >
          + New
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {rooms.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">
            No rooms yet. Create one to get started.
          </div>
        ) : (
          rooms.map((room) => {
            const isActive = room._id === activeRoomId;
            const online = onlineCount(room._id);
            return (
              <button
                key={room._id}
                type="button"
                onClick={() => onSelectRoom?.(room._id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="avatar w-9 h-9 text-sm bg-[var(--accent)] text-white font-semibold flex-shrink-0 group-hover:brightness-110 transition">
                    {room.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{room.name}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">
                      {room.description || "No description"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    {online > 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                        {online}
                      </span>
                    ) : (
                      <span className="opacity-50">0</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create a room"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating}>
              Create
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Room name"
            placeholder="General"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Description
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="What is this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
