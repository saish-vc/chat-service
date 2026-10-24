import { useState, useRef, useCallback, useEffect } from "react";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";

export default function MessageInput({
  roomId,
  onTypingStart,
  onTypingStop,
  onSend,
  placeholder = "Message #general",
  maxLength = 2000,
}) {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (roomId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [roomId]);

  const handleChange = useCallback(
    (e) => {
      const v = e.target.value;
      setValue(v);
      if (!focusedRef.current) {
        focusedRef.current = true;
        onTypingStart?.();
      }
      if (v.length > 0) {
        onSend?.(v, "typing");
      } else {
        onTypingStop?.();
      }
    },
    [onTypingStart, onTypingStop, onSend]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const v = value.trim();
        if (!v) return;
        setValue("");
        focusedRef.current = false;
        onSend?.(v, "send");
      }
    },
    [value, onSend]
  );

  const handleBlur = useCallback(() => {
    focusedRef.current = false;
    onTypingStop?.();
  }, [onTypingStop]);

  const canSend = value.trim().length > 0 && value.trim().length <= maxLength;

  return (
    <div className="flex items-end gap-2 px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            focusedRef.current = true;
            onTypingStart?.();
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={1}
          maxLength={maxLength + 1}
          className="input resize-none rounded-xl px-3 py-2 text-sm leading-relaxed min-h-[40px] max-h-32 scrollbar-thin"
          style={{
            fieldSizing: "content",
            paddingBottom: "4px",
          }}
          aria-label="Message text"
        />
        {value.length > maxLength - 20 && value.length > 0 && (
          <div className="absolute bottom-1 right-2 text-[10px] text-[var(--text-muted)]">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={() => {
          const v = value.trim();
          if (!v) return;
          setValue("");
          focusedRef.current = false;
          onSend?.(v, "send");
        }}
        disabled={!canSend}
        className="rounded-xl px-3 py-2 flex-shrink-0"
        aria-label="Send message"
      >
        Send
      </Button>
    </div>
  );
}
