import { useRef, useEffect, useCallback } from "react";
import ChatMessageBubble from "./ChatMessageBubble";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import Button from "./Button";
import { useMessages } from "../hooks/useMessages";
import { useAuth } from "../context/AuthContext";

export default function ChatMessageList({
  roomId,
  onTypingStart,
  onTypingStop,
}) {
  const { user } = useAuth();
  const {
    messages,
    loading,
    loadingMore,
    hasMore,
    typers,
    loadOlder,
    sendMessage,
    startTyping,
    stopTyping,
  } = useMessages(roomId);

  const bottomRef = useRef(null);
  const listRef = useRef(null);
  const scrolledUpRef = useRef(false);

  useEffect(() => {
    if (!scrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 80;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    scrolledUpRef.current = !isNearBottom;
  }, []);

  const handleSend = useCallback(
    (text) => {
      sendMessage(text);
      stopTyping();
    },
    [sendMessage, stopTyping]
  );

  const handleTyping = useCallback(
    (text) => {
      if (text?.length > 0) {
        onTypingStart?.();
        startTyping();
      } else {
        onTypingStop?.();
        stopTyping();
      }
    },
    [onTypingStart, onTypingStop, startTyping, stopTyping]
  );

  const handleLoadOlder = useCallback(() => {
    loadOlder();
  }, [loadOlder]);

  const grouped = messages.reduce((acc, msg) => {
    const last = acc[acc.length - 1];
    if (last && last.senderId === msg.senderId) {
      last.items.push(msg);
    } else {
      acc.push({ senderId: msg.senderId, items: [msg] });
    }
    return acc;
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-1 py-2" ref={listRef} onScroll={handleScroll}>
        <div className="flex justify-center py-8">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-1 py-2" ref={listRef} onScroll={handleScroll}>
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
          <div className="text-3xl mb-2 opacity-40">💬</div>
          <div className="text-sm">No messages yet. Start the conversation.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-1 py-2 space-y-0.5"
        onScroll={handleScroll}
      >
        {grouped.map((group) => {
          const first = group.items[0];
          const isOwn =
            user?._id?.toString() === first.senderId?._id?.toString() ||
            user?.username === first.username;
          const alignRight = isOwn;
          const showAvatar = !alignRight;
          return group.items.map((msg, idx) => (
            <ChatMessageBubble
              key={msg._id}
              message={msg}
              isFirst={idx === 0}
              alignRight={alignRight}
              showAvatar={showAvatar}
            />
          ));
        })}
        <div ref={bottomRef} />
      </div>

      {typers.length > 0 && <TypingIndicator users={typers} />}

      {hasMore && !loadingMore && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <Button variant="ghost" size="sm" onClick={handleLoadOlder}>
            Load older messages
          </Button>
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="flex gap-1.5 text-xs text-[var(--text-muted)]">
            <span className="w-3 h-3 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            Loading older messages…
          </div>
        </div>
      )}

      {typers.length > 0 && <TypingIndicator users={typers} />}

      <MessageInput
        roomId={roomId}
        onSend={(text, action) => {
          if (action === "send") {
            handleSend(text);
          } else if (action === "typing") {
            handleTyping(text);
          }
        }}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
      />
    </div>
  );
}
