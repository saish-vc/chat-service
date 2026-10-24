import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  LandingPage,
  LoginPage,
  SignupPage,
  ChatPage,
  ProtectedRoute,
  HomePage,
  NotFoundPage,
} from "./pages";
import { useAuth } from "./context/AuthContext";
import { useSocketContext } from "./context/SocketContext";

function RootLayout({ children }) {
  const { user, loading } = useAuth();
  const { connect } = useSocketContext();
  const [didConnect, setDidConnect] = useState(false);

  useEffect(() => {
    if (!loading) {
      connect();
      setDidConnect(true);
    }
  }, [loading, connect]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <div className="text-sm">Loading…</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  const showLanding = !loading && !user;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <div className="text-sm">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={showLanding ? <LandingPage /> : <Navigate to="/home" replace />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/home" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/home" replace /> : <SignupPage />}
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/room/:id"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <RootLayout>
      <AppRoutes />
    </RootLayout>
  );
}
