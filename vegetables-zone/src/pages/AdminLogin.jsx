import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.type]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      if (data.role !== "admin") {
        alert("Access denied. Admin only.");
        setLoading(false);
        return;
      }

      // ✅ Save token
      localStorage.setItem("adminToken", data.token);

      // ✅ Redirect
      navigate("/adminDashboard");

    } catch (error) {
      alert("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form onSubmit={handleLogin}>
          <h2 className="auth-title">Admin Login 🔐</h2>

          <div className="input-group">
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />
            <label>Email</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              required
              value={form.password}
              onChange={handleChange}
            />
            <label>Password</label>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
