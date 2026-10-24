import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRooms } from "../hooks/useRooms";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import Header from "../components/Header";
import RoomList from "../components/RoomList";
import OnlineMembers from "../components/OnlineMembers";
import ChatMessageList from "../components/ChatMessageList";
import MessageInput from "../components/MessageInput";
import ProfilePanel from "../components/ProfilePanel";
import Button from "../components/Button";
import Avatar from "../components/Avatar";
import { useSocketContext } from "../context/SocketContext";
import { api, clearToken } from "../utils/api";

export default function ChatPage() {
  const { id: paramId, roomId: paramRoomId } = useParams();
  const roomId = paramId || paramRoomId || "";
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { rooms, loading: roomsLoading, refresh: refreshRooms } = useRooms();
  const [activeRoomId, setActiveRoomId] = useState(roomId);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [membersSidebarOpen, setMembersSidebarOpen] = useState(false);
  const loadingRoomRef = useRef(false);

  const { connected, onEvent } = useSocketContext();

  const { onlineUsers } = useOnlineUsers(activeRoomId);

  useEffect(() => {
    async function loadRoom() {
      if (!activeRoomId) {
        setCurrentRoom(null);
        return;
      }
      if (loadingRoomRef.current) return;
      loadingRoomRef.current = true;
      try {
        const { room } = await api.getRoom(activeRoomId);
        setCurrentRoom(room);
      } catch (err) {
        console.error("Failed to load room:", err);
        setCurrentRoom(null);
      } finally {
        loadingRoomRef.current = false;
      }
    }
    loadRoom();
  }, [activeRoomId]);

  const handleSelectRoom = useCallback(
    (id) => {
      if (!id) return;
      setActiveRoomId(id);
      navigate(`/room/${id}`, { replace: true });
    },
    [navigate]
  );

  const handleLogout = async () => {
    await logout();
    clearToken();
    navigate("/login");
  };

  const isMobile = () => window.innerWidth < 768;

  useEffect(() => {
    if (roomId && roomId !== activeRoomId) {
      setActiveRoomId(roomId);
    }
  }, [roomId]);

  const currentRoomId = activeRoomId;

  useEffect(() => {
    if (!currentRoomId) return;
    const off = onEvent("typing", () => {
      // no-op; input handles emit
    });
    return () => off?.();
  }, [currentRoomId, onEvent]);

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] overflow-hidden">
      <Header room={currentRoom} currentUser={user} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Rooms) */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } fixed md:relative z-30 inset-y-0 left-0 w-[260px] flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-secondary)] transition-transform duration-200 ease-in-out md:flex flex-col`}
        >
          <RoomList
            activeRoomId={currentRoomId}
            onSelectRoom={(id) => {
              setSidebarOpen(false);
              handleSelectRoom(id);
            }}
          />
        </aside>

        {/* Mobile backdrop for left sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Center Column */}
        <main className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative bg-[var(--bg-primary)]">
          {/* Mobile subheader with menu buttons */}
          <div className="flex md:hidden items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen((p) => !p)}
              className="flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Toggle rooms"
            >
              ☰ Rooms
            </Button>
            <span className="text-sm font-semibold truncate max-w-[150px]">
              {currentRoom ? `# ${currentRoom.name}` : "Select Room"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMembersSidebarOpen((p) => !p)}
              className="flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Toggle members"
            >
              👥 Members
            </Button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {currentRoomId ? (
              <ChatMessageList roomId={currentRoomId} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
                <div className="text-center">
                  <div className="text-5xl mb-4 opacity-30">💬</div>
                  <p className="text-sm">Choose a room from the sidebar to start chatting.</p>
                  <Link
                    to="/home"
                    className="inline-block mt-3 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar (Members) */}
        <aside
          className={`${
            membersSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          } fixed md:relative z-30 inset-y-0 right-0 w-[240px] flex-shrink-0 border-l border-[var(--border)] bg-[var(--bg-secondary)] transition-transform duration-200 ease-in-out md:flex flex-col`}
        >
          <OnlineMembers roomId={currentRoomId} currentUser={user} />
        </aside>

        {/* Mobile backdrop for right sidebar */}
        {membersSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMembersSidebarOpen(false)}
          />
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <ProfilePanel />
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Avatar username={user.username} color={user.avatarColor} size={26} />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {!connected && (
        <div className="fixed bottom-6 right-6 z-50 chip bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30">
          Connecting…
        </div>
      )}
    </div>
  );
}
