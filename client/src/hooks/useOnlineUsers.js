import { useState, useEffect, useCallback, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

function useOnlineUsers(roomId) {
  const { user } = useAuth();
  const { emit, onEvent, connected } = useSocketContext();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const mountedRef = useRef(true);
  const leaveRef = useRef(null);

  const join = useCallback(() => {
    if (!roomId || !user || !connected) return;
    emit("join_room", { roomId }, (res) => {
      if (res?.ok) setJoined(true);
    });
  }, [roomId, user, connected, emit]);

  const leave = useCallback(() => {
    if (!roomId || !connected) return;
    emit("leave_room", { roomId }, () => {
      setJoined(false);
    });
  }, [roomId, connected, emit]);

  const refreshOnline = useCallback(() => {
    if (!roomId) return;
    emit("get_online_users", { roomId }, (res) => {
      if (res?.users) setOnlineUsers(res.users);
    });
  }, [roomId, emit]);

  useEffect(() => {
    mountedRef.current = true;

    if (!roomId || !user) {
      setOnlineUsers([]);
      setJoined(false);
      return;
    }

    join();

    const offOnline = onEvent("online_users", (event, data) => {
      if (data?.roomId !== roomId) return;
      if (mountedRef.current) {
        setOnlineUsers(data.users || []);
      }
    });

    const offJoined = onEvent("user_joined", () => {
      refreshOnline();
    });

    const offLeft = onEvent("user_left", (event, data) => {
      if (data?.roomId !== roomId) return;
      if (mountedRef.current) {
        setOnlineUsers((prev) => prev.filter((u) => u._id !== data.userId));
      }
    });

    leaveRef.current = () => {
      leave();
    };

    return () => {
      mountedRef.current = false;
      offOnline?.();
      offJoined?.();
      offLeft?.();
    };
  }, [roomId, user, join, onEvent, emit, refreshOnline, leave]);

  useEffect(() => {
    if (!roomId || !joined) return;
    const t = setTimeout(() => {
      refreshOnline();
    }, 500);
    return () => clearTimeout(t);
  }, [roomId, joined, refreshOnline]);

  useEffect(() => {
    return () => {
      leaveRef.current?.();
    };
  }, []);

  return { onlineUsers, joined, join, leave, refresh: refreshOnline };
}

export { useOnlineUsers };
