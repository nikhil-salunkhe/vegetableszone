import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate(); // 👈 ADD THIS

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      // SAVE LOGIN INFO
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);

      // 👉 REDIRECT TO HOME
      navigate("/home");
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card fade-in" onSubmit={handleSubmit}>
        <h2>Welcome Back 🌿</h2>

        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button type="submit">Login</button>
        <p className="auth-text">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>
            Register here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
