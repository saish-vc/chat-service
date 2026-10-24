import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../utils/api";
import { useSocketContext } from "../context/SocketContext";

function useRooms() {
  const { onEvent } = useSocketContext();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlineByRoom, setOnlineByRoom] = useState({});
  const mountedRef = useRef(true);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { rooms: fetched } = await api.listRooms();
      if (mountedRef.current) {
        setRooms(fetched);
      }
    } catch (e) {
      if (mountedRef.current) setError(e.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchRooms();
    const offOnline = onEvent("online_users", (event, data) => {
      if (mountedRef.current) {
        setOnlineByRoom((prev) => ({ ...prev, [data.roomId]: data.users }));
      }
    });
    return () => {
      mountedRef.current = false;
      offOnline?.();
    };
  }, [fetchRooms, onEvent]);

  const createRoom = useCallback(async (name, description) => {
    const { room } = await api.createRoom({ name, description });
    setRooms((prev) => [room, ...prev]);
    return room;
  }, []);

  const joinRoom = useCallback(async (id) => {
    await api.joinRoom(id);
  }, []);

  const leaveRoom = useCallback(async (id) => {
    await api.leaveRoom(id);
  }, []);

  const getOnlineUsers = useCallback(
    (roomId) => {
      return onlineByRoom[roomId] || [];
    },
    [onlineByRoom]
  );

  return {
    rooms,
    loading,
    error,
    onlineByRoom,
    getOnlineUsers,
    fetchRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    refresh: fetchRooms,
  };
}

export { useRooms };
