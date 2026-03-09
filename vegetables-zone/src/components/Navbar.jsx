import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>🥕 VegetablesZone</h2>

      {token && (
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/vegetables">Vegetables</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/my-orders">My Orders</Link></li>
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
