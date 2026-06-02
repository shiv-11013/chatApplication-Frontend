import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { BASE_URL } from "../../config/api";
import MessageList from "./MessageList";
import "../../styles/chat.css";

const socket = io(BASE_URL, {
  autoConnect: false,
});

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  const selectedUserRef = useRef(null);
  const currentRoomIdRef = useRef("");
  const messagesAreaRef = useRef(null);

  const lastMessageId = messages[messages.length - 1]?._id;

  useEffect(() => {
    selectedUserRef.current = selectedUser;
    currentRoomIdRef.current = currentRoomId;
  }, [selectedUser, currentRoomId]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (messagesAreaRef.current) {
        messagesAreaRef.current.scrollTop =
          messagesAreaRef.current.scrollHeight;
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [messages.length, lastMessageId]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Frontend socket connected:", socket.id);
      socket.emit("user_online", user.username);
    });

    socket.on("disconnect", () => {
      console.log("Frontend socket disconnected");
    });

    socket.on("receive_message", (savedMessage) => {
      if (
        savedMessage.sender !== selectedUserRef.current &&
        savedMessage.sender !== user.username
      ) {
        return setUnreadCounts((prev) => ({
          ...prev,
          [savedMessage.sender]: (prev[savedMessage.sender] || 0) + 1,
        }));
      }
      setMessages((prevMessages) => {
        const alreadyExists = prevMessages.some(
          (msg) => msg._id === savedMessage._id,
        );

        if (alreadyExists) return prevMessages;

        return [...prevMessages, savedMessage];
      });

      const isIncomingMessage = savedMessage.receiver === user.username;
      const isCurrentOpenChat = savedMessage.sender === selectedUserRef.current;

      if (isIncomingMessage && isCurrentOpenChat) {
        socket.emit("mark_messages_seen", {
          sender: savedMessage.sender,
          receiver: user.username,
          roomId: currentRoomIdRef.current,
        });
      }
    });

    socket.on("message_status_updated", ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg,
        ),
      );
    });

    socket.on("unread_counts", (counts) => {
      setUnreadCounts(counts);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("message_status_updated");
      socket.off("unread_counts");
      socket.disconnect();
    };
  }, [user.username]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(`${BASE_URL}/users`, {
          params: { currentUser: user.username },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(data);
      } catch (error) {
        console.error(
          "Failed to fetch users:",
          error.response?.data || error.message,
        );
      }
    };

    fetchUsers();
  }, [user.username]);

  const handleSelectUser = async (selectedUsername) => {
    const roomId = [user.username, selectedUsername].sort().join("_");

    setSelectedUser(selectedUsername);
    setCurrentRoomId(roomId);
    setMessages([]);
    setIsMessagesLoading(true);
    setMessagesError("");

    socket.emit("join_room", roomId);
    setUnreadCounts((prev) => ({
      ...prev,
      [selectedUsername]: 0,
    }));
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${BASE_URL}/messages`, {
        params: {
          sender: user.username,
          receiver: selectedUsername,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(data);

      socket.emit("mark_messages_seen", {
        sender: selectedUsername,
        receiver: user.username,
        roomId,
      });
    } catch (error) {
      console.error(
        "Failed to fetch messages:",
        error.response?.data || error.message,
      );

      setMessagesError("Could not load messages. Please try again.");
    } finally {
      setIsMessagesLoading(false);
    }

    console.log("Joined room:", roomId);
  };

  const handleSendMessage = () => {
    const text = message.trim();

    if (!text || !selectedUser || !currentRoomId) return;

    socket.emit("send_message", {
      sender: user.username,
      receiver: selectedUser,
      message: text,
      roomId: currentRoomId,
    });

    setMessage("");
  };

  const isSendDisabled = !message.trim() || !selectedUser || !currentRoomId;

  return (
    <div className="chat-shell">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Chats</h2>
          <p>{user.username}</p>
        </div>

        <div className="chat-user-list">
          {users.map((chatUser) => (
            <button
              key={chatUser._id}
              onClick={() => handleSelectUser(chatUser.username)}
              className={
                selectedUser === chatUser.username
                  ? "chat-user-button active"
                  : "chat-user-button"
              }
            >
              <span>{chatUser.username}</span>
              {unreadCounts[chatUser.username] > 0 && (
                <span className="chat-unread-badge">
                  {unreadCounts[chatUser.username]}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-main-header">
          {selectedUser ? (
            <div>
              <h2>{selectedUser}</h2>
              <p>Active conversation</p>
            </div>
          ) : (
            <div>
              <h2>Select a chat</h2>
              <p>Choose a user to start messaging.</p>
            </div>
          )}
        </header>

        <section className="chat-messages-area" ref={messagesAreaRef}>
          <MessageList
            messages={messages}
            currentUsername={user.username}
            isLoading={isMessagesLoading}
            error={messagesError}
          />
        </section>

        {selectedUser && (
          <footer className="chat-composer">
            <input
              className="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder="Type a message"
            />

            <button
              className="chat-send-button"
              onClick={handleSendMessage}
              disabled={isSendDisabled}
            >
              Send
            </button>
          </footer>
        )}
      </main>
    </div>
  );
};
