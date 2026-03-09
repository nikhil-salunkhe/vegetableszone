import { useEffect, useState } from "react";
import "./AdminPurchaseHistory.css";

const AdminPurchaseHistory = () => {

  const [purchases,setPurchases] = useState([]);
  const token = localStorage.getItem("adminToken");

  const fetchPurchases = async()=>{

    const res = await fetch(
      "http://localhost:5000/api/admin/purchases",
      { headers:{Authorization:`Bearer ${token}`} }
    );

    const data = await res.json();
    setPurchases(data);
  };

  useEffect(()=>{
    fetchPurchases();
  },[]);

  const updatePayment = async(id,status)=>{

    await fetch(
      `http://localhost:5000/api/admin/purchase/${id}/payment`,
      {
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({paymentStatus:status})
      }
    );

    fetchPurchases();
  };

  return(

    <div className="purchase-container">

      <h2 className="page-title">Supplier Purchase History 📊</h2>

      <div className="purchase-grid">

      {purchases.map((p)=>(
        <div key={p._id} className="purchase-card">

          <h3 className="supplier-name">
            Supplier: {p.supplier?.name}
          </h3>

          <p>
            <strong>Vegetable:</strong> {p.vegetable?.name}
          </p>

          <p>
            <strong>Quantity:</strong> {p.quantity} Kg
          </p>

          <p>
            <strong>Total Amount:</strong> ₹{p.totalAmount}
          </p>

          <p className={`status ${p.paymentStatus}`}>
            Payment Status: {p.paymentStatus}
          </p>

          <div className="payment-update">

            <label>Update Payment:</label>

            <select
              value={p.paymentStatus}
              onChange={(e)=>updatePayment(p._id,e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Success</option>
            </select>

          </div>

        </div>
      ))}

      </div>

    </div>
  );

};

export default AdminPurchaseHistory;