import React, { useState } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { Chat } from "./components/chat/Chat";
import "./App.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Chat App</h1>

        {user && (
          <button className="app-logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      {!user ? (
        <main className="auth-page">
          <div className="auth-grid">
            <Register setUser={setUser} />
            <Login setUser={setUser} />
          </div>
        </main>
      ) : (
        <Chat user={user} />
      )}
    </div>
  );
};

export default App;