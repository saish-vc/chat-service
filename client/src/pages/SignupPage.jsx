import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SignupForm from "../components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Join ChatWave</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Create your account in seconds</p>
          </div>

          <div className="card p-6">
            <SignupForm />
          </div>

          <p className="mt-4 text-xs text-[var(--text-muted)] text-center leading-relaxed">
            By creating an account you agree to our use of your email and username
            to identify you in chat.
          </p>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition"
            >
              Sign in
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
