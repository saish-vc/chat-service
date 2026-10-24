import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to your ChatWave account</p>
          </div>

          <div className="card p-6">
            <LoginForm />
          </div>

          <p className="mt-4 text-xs text-[var(--text-muted)] text-center">
            Forgot your password? Contact an admin to reset it.
          </p>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
      <footer className="text-center py-4 text-xs text-[var(--text-muted)]">
        ChatWave — Real-time chat, instantly.
      </footer>
    </div>
  );
}
