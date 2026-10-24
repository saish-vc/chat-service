import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  connectSocket,
  disconnectSocket,
  onSocketEvent,
  isSocketConnected,
  getSocket,
} from "../services/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext({
  connected: false,
  connecting: false,
  error: null,
  connect: () => {},
  disconnect: () => {},
  emit: () => {},
  onEvent: () => {},
  getSocket: () => null,
});

export function SocketProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const offRef = useRef(null);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    setConnecting(true);
    setError(null);
    try {
      connectSocket();
    } catch (e) {
      setError(e.message);
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setConnected(false);
    setConnecting(false);
  }, []);

  useEffect(() => {
    if (!authLoading && mountedRef.current) {
      connect();
    }
  }, [authLoading, user]);

  useEffect(() => {
    mountedRef.current = true;
    const off = onSocketEvent((event, ...args) => {
      if (!mountedRef.current) return;
      if (event === "connect") setConnected(true);
      if (event === "disconnect") setConnected(false);
      if (event === "connect_error") {
        setConnecting(false);
        setError(args[0] || "Connection error");
      }
    });

    offRef.current = off;
    return () => {
      mountedRef.current = false;
      off?.();
    };
  }, []);

  const emit = useCallback((event, data, cb) => {
    const s = getSocket();
    if (s?.connected) {
      if (cb) s.emit(event, data, cb);
      else s.emit(event, data);
    }
  }, []);

  const onEvent = useCallback((event, handler) => {
    return onSocketEvent(event, handler);
  }, []);

  const value = {
    connected,
    connecting,
    error,
    connect,
    disconnect,
    emit,
    onEvent,
    getSocket: () => getSocket(),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  return useContext(SocketContext);
}
