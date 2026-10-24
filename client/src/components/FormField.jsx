import { forwardRef } from "react";

const FormField = forwardRef(function FormField(
  { label, error, hint, children, className = "", required },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
          {required && <span className="text-[var(--danger)] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
      {hint && !error && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
    </div>
  );
});

export { FormField };
export default FormField;
