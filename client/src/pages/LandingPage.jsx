import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Avatar from "../components/Avatar";

const FEATURES = [
  {
    icon: "🔒",
    title: "Secure by default",
    description:
      "Passwords are hashed with bcrypt and sessions are protected with JWTs. Your data stays yours.",
  },
  {
    icon: "⚡",
    title: "Real-time messaging",
    description:
      "Messages, typing indicators, and presence updates arrive in milliseconds via Socket.IO — no refresh needed.",
  },
  {
    icon: "🏠",
    title: "Rooms for every topic",
    description:
      "Create public rooms, invite members, and keep conversations organized by topic or project.",
  },
  {
    icon: "🕯",
    title: "Full message history",
    description:
      "Every message is stored and paginated. Pick up a conversation right where you left off.",
  },
  {
    icon: "🎨",
    title: "Your look, your way",
    description:
      "Pick an avatar color and display name. Toggle between dark and light mode anytime.",
  },
  {
    icon: "📱",
    title: "Works everywhere",
    description:
      "Responsive layout that feels at home on desktop, tablet, and phone.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 chip bg-[var(--accent-soft)] text-[var(--accent)] mb-6 border border-[var(--accent)]/20">
            <span>Now in public beta</span>
          </div>
          <h1 className="text-5xl font-bold text-[var(--text-primary)] leading-tight mb-5">
            Chat that<span className="text-[var(--accent)]"> just works</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
            ChatWave brings real-time messaging, rooms, and presence together in a
            modern interface you'll actually enjoy using.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/login" className="inline-block">
              <Button size="lg">Sign in</Button>
            </Link>
            <Link to="/signup" className="inline-block">
              <Button variant="outline" size="lg">
                Create free account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Everything you'd expect from a modern chat app
            </h2>
            <p className="text-[var(--text-secondary)]">
              Built for real conversations, not just messages in a void.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card p-5 flex gap-4 hover:shadow-md transition-shadow"
              >
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                    {f.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-xl mx-auto card p-8 text-center bg-[var(--accent-soft)] border-[var(--accent)]/20">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Ready to start chatting?
          </h2>
          <p className="text-[var(--text-secondary)] mb-5">
            Join ChatWave in under a minute. No downloads, no setup.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="inline-block">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link to="/login" className="inline-block">
              <Button variant="ghost" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-sm text-[var(--text-muted)]">
                12+ users online right now
              </span>
            </div>
            <div className="flex -space-x-2 flex-wrap justify-center">
              {["#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6"]
                .map((c, i) => (
                  <Avatar username={`user${i}`} color={c} size={40} key={c} showSize={false} />
                ))}
              <div className="avatar w-10 h-10 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] text-sm border-2 border-[var(--bg-primary)] flex items-center justify-center flex-shrink-0">
                +10
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-muted)]">
        <p>ChatWave — Real-time chat, instantly.</p>
      </footer>
    </div>
  );
}
