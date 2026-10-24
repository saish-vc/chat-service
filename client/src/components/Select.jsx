import { forwardRef } from "react";

const Select = forwardRef(function Select(
  { label, error, hint, children, className = "", ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`input appearance-none cursor-pointer bg-[var(--bg-elevated)] ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
      {hint && !error && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
    </div>
  );
});

export { Select };
export default Select;
