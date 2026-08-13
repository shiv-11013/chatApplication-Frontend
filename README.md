# Chat Application — Frontend

React frontend for the chat app, talking to my Node/Express/Socket.IO backend. Handles login/register, the actual chat UI, and all the real-time bits — messages, typing indicator, delivered/seen ticks, online status.

Paired this with plain Bootstrap instead of a component library since the goal here was to get the socket logic right on the frontend side, not spend time on custom design — that's more the focus over in KaviosPix.

## Features

- Register / login
- JWT stored and sent on protected requests
- Real-time messaging
- Delivered + seen status (WhatsApp-style ticks)
- Typing indicator
- Unread message count
- Responsive-ish chat UI

## Stack

- React.js
- Socket.IO client
- Axios
- Bootstrap + some custom CSS

## Layout

```bash
chat-application-frontend-main/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── chat.css
│   │   ├── Chat.js
│   │   ├── Login.js
│   │   ├── MessageList.js
│   │   └── Register.js
│   │
│   ├── App.js
│   └── index.js
│
├── package.json
└── README.md
```

## Running it

```bash
git clone <your-repository-url>
cd chat-application-frontend-main
npm install
npm start
```

Runs on `http://localhost:3000`.

## Backend connection

Points at the local backend during dev and the deployed one otherwise:

- Local: `http://localhost:5001`
- Production: `https://chatapplication-backend-4nhj.onrender.com`

## Components, and what they're actually doing

**App.js** — top-level auth state, decides whether to render Login/Register or the Chat screen, handles logout.

**Register.js** / **Login.js** — pretty standard forms + Axios calls. Login stores the JWT in localStorage and flips the app's auth state so `App.js` knows to render the chat screen.

**Chat.js** — this is where basically everything real-time lives. Fetches the user list and message history over REST, then hands off to Socket.IO for anything live: sending/receiving messages, typing indicator, seen/delivered updates, unread counts, joining the right room. Honestly this component grew bigger than I'd like — if I revisit this project I'd split the socket-handling logic out into a custom hook instead of keeping it all inline here.

**MessageList.js** — purely rendering: takes messages and draws them out with timestamps and the tick icons (sent/delivered/seen).

## Auth flow

1. Register or log in — backend returns a JWT.
2. Token goes into localStorage.
3. Every protected API call sends it in the Authorization header.
4. Same token also authenticates the socket connection once the user's in the chat screen.

## Socket.IO — what the frontend sends and listens for

**Sends:**
```javascript
socket.emit("user_online", username);
socket.emit("join_room", roomId);
socket.emit("send_message", messageData);
socket.emit("typing", { sender, roomId });
socket.emit("mark_messages_seen", { sender, receiver, roomId });
```

**Listens for:**
```javascript
socket.on("receive_message", (data) => { ... });
socket.on("status_updated", (data) => { ... });
socket.on("all_messages_seen", (data) => { ... });
socket.on("user_typing", (sender) => { ... });
```

`join_room` happens right when a chat is opened, before anything else — makes sure the socket is actually listening in the right room before a message could come in for it. Missed this ordering in an early version and messages would occasionally not show up until a refresh.

## Message status — how the ticks actually update

- **Sent (single tick)** — message shows up locally right after `send_message` fires, before any confirmation comes back. Optimistic update, basically, so the UI doesn't feel laggy.
- **Delivered (double tick)** — updates when `status_updated` comes in telling us the receiver's client is online.
- **Seen (blue double tick)** — updates when `all_messages_seen` fires, meaning the receiver actually opened that chat.

## What's missing

- No profile pictures
- No dark mode
- No image sharing
- No group chat — one-on-one only right now
- No voice/video
- No emoji picker
- No browser notifications when a message comes in and the tab isn't focused
- Mobile layout works but isn't polished

## Author

Shiv Kumar
GitHub: https://github.com/shiv-11013
