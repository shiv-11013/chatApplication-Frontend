import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { BASE_URL } from "../../config/api";
import MessageList from "./MessageList";
import { upload } from "@imagekit/javascript";
import "../../styles/chat.css";

const socket = io(BASE_URL, {
  autoConnect: false,
});

export const Chat = ({ user, setUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const [currentUserAvatar, setCurrentUserAvatar] = useState(user.avatar || "");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedUserRef = useRef(null);
  const currentRoomIdRef = useRef("");
  const messagesAreaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?._id;
  const forceScrollToLatestRef = useRef(false);
  const userIsNearBottomRef = useRef(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
    currentRoomIdRef.current = currentRoomId;
  }, [selectedUser, currentRoomId]);

  useEffect(() => {
    if (isMessagesLoading || messages.length === 0) return;

    const shouldScroll =
      forceScrollToLatestRef.current || userIsNearBottomRef.current;

    if (!shouldScroll) return;

    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const messagesArea = messagesAreaRef.current;
        if (!messagesArea) return;

        messagesArea.scrollTop = messagesArea.scrollHeight;
        forceScrollToLatestRef.current = false;
        userIsNearBottomRef.current = true;
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [
    isMessagesLoading,
    messages.length,
    lastMessageId,
    lastMessage?.sender,
    user.username,
  ]);

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
      const isIncomingMessage = savedMessage.receiver === user.username;
      const isCurrentOpenChat = savedMessage.sender === selectedUserRef.current;
      if (isIncomingMessage && !isCurrentOpenChat) {
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

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user_typing", ({ sender }) => {
      if (sender === selectedUserRef.current) {
        setTypingUser(sender);
      }
    });

    socket.on("user_stopped_typing", ({ sender }) => {
      if (sender === selectedUserRef.current) {
        setTypingUser("");
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("message_status_updated");
      socket.off("unread_counts");
      socket.off("online_users");
      socket.off("user_typing");
      socket.off("user_stopped_typing");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
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

  const stopTyping = (roomId = currentRoomIdRef.current) => {
    if (!roomId || !isTypingRef.current) return;
    socket.emit("typing_stopped", { roomId, sender: user.username });
    isTypingRef.current = false;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleMessagesAreaScroll = () => {
    const messagesArea = messagesAreaRef.current;
    if (!messagesArea) return;
    const distanceFromBottom =
      messagesArea.scrollHeight -
      messagesArea.scrollTop -
      messagesArea.clientHeight;
    userIsNearBottomRef.current = distanceFromBottom < 120;
  };

  const handleSelectUser = async (selectedUsername) => {
    stopTyping(currentRoomIdRef.current);
    forceScrollToLatestRef.current = true;
    userIsNearBottomRef.current = true;
    setTypingUser("");
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

      console.log("messages count", data.length);
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

  const handleMessageChange = (event) => {
    const value = event.target.value;
    setMessage(value);

    if (!selectedUserRef.current || !currentRoomIdRef.current) return;

    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!isTypingRef.current) {
      socket.emit("typing_started", {
        roomId: currentRoomIdRef.current,
        sender: user.username,
      });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(), 900);
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
    stopTyping();
  };

  const isSendDisabled = !message.trim() || !selectedUser || !currentRoomId;
  const selectedUserIsOnline = selectedUser
    ? onlineUsers.includes(selectedUser)
    : false;

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setAvatarError("Image must be less than 1MB.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setIsAvatarUploading(true);
      setAvatarError("");

      const { data: authParams } = await axios.get(`${BASE_URL}/upload/auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const uploadResponse = await upload({
        file,
        fileName: `avatar-${user.username}-${Date.now()}-${file.name}`,
        folder: "/chat-app/avatars",
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
        publicKey: authParams.publicKey,
      });

      const { data } = await axios.patch(
        `${BASE_URL}/users/avatar`,
        { avatar: uploadResponse.url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const savedUser = JSON.parse(localStorage.getItem("user")) || user;
      const updatedUser = {
        ...savedUser,
        avatar: data.user.avatar,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUserAvatar(data.user.avatar);

      if (setUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      setAvatarError(
        error.response?.data?.message || "Could not update profile photo.",
      );
    } finally {
      setIsAvatarUploading(false);
      event.target.value = "";
    }
  };

  const selectedChatUser = users.find(
    (chatUser) => chatUser.username === selectedUser,
  );

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="chat-shell">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <label className="current-user-avatar" htmlFor="profile-avatar">
            {currentUserAvatar ? (
              <img src={currentUserAvatar} alt={user.username} />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </label>

          <div>
            <h2>Chats</h2>
            <p>{isAvatarUploading ? "Uploading photo..." : user.username}</p>
            {avatarError && <span className="avatar-error">{avatarError}</span>}
          </div>

          <input
            id="profile-avatar"
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoChange}
            disabled={isAvatarUploading}
          />
        </div>

        <div className="chat-search">
          <input
            className="chat-search-input"
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="chat-user-list">
          {filteredUsers.map((chatUser) => {
            const isOnline = onlineUsers.includes(chatUser.username);
            return (
              <button
                key={chatUser._id}
                onClick={() => handleSelectUser(chatUser.username)}
                className={
                  selectedUser === chatUser.username
                    ? "chat-user-button active"
                    : "chat-user-button"
                }
              >
                <span className="chat-user-main">
                  <span className="chat-user-avatar">
                    {chatUser.avatar ? (
                      <img src={chatUser.avatar} alt={chatUser.username} />
                    ) : (
                      chatUser.username.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="chat-user-info">
                    <span className="chat-user-name">{chatUser.username}</span>
                    <span
                      className={
                        isOnline
                          ? "chat-user-status online"
                          : "chat-user-status"
                      }
                    >
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </span>
                </span>
                {unreadCounts[chatUser.username] > 0 && (
                  <span className="chat-unread-badge">
                    {unreadCounts[chatUser.username]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-main-header">
          {selectedUser ? (
            <div className="chat-header-user">
              <span className="chat-header-avatar">
                {selectedChatUser?.avatar ? (
                  <img src={selectedChatUser.avatar} alt={selectedUser} />
                ) : (
                  selectedUser.charAt(0).toUpperCase()
                )}
              </span>
              <div>
                <h2>{selectedUser}</h2>
                <p className={typingUser ? "typing-text" : ""}>
                  {typingUser
                    ? `${typingUser} is typing...`
                    : selectedUserIsOnline
                      ? "Online"
                      : "Offline"}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2>Select a chat</h2>
              <p>Choose a user to start messaging.</p>
            </div>
          )}
        </header>

        <section
          className="chat-messages-area"
          ref={messagesAreaRef}
          onScroll={handleMessagesAreaScroll}
        >
          <MessageList
            messages={messages}
            currentUsername={user.username}
            isLoading={isMessagesLoading}
            error={messagesError}
            messagesEndRef={messagesEndRef}
          />
        </section>

        {selectedUser && (
          <footer className="chat-composer">
            <input
              className="chat-input"
              value={message}
              onChange={handleMessageChange}
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
