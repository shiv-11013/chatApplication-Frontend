import React, { useState } from "react";
import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001"
    : "https://chatapplication-backend-4nhj.onrender.com";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) return alert("Please fill all fields");

    setLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      setUser(data);
    } catch (error) {
      alert(error.response?.data?.message || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card py-5 text-center">
      <div className="card-body px-5">
        <h2>Login</h2>
        <p>Login with your credentials to continue.</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            className="form-control form-control-lg mt-3"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="form-control form-control-lg mt-3"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn btn-success btn-lg mt-3"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
