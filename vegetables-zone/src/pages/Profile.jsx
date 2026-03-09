import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login"); // redirect if not logged in
      return;
    }

    fetch(`http://localhost:5000/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/login"); // redirect on unauthorized
          return;
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => console.log(err));
  }, [userId, token, navigate]);

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>👤 My Profile</h1>

        {user ? (
          <>
            <div className="profile-image">
              {user.profilePhoto ? (
                <img
                  src={`http://localhost:5000/uploads/${user.profilePhoto}`}
                  alt="Profile"
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>

            <div className="user-info">
              <p><strong>Name:</strong> {user.name || ""}</p>
              <p><strong>Email:</strong> {user.email || ""}</p>
              <p><strong>Mobile:</strong> {user.mobile || ""}</p>
              <p><strong>Address:</strong> {user.address || ""}</p>
            </div>

            <button
              style={{ marginTop: "15px" }}
              onClick={() => navigate("/edit-profile")}
            >
              ✏️ Edit Profile
            </button>
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;