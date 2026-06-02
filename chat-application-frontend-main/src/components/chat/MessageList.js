import React, { useRef } from "react";

const MessageList = ({ messages, currentUsername, isLoading, error }) => {
  const listRef = useRef(null);

  const formatMessageTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <p className="message-state">Loading messages...</p>;
  }

  if (error) {
    return <p className="message-state message-state-error">{error}</p>;
  }

  if (messages.length === 0) {
    return (
      <p className="message-state">No messages yet. Start the conversation.</p>
    );
  }

  return (
    <div className="message-list" ref={listRef}>
      {messages.map((msg) => {
        const isSentByMe = msg.sender === currentUsername;

        return (
          <div
            key={msg._id}
            className={isSentByMe ? "message-row sent" : "message-row received"}
          >
            <p className="message-text">
              <strong>{isSentByMe ? "You" : msg.sender}:</strong> {msg.message}
            </p>

            <div className="message-meta">
              <small className="message-time">
                {formatMessageTime(msg.createdAt)}
              </small>

              {isSentByMe && (
                <span
                  className={
                    msg.status === "seen"
                      ? "message-status seen"
                      : "message-status"
                  }
                >
                  {msg.status === "sent" ? "✓" : "✓✓"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
