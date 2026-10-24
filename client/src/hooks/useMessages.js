import { useState, useCallback, useRef, useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

function useMessages(roomId) {
  const { emit, onEvent } = useSocketContext();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [typers, setTypers] = useState([]);
  const oldestRef = useRef(null);

  const loadHistory = useCallback(async (reset = false) => {
    if (!roomId) return;
    if (reset) {
      setLoading(true);
      oldestRef.current = null;
    } else {
      setLoadingMore(true);
    }
    try {
      const { messages: fetched } = await api.getMessages(roomId, {
        limit: 50,
        before: oldestRef.current || undefined,
      });
      if (reset) {
        setMessages(fetched);
      } else {
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m._id));
          const added = fetched.filter((m) => !seen.has(m._id));
          return [...prev, ...added];
        });
      }
      if (fetched.length < 50) {
        setHasMore(false);
      } else {
        const last = fetched[fetched.length - 1];
        oldestRef.current = last?._id || oldestRef.current;
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
    }
  }, [roomId]);

  const loadInitial = useCallback(() => {
    if (!roomId) return;
    oldestRef.current = null;
    setHasMore(true);
    loadHistory(true);
  }, [roomId, loadHistory]);

  const loadOlder = useCallback(() => {
    if (!loadingMore && hasMore && oldestRef.current) {
      loadHistory(false);
    }
  }, [loadingMore, hasMore, oldestRef, loadHistory]);

  const sendMessage = useCallback(
    (text, cb) => {
      if (!roomId || !text.trim()) return;
      const payload = text.trim();
      if (user) {
        emit("send_message", { roomId, text: payload }, (res) => {
          if (res?.error) {
            api
              .sendMessage(roomId, payload)
              .then((data) => cb?.(data.message))
              .catch(() => {});
            return;
          }
          cb?.(res?.message);
        });
      } else {
        api
          .sendMessage(roomId, payload)
          .then((data) => cb?.(data.message))
          .catch(() => {});
      }
    },
    [roomId, user, emit]
  );

  const startTyping = useCallback(() => {
    if (!roomId || !user) return;
    emit("typing", { roomId, isTyping: true });
  }, [roomId, user, emit]);

  const stopTyping = useCallback(() => {
    if (!roomId || !user) return;
    emit("typing", { roomId, isTyping: false });
  }, [roomId, user, emit]);

  useEffect(() => {
    if (!roomId) return;
    const offMessage = onEvent("receive_message", (event, data) => {
      if (data?.message && data.message.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    });

    const offTyping = onEvent("typing", (event, data) => {
      if (data?.roomId !== roomId) return;
      if (data?.stopped) {
        setTypers((prev) => prev.filter((t) => t.userId !== data.userId));
      } else {
        setTypers((prev) => {
          if (prev.some((t) => t.userId === data.userId)) return prev;
          return [
            ...prev,
            {
              userId: data.userId,
              username: data.username,
              avatarColor: data.avatarColor,
            },
          ];
        });
      }
    });

    return () => {
      offMessage?.();
      offTyping?.();
    };
  }, [roomId, onEvent]);

  useEffect(() => {
    setMessages([]);
    setTypers([]);
    setHasMore(true);
    oldestRef.current = null;
    loadInitial();
  }, [roomId, loadInitial]);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    typers,
    loadOlder,
    sendMessage,
    startTyping,
    stopTyping,
    refresh: loadInitial,
  };
}

export { useMessages };
