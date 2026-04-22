# Chat Application (Frontend)

This is a real-time chat application frontend built using React.
Users can register, login, and chat with other users in real time.

The application is connected to a backend using REST APIs and Socket.IO for real-time communication.

---

## Live Demo

https://chat-application-frontend-plum-theta.vercel.app/

---

## Features

- User registration and login
- Real-time messaging using Socket.IO
- Message status (sent, delivered, seen)
- Typing indicator
- One-to-one chat between users
- Responsive UI using Bootstrap

---

## Tech Stack

- React
- Axios
- Socket.IO Client
- Bootstrap

---

## Project Structure

- Login and Register components for authentication
- Chat component handles real-time messaging and socket connection
- MessageList component displays messages with timestamp and status

---

## How It Works

- User logs in or registers
- App connects to the backend server
- Users list is fetched from the API
- When a user opens a chat:
  - Previous messages are loaded
  - A socket room is joined

- Messages are sent and received in real time
- Message status is updated (✔ sent, ✔✔ delivered, ✔✔ blue seen)
- Typing event is emitted and shown in UI

---

## API Base URL

The app automatically switches between local and deployed backend:

- Local: http://localhost:5001
- Production: https://chatapplication-backend-4nhj.onrender.com

---

## Run Locally

npm install
npm start

---

## Notes

- Backend is required for full functionality
- Socket connection is initialized on app load
- Temporary message IDs are used before server response
- Message status is updated based on socket events

---

## Future Improvements

- Add JWT authentication
- Improve UI/UX
- Add notifications
- Add group chat

---

## Author

Shiv Kumar

GitHub: https://github.com/shiv-11013/chatApplication-Frontend
Email: shivkumar121112@gmail.com
