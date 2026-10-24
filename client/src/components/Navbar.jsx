import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-3">
        <div className="avatar w-9 h-9 text-sm bg-[var(--accent)] text-white font-semibold">
          CW
        </div>
        <span className="text-xl font-bold text-[var(--text-primary)]">ChatWave</span>
      </div>
      <ThemeToggle />
    </div>
  );
}
