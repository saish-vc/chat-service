const API_BASE = "/api";

function getTokenFromCookie() {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1] || null;
}

export function getToken() {
  return getTokenFromCookie() || (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  headers["Content-Type"] = "application/json";
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = Object.assign(new Error(data.message || "Request failed"), {
      status: res.status,
      data,
    });
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  signup: (body) => request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  updateMe: (body) =>
    request("/auth/me", { method: "PUT", body: JSON.stringify(body) }),

  // Rooms
  listRooms: () => request("/rooms"),
  getRoom: (id) => request(`/rooms/${id}`),
  createRoom: (body) => request("/rooms", { method: "POST", body: JSON.stringify(body) }),
  joinRoom: (id) => request(`/rooms/${id}/join`, { method: "POST" }),
  leaveRoom: (id) => request(`/rooms/${id}/leave`, { method: "POST" }),

  // Messages (REST fallback)
  getMessages: (roomId, { limit = 50, before } = {}) => {
    const params = new URLSearchParams({ limit });
    if (before) params.set("before", before);
    return request(`/rooms/${roomId}/messages?${params}`);
  },
  sendMessage: (roomId, text) =>
    request(`/rooms/${roomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
};

export function setTokenInStorage(token) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function clearToken() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("token");
  }
  if (typeof document !== "undefined") {
    document.cookie = "token=; path=/; max-age=0";
  }
}
