import React, { useState } from "react";
import { BASE_URL } from "../../config/api";
import axios from "axios";

const Register = ({ onRegistered }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setRegistrationMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    setRegistrationMessage("");

    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        username: username.trim(),
        password,
      });

      setRegistrationMessage("Account created. Please login now.");

      setTimeout(() => {
        setRegistrationMessage("");
        onRegistered();
      }, 900);
    } catch (error) {
      setRegistrationMessage(
        error.response?.data?.message || "Error registering user",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleRegister}>
      <h2>Create account</h2>
      <p>Register to start chatting in real time.</p>

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
        autoComplete="new-password"
        required
      />

      {registrationMessage && (
        <p
          className={`auth-message ${registrationMessage.includes("created") ? "success" : ""}`}
        >
          {registrationMessage}
        </p>
      )}

      <button className="auth-submit-button" type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
};

export default Register;
