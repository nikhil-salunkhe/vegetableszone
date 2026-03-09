import React, { useEffect, useState } from "react";
import "./Cart.css";

const API = "http://localhost:5000";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const userId = localStorage.getItem("userId");

  // ================= LOAD RAZORPAY SCRIPT =================
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ================= FETCH USER CART =================
  const fetchCartItems = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API}/api/cart/${userId}`);
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // ================= REMOVE ITEM =================
  const removeItem = async (id) => {
    try {
      await fetch(`${API}/api/cart/remove/${id}`, {
        method: "DELETE",
      });
      fetchCartItems();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= UPDATE QUANTITY =================
  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;

    try {
      await fetch(`${API}/api/cart/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      fetchCartItems();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= CHECKOUT =================
  const checkout = async () => {
    if (!userId) {
      alert("Please login first");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // ✅ Load Razorpay first
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      // 1️⃣ Create Razorpay Order
      const res = await fetch(
        `${API}/api/orders/checkout/${userId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // 2️⃣ Razorpay Options
      const options = {
        key: "rzp_test_SLCoWbJ62YvrdO",
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "Fresh Vegetable Shop",
        description: "Vegetable Purchase",
        order_id: data.razorpayOrder.id,

        handler: async function (response) {
          // 3️⃣ Verify Payment
          const verifyRes = await fetch(
            `${API}/api/orders/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...response,
                userId,
              }),
            }
          );

          const verifyData = await verifyRes.json();
          alert(verifyData.message);

          if (verifyRes.ok) {
            setCartItems([]);
            window.location.href = "/my-orders";
          }
        },

        theme: {
          color: "#28a745",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      console.log(error);
      alert("Payment failed");
    }
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <h1>Your Cart 🛒</h1>

      {!userId ? (
        <p>Please login to view your cart</p>
      ) : cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map((item) => (
              <div className="cart-card" key={item._id}>
                <img
                  src={
                    item.image?.startsWith("http")
                      ? item.image
                      : `${API}/uploads/${item.image}`
                  }
                  alt={item.name}
                />

                <div className="cart-details">
                  <h3>{item.name}</h3>
                  <p>Price: ₹{item.price}</p>

                  <div className="qty-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeItem(item._id)}
                >
                  ❌ Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total: ₹{totalAmount.toFixed(2)}</h2>

            <button className="checkout-btn" onClick={checkout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;