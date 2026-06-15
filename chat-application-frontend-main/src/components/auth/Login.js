import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/api";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, {
        username: username.trim(),
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      setUser(data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleLogin}>
      <h2>Welcome back</h2>
      <p>Login with your credentials to continue.</p>

      <input
        type="text"
        placeholder="Username"
        value={username}
        className="auth-input"
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        className="auth-input"
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      {message && <p className="auth-message">{message}</p>}

      <button className="auth-submit-button" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default Login;