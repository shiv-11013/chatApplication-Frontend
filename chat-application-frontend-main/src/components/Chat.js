import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";

const socket = io("http://localhost:5001");

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [status, setStatus] = useState({});
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    socket.emit("user_online", user.username);

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/users", {
          params: { currentUser: user.username },
        });
        setUsers(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();

    socket.on("receive_message", (data) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });

      const roomId = [user.username, data.sender].sort().join("_");

      if (data.sender === currentChat) {
        socket.emit("mark_messages_seen", {
          sender: data.sender,
          receiver: user.username,
          roomId,
        });
      } else {
        socket.emit("message_delivered", {
          messageId: data._id,
          roomId,
        });
      }
    });

    socket.on("status_updated", (data) => {
      setStatus((prev) => ({
        ...prev,
        [data.messageId]: data.status,
      }));
    });

    socket.on("all_messages_seen", () => {
      setStatus((prev) => {
        const updated = { ...prev };
        for (let key in updated) {
          updated[key] = "seen";
        }
        return updated;
      });
    });

    socket.on("user_typing", (sender) => {
      setTypingUser(sender);
      setTimeout(() => setTypingUser(""), 1000);
    });

    return () => {
      socket.off("receive_message");
      socket.off("status_updated");
      socket.off("all_messages_seen");
      socket.off("user_typing");
    };
  }, [currentChat, user.username]);

  const sendMessage = () => {
    if (!currentMessage || !currentChat) return;

    const roomId = [user.username, currentChat].sort().join("_");

    const tempId = Date.now().toString();

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
      roomId,
    };

    // show instantly (green + time)
    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        _id: tempId,
        createdAt: new Date(),
      },
    ]);

    // set single tick
    setStatus((prev) => ({
      ...prev,
      [tempId]: "sent",
    }));

    socket.emit("send_message", messageData, (res) => {
      setStatus((prev) => {
        const updated = { ...prev };
        delete updated[tempId];
        updated[res.id] = res.status;
        return updated;
      });

      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId ? { ...m, _id: res.id } : m
        )
      );
    });

    setCurrentMessage("");
  };

  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get("http://localhost:5001/messages", {
        params: { sender: user.username, receiver },
      });

      setMessages(data);

      const initialStatus = {};
      for (let i = 0; i < data.length; i++) {
        initialStatus[data[i]._id] = data[i].status || "sent";
      }
      setStatus(initialStatus);

      const roomId = [user.username, receiver].sort().join("_");

      socket.emit("join_room", roomId);

      // delivered for old messages
      for (let i = 0; i < data.length; i++) {
        if (data[i].status === "sent" && data[i].receiver === user.username) {
          socket.emit("message_delivered", {
            messageId: data[i]._id,
            roomId,
          });
        }
      }

      // mark seen
      socket.emit("mark_messages_seen", {
        sender: receiver,
        receiver: user.username,
        roomId,
      });

      setCurrentChat(receiver);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-list">
        <h3>Chats</h3>
        {users.map((u) => (
          <div key={u._id} onClick={() => fetchMessages(u.username)}>
            {u.username}
          </div>
        ))}
      </div>

      {currentChat && (
        <div className="chat-window">
          <MessageList messages={messages} user={user} status={status} />

          {typingUser === currentChat && (
            <p>{typingUser} is typing...</p>
          )}

          <input
            value={currentMessage}
            onChange={(e) => {
              setCurrentMessage(e.target.value);

              const roomId = [user.username, currentChat].sort().join("_");

              socket.emit("typing", {
                sender: user.username,
                roomId,
              });
            }}
          />

          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};