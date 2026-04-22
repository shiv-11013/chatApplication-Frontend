import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import { Chat } from "./components/Chat";
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
        <h1>Chat App</h1>
        {user && (
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

      {!user ? (
        <div className="container mt-5 text-center">
          <div className="row">
            <div className="col-md-6">
              <Register setUser={setUser} />
            </div>
            <div className="col-md-6">
              <Login setUser={setUser} />
            </div>
          </div>
        </div>
      ) : (
        <Chat user={user} />
      )}
    </div>
  );
};

export default App;