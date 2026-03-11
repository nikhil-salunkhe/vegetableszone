import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    address: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= SEND OTP ================= */

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!form.mobile) {
      alert("Please enter your mobile number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://vegetableszone.onrender.com/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to send OTP");
        setLoading(false);
        return;
      }

      alert("OTP sent successfully 🎉");
      setOtpSent(true);
    } catch (err) {
      console.error("Send OTP error:", err);
      alert("Server error, try again later");
    }

    setLoading(false);
  };

  /* ================= VERIFY OTP & REGISTER ================= */

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Enter the OTP received on your mobile");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Verify OTP
      const res = await fetch("http://localhost:5000/api/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid OTP");
        setLoading(false);
        return;
      }

      alert("OTP verified! Creating your account...");

      // 2️⃣ Register user with FormData
      const registerData = new FormData();
      registerData.append("name", form.name);
      registerData.append("email", form.email);
      registerData.append("mobile", form.mobile);
      registerData.append("password", form.password);
      registerData.append("address", form.address);

      if (profilePhoto) {
        registerData.append("profilePhoto", profilePhoto);
      }

      const registerRes = await fetch(
        "http://localhost:5000/api/users/register",
        {
          method: "POST",
          body: registerData, // ⚠️ No headers here
        }
      );

      const result = await registerRes.json();

      if (!registerRes.ok) {
        alert(result.message || "Failed to register");
        setLoading(false);
        return;
      }

      alert("Account created successfully 🎉");
      navigate("/login");

    } catch (err) {
      console.error("Verify OTP error:", err);
      alert("Server error, try again later");
    }

    setLoading(false);
  };

  /* ================= FILE CHANGE ================= */

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="auth-container">
      <form
        className="auth-card slide-up"
        onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
      >
        <h2>Create Account 🥕</h2>

        {!otpSent && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              type="text"
              placeholder="Mobile Number (with country code, e.g., +91)"
              value={form.mobile}
              required
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <textarea
              placeholder="Address"
              value={form.address}
              required
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  marginTop: "10px",
                  objectFit: "cover",
                }}
              />
            )}
          </>
        )}

        {otpSent && (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            required
            onChange={(e) => setOtp(e.target.value)}
          />
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : otpSent
            ? "Verify OTP & Register"
            : "Send OTP"}
        </button>

        <p className="auth-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login here</span>
        </p>
      </form>
    </div>
  );
};

export default Register;