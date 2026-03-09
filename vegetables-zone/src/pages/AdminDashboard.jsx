import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/adminLogin");
    }
  }, [token, navigate]);

  // Fetch Users & Orders
  const fetchData = async () => {
    try {
      const userRes = await fetch(
        "http://localhost:5000/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const usersData = await userRes.json();
      setUsers(usersData);

      const orderRes = await fetch(
        "http://localhost:5000/api/admin/orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const ordersData = await orderRes.json();
      setOrders(ordersData);
    } catch (err) {
      console.log("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= ORDER FUNCTIONS =================
  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/admin/order/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const deleteOrder = async (id) => {
    await fetch(`http://localhost:5000/api/admin/order/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  // ================= USER FUNCTIONS =================
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await fetch(`http://localhost:5000/api/admin/user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const changeRole = async (id, role) => {
    await fetch(`http://localhost:5000/api/admin/user/${id}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    fetchData();
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard 👨‍💼</h1>

      {/* ================= ADMIN ACTION BUTTONS ================= */}
      <div className="admin-actions">
        <button className="nav-btn" onClick={() => navigate("/adminVeg")}>
          ➕ Add / Manage Vegetables
        </button>

        {/* ================= TOTAL SALE BUTTON ================= */}
        <button className="nav-btn" onClick={() => navigate("/TotalSale")}>
          📊 Total Sale
        </button>
        <button
 className="nav-btn"
 onClick={()=>navigate("/adminSuppliers")}
>
🚚 Suppliers
</button>

<button
 className="nav-btn"
 onClick={()=>navigate("/adminPurchase")}
>
🛒 Purchase Vegetables
</button>

<button
 className="nav-btn"
 onClick={()=>navigate("/adminPurchaseHistory")}
>
📊 Purchase History
</button>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/adminLogin");
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* ================= USERS SECTION ================= */}
      <h2>All Users</h2>
      <div className="users-section">
        {users.map((u) => (
          <div key={u._id} className="user-card">
            <p><strong>Name:</strong> {u.name}</p>
            <p><strong>Email:</strong> {u.email}</p>
            <p><strong>Role:</strong> {u.role}</p>

            <div className="user-actions">
              {u.role === "user" ? (
                <button onClick={() => changeRole(u._id, "admin")} className="promote-btn">
                  Make Admin
                </button>
              ) : (
                <button onClick={() => changeRole(u._id, "user")} className="demote-btn">
                  Make User
                </button>
              )}
              <button onClick={() => deleteUser(u._id)} className="delete-btn">
                Delete User
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ORDERS SECTION ================= */}
      <h2>All Orders</h2>
      {orders.map((o) => (
        <div key={o._id} className="order-card">
          <p><strong>User:</strong> {o.userId?.name}</p>
          <p><strong>Total:</strong> ₹{o.totalAmount}</p>
          <p><strong>Status:</strong> {o.status}</p>

          <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
            <option value="Purchased">Purchased</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button onClick={() => deleteOrder(o._id)} className="delete-btn">
            Delete Order
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;