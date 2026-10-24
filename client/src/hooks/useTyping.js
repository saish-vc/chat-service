import { useCallback, useRef, useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

function useTyping(roomId) {
  const { user } = useAuth();
  const { connected, emit } = useSocketContext();
  const timerRef = useRef(null);
  const activeRef = useRef(false);

  const start = useCallback(() => {
    if (!roomId || !user || !connected || activeRef.current) return;
    activeRef.current = true;
    emit("typing", { roomId, isTyping: true });
  }, [roomId, user, connected, emit]);

  const stop = useCallback(() => {
    if (!roomId || !user || !connected || !activeRef.current) return;
    activeRef.current = false;
    emit("typing", { roomId, isTyping: false });
  }, [roomId, user, connected, emit]);

  const notify = useCallback(
    (text) => {
      if (!text || text.trim().length === 0) {
        stop();
        return;
      }
      start();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        stop();
      }, 3000);
    },
    [start, stop]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      stop();
    };
  }, [stop]);

  return { start, stop, notify };
}

export { useTyping };
