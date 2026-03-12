import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch user data
  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:5000/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        setForm({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          address: data.address || "",
        });

        if (data.profilePhoto) {
          setPreview(`http://localhost:5000/uploads/${data.profilePhoto}`);
        }
      })
      .catch((err) => console.log(err));
  }, [userId, token, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!userId || !token) {
      alert("Unauthorized");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("mobile", form.mobile);
    formData.append("address", form.address);

    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }

    const res = await fetch(
      `http://localhost:5000/api/users/update/${userId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update profile");
      return;
    }

    alert("Profile updated successfully 🎉");
    navigate("/profile");
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>✏️ Edit Profile</h1>

        <form onSubmit={handleUpdate}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Full Name"
          />

          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="Email Address"
          />

          <input
            type="text"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            required
            placeholder="Mobile Number"
          />

          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
            placeholder="Address"
          />

          <input type="file" accept="image/*" onChange={handleFileChange} />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                marginTop: "10px",
                objectFit: "cover",
              }}
            />
          )}

          <button type="submit" style={{ marginTop: "10px" }}>
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;