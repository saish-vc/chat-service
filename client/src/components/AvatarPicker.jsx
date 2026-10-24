const PALETTE = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#64748b",
];

export default function AvatarPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-elevated)] ${
            value === color
              ? "ring-2 ring-offset-2 ring-offset-[var(--bg-elevated)] ring-[var(--text-primary)]"
              : ""
          }`}
          style={{ backgroundColor: color }}
          title={color}
          aria-label={`Select ${color} avatar color`}
          aria-pressed={value === color}
        />
      ))}
    </div>
  );
}
