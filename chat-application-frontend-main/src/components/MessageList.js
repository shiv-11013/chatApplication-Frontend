import React from "react";

const MessageList = ({ messages, user, status }) => {
  return (
    <div className="message-list">
      {messages.map((msg, index) => {
    
        const msgId = msg._id || msg.id;

        return (
          <div
            key={index}
            className={`message ${
              msg.sender === user.username ? "sent" : "received"
            }`}
          >
            <strong>{msg.sender}: </strong>
            {msg.message}

            <div style={{ fontSize: "11px", color: "gray", marginTop: "2px" }}>
              {msg.createdAt &&
                new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </div>

            {msg.sender === user.username && (
              <div
                className="status-ticks"
                style={{ textAlign: "right", fontSize: "12px" }}
              >
                {status[msgId] === "seen" ? (
                  <span style={{ color: "blue" }}>✔✔</span>
                ) : status[msgId] === "delivered" ? (
                  <span>✔✔</span>
                ) : status[msgId] === "sent" ? (
                  <span>✔</span>
                ) : (
                  <span className="loading-dots">...</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;