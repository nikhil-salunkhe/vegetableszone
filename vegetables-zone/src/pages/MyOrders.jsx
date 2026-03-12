import { useEffect, useState } from "react";
import "./Orders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Determine unit
  const getUnit = (category, unitFromDB) => {
    if (unitFromDB) return unitFromDB;
    if (category === "Fruits" || category === "Leafy") return "bunch";
    return "kg";
  };

  // Fetch orders
  const fetchOrders = async () => {
    if (!userId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        alert("Unauthorized. Please login again.");
        setOrders([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch orders. Try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cancel full order
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/delete/${orderId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      alert(data.message);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to delete order.");
    }
  };

  // Remove item
  const deleteItem = async (orderId, itemId) => {
    if (!window.confirm("Remove this item from order?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/remove-item/${orderId}/${itemId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      alert(data.message);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to remove item.");
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <h1>📦 My Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>📦 My Orders</h1>

      {orders.length === 0 ? (
        <p className="empty-orders">You haven’t placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-header">
              <p>
                <strong>Date:</strong>{" "}
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
              <p><strong>Total:</strong> ₹{order.totalAmount}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`order-status ${
                    order.status === "Delivered"
                      ? "status-delivered"
                      : order.status === "Pending"
                      ? "status-pending"
                      : "status-cancelled"
                  }`}
                >
                  {order.status}
                </span>
              </p>
            </div>

            {order.deliveryStatus === "Pending" && order.status !== "Cancelled" && (
              <button
                className="delete-order-btn"
                onClick={() => deleteOrder(order._id)}
              >
                Cancel Order ❌
              </button>
            )}

            <div className="order-items">
              {order.items.map((item) => (
                <div className="order-item" key={item._id}>
                  <img
                    src={
                      item.image
                        ? `http://localhost:5000/uploads/${item.image}`
                        : "https://via.placeholder.com/80?text=No+Image"
                    }
                    alt={item.name}
                    className="order-img"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/80?text=No+Image")
                    }
                  />
                  <span>
                    {item.name} × {item.quantity}{" "}
                    {getUnit(item.category, item.unit)}
                  </span>

                  {order.status !== "Purchased" && (
                    <button
                      className="delete-item-btn"
                      onClick={() => deleteItem(order._id, item._id)}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;