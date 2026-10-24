import { io } from "socket.io-client";
import { getToken, clearToken } from "../utils/api";

let socket = null;
const eventListeners = new Map();
const allListeners = new Set();
let reconnectAttempts = 0;

function notifyListeners(event, ...args) {
  for (const h of allListeners) {
    try {
      h(event, ...args);
    } catch (err) {
      console.error("Socket allListener error:", err);
    }
  }
  const handlers = eventListeners.get(event);
  if (handlers) {
    for (const h of handlers) {
      try {
        h(event, ...args);
      } catch (err) {
        console.error("Socket listener error:", err);
      }
    }
  }
}

function buildSocket() {
  if (socket?.connected) return socket;

  const token = getToken();
  const newSocket = io("/", {
    path: "/socket.io",
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 800,
    reconnectionDelayMax: 3000,
    timeout: 12000,
    auth: token ? { token } : {},
    transports: ["websocket", "polling"],
  });

  newSocket.on("connect", () => {
    reconnectAttempts = 0;
    notifyListeners("connect", null);
    const currentToken = getToken();
    if (currentToken) {
      newSocket.emit("authenticate", currentToken, (res) => {
        if (res?.error) {
          console.error("Socket auth failed:", res.error);
        }
      });
    }
  });

  newSocket.on("disconnect", (reason) => {
    notifyListeners("disconnect", reason);
    reconnectAttempts++;
  });

  newSocket.on("connect_error", (err) => {
    console.warn("Socket connect_error:", err.message);
    notifyListeners("connect_error", err.message);
  });

  const eventNames = [
    "receive_message",
    "user_joined",
    "user_left",
    "typing",
    "online_users",
    "joined_room",
    "error",
  ];
  for (const name of eventNames) {
    newSocket.on(name, (...args) => {
      notifyListeners(name, ...args);
    });
  }

  socket = newSocket;
  return newSocket;
}

export function useSocket() {
  return socket;
}

export function getSocket() {
  return socket || buildSocket();
}

export function connectSocket() {
  const token = getToken();
  if (!socket) {
    socket = buildSocket();
  } else {
    if (token) {
      socket.auth = { token };
    }
    if (!socket.connected) {
      socket.connect();
    } else if (token) {
      socket.emit("authenticate", token);
    }
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}

export function onSocketEvent(eventOrHandler, maybeHandler) {
  if (typeof eventOrHandler === "function") {
    const handler = eventOrHandler;
    allListeners.add(handler);
    return () => {
      allListeners.delete(handler);
    };
  }
  const event = eventOrHandler;
  const handler = maybeHandler;
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event).add(handler);
  return () => {
    eventListeners.get(event)?.delete(handler);
  };
}

export function emit(event, data, cb) {
  const s = getSocket();
  if (s && s.connected) {
    if (cb) s.emit(event, data, cb);
    else s.emit(event, data);
  } else {
    console.warn("Socket not connected; cannot emit", event);
  }
}

export function isSocketConnected() {
  return socket?.connected ?? false;
}

export { socket };
