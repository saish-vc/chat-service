import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon,
    iconPosition = "left",
    className = "",
    ...props
  },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === "left" && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`input pl-4 pr-4 ${
            icon && iconPosition === "left" ? "pl-10" : ""
          } ${className}`}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            {icon}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
      {hint && !error && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
    </div>
  );
});

export { Input };
export default Input;
