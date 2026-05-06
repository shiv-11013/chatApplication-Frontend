# Chat Application (Frontend)

Real-time chat application frontend built with React.js, Socket.IO, Axios, and Bootstrap.

## Features

* User Registration
* User Login
* JWT Authentication
* Real-time Messaging
* Message Delivery Status
* Seen Message Status
* Typing Indicator
* Unread Message Count
* Online User Communication
* Responsive Chat UI

---

# Tech Stack

* React.js
* Socket.IO Client
* Axios
* Bootstrap
* CSS

---

# Project Structure

```bash
chat-application-frontend-main/
│
├── node_modules/
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   ├── chat.css
│   │   ├── Chat.js
│   │   ├── Login.js
│   │   ├── MessageList.js
│   │   └── Register.js
│   │
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   ├── setupTests.js
│   └── styles.css
│
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

---

# Installation

## 1. Clone Repository

```bash
git clone <your-repository-url>
```

## 2. Move Into Project Folder

```bash
cd chat-application-frontend-main
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start Frontend

```bash
npm start
```

Frontend runs on:

```bash
http://localhost:3000
```

---

# Backend Connection

Frontend automatically switches between local backend and deployed backend.

## Local Backend

```bash
http://localhost:5001
```

## Production Backend

```bash
https://chatapplication-backend-4nhj.onrender.com
```

---

# Components

## App.js

Main application component.

Responsibilities:

* Authentication state handling
* Login/Register rendering
* Logout functionality
* Chat component rendering

---

## Register.js

Handles:

* User registration
* API request using Axios
* Success and error handling

---

## Login.js

Handles:

* User login
* JWT token storage
* LocalStorage management
* Authentication state update

---

## Chat.js

Main real-time chat component. 

Features:

* Fetch users
* Fetch messages
* Real-time messaging
* Socket.IO integration
* Typing indicator
* Seen status
* Delivered status
* Unread message count
* Room-based communication

---

## MessageList.js

Handles:

* Rendering messages
* Message timestamps
* Status ticks display
* Sent/Delivered/Seen UI

---

# Authentication Flow

1. User registers or logs in.
2. Backend returns JWT token.
3. Token stored in localStorage.
4. Protected backend APIs use Authorization header.
5. User accesses chat system.

---

# Socket.IO Events

## Client Emit Events

### User Online

```javascript
socket.emit("user_online", username);
```

### Join Room

```javascript
socket.emit("join_room", roomId);
```

### Send Message

```javascript
socket.emit("send_message", messageData);
```

### Typing Event

```javascript
socket.emit("typing", {
  sender,
  roomId,
});
```

### Mark Seen

```javascript
socket.emit("mark_messages_seen", {
  sender,
  receiver,
  roomId,
});
```

---

## Client Listen Events

### Receive Message

```javascript
socket.on("receive_message", (data) => {});
```

### Status Updated

```javascript
socket.on("status_updated", (data) => {});
```

### All Messages Seen

```javascript
socket.on("all_messages_seen", (data) => {});
```

### User Typing

```javascript
socket.on("user_typing", (sender) => {});
```

---

# Message Status System

## ✔ Sent

Message stored locally and sent to backend.

## ✔✔ Delivered

Receiver is online and message delivered.

## ✔✔ Blue

Receiver opened the chat and message seen.

---

# Run Locally

## Install Packages

```bash
npm install
```

## Start Frontend

```bash
npm start
```

---

# Future Improvements

* Add profile pictures
* Add dark mode
* Add image sharing
* Add group chat
* Add voice/video calls
* Add emoji support
* Add notifications
* Add responsive mobile UI improvements

---

# Author

Shiv Kumar

GitHub:
[https://github.com/shiv-11013](https://github.com/shiv-11013)
