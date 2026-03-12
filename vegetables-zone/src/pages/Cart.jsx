import React, { useEffect, useState } from "react";
import "./Cart.css";

// ✅ Render backend URL
const API = "https://vegetableszone-backend.onrender.com";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const userId = localStorage.getItem("userId");

  // ================= LOAD RAZORPAY =================
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ================= FETCH CART =================
  const fetchCartItems = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API}/api/cart/${userId}`);
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.log("Cart fetch error:", err);
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
      console.log("Remove error:", error);
    }
  };

  // ================= UPDATE QUANTITY =================
  const updateQuantity = async (id, newQty) => {
    if (newQty <= 0) return;

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
      console.log("Update error:", error);
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

    const loaded = await loadRazorpayScript();

    if (!loaded) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/orders/checkout/${userId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      const options = {
        key: "rzp_test_SLCoWbJ62YvrdO", // Razorpay Test Key
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "Vegetables Zone",
        description: "Vegetable Purchase",
        order_id: data.razorpayOrder.id,

        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API}/api/orders/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId,
              }),
            });

            const verifyData = await verifyRes.json();

            alert(verifyData.message);

            if (verifyRes.ok) {
              setCartItems([]);
              window.location.href = "/my-orders";
            }
          } catch (error) {
            console.log("Verification error:", error);
            alert("Payment verification failed");
          }
        },

        theme: {
          color: "#28a745",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.log("Checkout error:", error);
      alert("Payment failed");
    }
  };

  // ================= TOTAL PRICE =================
  const totalAmount = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

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
            {cartItems.map((item) => {
              const subtotal = item.price * item.quantity;

              return (
                <div className="cart-card" key={item._id}>

                  {/* IMAGE */}
                  <img
                    src={
                      item.image?.startsWith("http")
                        ? item.image
                        : `${API}/uploads/${item.image}`
                    }
                    alt={item.name}
                  />

                  {/* DETAILS */}
                  <div className="cart-details">
                    <h3>{item.name}</h3>

                    <p className="price">
                      ₹{item.price} / {item.unit}
                    </p>

                    <p className="qty-text">
                      Selected: {item.quantity} {item.unit}
                    </p>

                    <p className="subtotal">
                      Subtotal: ₹{subtotal.toFixed(2)}
                    </p>

                    {/* QUANTITY CONTROLS */}
                    <div className="qty-controls">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                      >
                        −
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

                  {/* REMOVE */}
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item._id)}
                  >
                    Remove
                  </button>

                </div>
              );
            })}
          </div>

          {/* SUMMARY */}
          <div className="cart-summary">
            <h2>Total Amount: ₹{totalAmount.toFixed(2)}</h2>

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