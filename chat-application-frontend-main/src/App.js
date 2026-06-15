import React, { useState } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { Chat } from "./components/chat/Chat";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [authMode, setAuthMode] = useState("login");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-logo">
          <div className="app-header-logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="#061016"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z" />
            </svg>
          </div>
          <h1>Relay</h1>
        </div>

        {user && (
          <button className="app-logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>
      {!user ? (
        <main className="auth-page">
          <section className="auth-info-panel">
            <p className="auth-label">Real-time messaging</p>
            <h2>Fast messaging with delivery and seen receipts.</h2>
            <p>
              Send messages instantly, track delivery, see typing activity, and
              manage profile photos with ImageKit.
            </p>
            <div className="auth-feature-list">
              <span className="auth-feature-item">
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Socket.IO chat
              </span>
              <span className="auth-feature-item">
                <svg viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Seen receipts
              </span>
              <span className="auth-feature-item">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
                Online status
              </span>
              <span className="auth-feature-item">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                ImageKit avatars
              </span>
            </div>
          </section>

          <section className="auth-card">
            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>

              <button
                type="button"
                className={authMode === "register" ? "active" : ""}
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
            </div>

            {authMode === "login" ? (
              <Login
                setUser={setUser}
                onCreateAccount={() => setAuthMode("register")}
              />
            ) : (
              <Register onRegistered={() => setAuthMode("login")} />
            )}
          </section>
        </main>
      ) : (
        <Chat user={user} setUser={setUser} />
      )}
    </div>
  );
};

export default App;
