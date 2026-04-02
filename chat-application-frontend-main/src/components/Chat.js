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

  useEffect(() => {
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
      console.log("STEP 3: Msg received by User B");

      if (data.sender === currentChat) {
        setMessages((prev) => {
          if (prev.find((m) => (m._id || m.id) === (data._id || data.id)))
            return prev;
          return [...prev, data];
        });

        const roomId = [user.username, data.sender].sort().join("_");
        console.log("STEP 3.5: User B active on this chat, sending SEEN");
        socket.emit("mark_messages_seen", {
          sender: data.sender,
          receiver: user.username,
          roomId,
        });
      } else {

        console.log(
          "STEP 3.5: User B is chatting with someone else, marking as DELIVERED only",
        );
        const roomId = [user.username, data.sender].sort().join("_");
        socket.emit("message_delivered", {
          messageId: data._id || data.id,
          roomId,
        });
      }
    });

    socket.on("status_updated", (data) => {
      console.log("STEP 6: Tick -> Delivered");
      setStatus((prev) => ({ ...prev, [data.messageId]: data.status }));
    });

    socket.on("all_messages_seen", (data) => {
      console.log("STEP 6: LOG 5 - UI turning BLUE");
      setStatus((prev) => {
        const newStatus = { ...prev };
        Object.keys(newStatus).forEach((id) => {
          newStatus[id] = "seen";
        });
        return newStatus;
      });
    });

    return () => {
      socket.off("receive_message");
      socket.off("status_updated");
      socket.off("all_messages_seen");
    };
  }, [currentChat, user.username]);

  const sendMessage = () => {
    if (!currentMessage.trim() || !currentChat) return;

    const roomId = [user.username, currentChat].sort().join("_");
    const tempId = `temp_${Date.now()}`;
    const msgData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
      roomId,
      _id: tempId,
    };

    setMessages((prev) => [...prev, msgData]);
    setStatus((prev) => ({ ...prev, [tempId]: "sent" }));

    socket.emit("send_message", msgData, (res) => {
      console.log("STEP 2.5: Real ID Syncing");

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, _id: res.id } : m)),
      );

      setStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[tempId];
        newStatus[res.id] = res.status;
        return newStatus;
      });
    });
    setCurrentMessage("");
  };

  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get("http://localhost:5001/messages", {
        params: { sender: user.username, receiver },
      });

      const initialStatus = {};
      data.forEach((m) => {
        initialStatus[m._id] = m.status || "sent";
      });
      setStatus(initialStatus);

      setMessages(data);

      const roomId = [user.username, receiver].sort().join("_");
      socket.emit("join_room", roomId);
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
          <div
            key={u._id}
            className={`chat-user ${currentChat === u.username ? "active" : ""}`}
            onClick={() => fetchMessages(u.username)}
          >
            {u.username}
          </div>
        ))}
      </div>
      {currentChat && (
        <div className="chat-window">
          <MessageList messages={messages} user={user} status={status} />
          <div className="message-field">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};
