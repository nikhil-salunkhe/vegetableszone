import "./OrderSuccess.css";

const OrderSuccess = () => {
  return (
    <div className="success-page">
      <h1>🎉 Order Placed Successfully!</h1>
      <p>Thank you for shopping with VegetablesZone</p>

      <a href="/my-orders" className="success-btn">
        View My Orders
      </a>
      <a href="/vegetables" className="success-btn secondary">
        Continue Shopping
      </a>
    </div>
  );
};

export default OrderSuccess;
