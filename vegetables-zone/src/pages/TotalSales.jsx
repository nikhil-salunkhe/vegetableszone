import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TotalSales.css";

const TotalSales = () => {
  const [orders, setOrders] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/adminLogin");
    }
  }, [token, navigate]);

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    const res = await fetch("http://localhost:5000/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setOrders(data);
  };

  // ================= FETCH PURCHASES =================
  const fetchPurchases = async () => {
    const res = await fetch("http://localhost:5000/api/admin/purchases", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setPurchases(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchPurchases();
  }, []);

  // ================= CALCULATIONS =================
  const totalSales = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const totalPurchase = purchases.reduce(
    (sum, p) => sum + p.totalAmount,
    0
  );

  const profit = totalSales - totalPurchase;

  // ================= UPDATE PAYMENT =================
  const updatePayment = async (id) => {
    await fetch(`http://localhost:5000/api/admin/purchase/${id}/payment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentStatus: "Paid" }),
    });

    fetchPurchases();
  };

  return (
    <div className="total-sales-page">

      <h1 className="page-title">VegetablesZone Business Report 📊</h1>

      {/* ================= SUMMARY ================= */}

      <div className="sales-summary">

        <div className="summary-card sales">
          <h3>Total Customer Sales</h3>
          <p>₹{totalSales.toFixed(2)}</p>
        </div>

        <div className="summary-card purchase">
          <h3>Total Supplier Purchase</h3>
          <p>₹{totalPurchase.toFixed(2)}</p>
        </div>

        <div className="summary-card profit">
          <h3>Profit / Loss</h3>
          <p style={{ color: profit >= 0 ? "green" : "red" }}>
            ₹{profit.toFixed(2)}
          </p>
        </div>

      </div>

      {/* ================= ORDERS ================= */}

      <h2 className="table-title">Customer Orders</h2>

      <table className="sales-table">

        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Delivery</th>
          </tr>
        </thead>

        <tbody>

          {orders.map((order) => (
            <tr key={order._id}>

              <td>{order._id.slice(-6)}</td>

              <td>{order.userId?.name}</td>

              <td>
                {order.items.map((item, i) => (
                  <div key={i}>
                    {item.name} x {item.quantity}
                  </div>
                ))}
              </td>

              <td>₹{order.totalAmount}</td>

              <td className="status">{order.status}</td>

              <td className="delivery">{order.deliveryStatus}</td>

            </tr>
          ))}

        </tbody>

      </table>

      {/* ================= PURCHASE HISTORY ================= */}

      <h2 className="table-title">Supplier Purchase History</h2>

      <table className="sales-table">

        <thead>
          <tr>
            <th>Supplier</th>
            <th>Vegetable</th>
            <th>Qty</th>
            <th>Price/Kg</th>
            <th>Total</th>
            <th>Payment</th>
          </tr>
        </thead>

        <tbody>

          {purchases.map((p) => (

            <tr key={p._id}>

              <td>{p.supplier?.name}</td>

              <td>{p.vegetable?.name}</td>

              <td>{p.quantity}</td>

              <td>₹{p.pricePerKg}</td>

              <td>₹{p.totalAmount}</td>

              <td>

                {p.paymentStatus === "Paid" ? (

                  <span className="paid">Paid ✔</span>

                ) : (

                  <button
                    className="pay-btn"
                    onClick={() => updatePayment(p._id)}
                  >
                    Mark Paid
                  </button>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default TotalSales;