import React, { useEffect, useState } from "react";
import "./Vegetables.css";

const API = "http://localhost:5000";

const Vegetables = () => {
  const [vegetables, setVegetables] = useState([]);
  const [category, setCategory] = useState("All");
  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Search term

  // 🔥 Decide unit based ONLY on category
  const getUnit = (veg) => (veg.category === "Leafy" ? "Bunch" : "Kg");

  // ✅ Fetch vegetables
  useEffect(() => {
    fetch(`${API}/api`)
      .then((res) => res.json())
      .then((data) => setVegetables(data))
      .catch((err) => console.log(err));
  }, []);

  // ✅ Filtered vegetables by category & search
  const filteredVegetables = vegetables
    .filter((veg) =>
      category === "All" ? true : veg.category === category
    )
    .filter((veg) =>
      veg.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // ✅ Quantity handler
  const handleQuantityChange = (id, value) => {
    setQuantities({
      ...quantities,
      [id]: value,
    });
  };

  // ✅ Add to cart
  const addToCart = async (veg) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first");
      return;
    }

    const unit = getUnit(veg);
    const selectedQty = quantities[veg._id] || (unit === "Kg" ? 0.25 : 1);

    if (selectedQty > veg.stock) {
      alert("Not enough stock available");
      return;
    }

    try {
      const res = await fetch(`${API}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: veg._id,
          name: veg.name,
          price: veg.price,
          image: `${API}/uploads/${veg.image}`,
          quantity: selectedQty,
          unit,
          totalPrice: veg.price * selectedQty,
        }),
      });

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.log(err);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="vegetables-page">
      <div className="veg-header">
        <h1>Fresh Fruits & Vegetables 🥕🍎</h1>
        <p>Choose healthy, live healthy</p>
      </div>

      {/* SEARCH BAR */}
      <div className="veg-search">
        <input
          type="text"
          placeholder="Search vegetables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CATEGORY FILTER */}
      <div className="category-filter">
        {["All", "Leafy", "Root", "Fruits"].map((cat) => (
          <button
            key={cat}
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="veg-grid">
        {filteredVegetables.map((veg) => {
          const unit = getUnit(veg);
          const qty = quantities[veg._id] || (unit === "Kg" ? 0.25 : 1);
          const total = (veg.price * qty).toFixed(2);

          return (
            <div className="veg-card" key={veg._id}>
              <img src={`${API}/uploads/${veg.image}`} alt={veg.name} />
              <h3>{veg.name}</h3>

              <p className="price">₹{veg.price} / {unit}</p>
              <p className="stock">
                Stock Available: {veg.stock} {unit}
              </p>
              {veg.stock < 5 && <p className="low-stock">⚠️ Only few left!</p>}

              {unit === "Kg" ? (
                <select
                  value={qty}
                  onChange={(e) =>
                    handleQuantityChange(veg._id, parseFloat(e.target.value))
                  }
                >
                  <option value={0.25}>250g</option>
                  <option value={0.5}>500g</option>
                  <option value={1}>1 Kg</option>
                  <option value={2}>2 Kg</option>
                  <option value={10}>10 Kg</option>
                </select>
              ) : (
                <input
                  type="number"
                  min="1"
                  max={veg.stock}
                  value={qty}
                  onChange={(e) =>
                    handleQuantityChange(veg._id, parseInt(e.target.value))
                  }
                />
              )}

              <p className="total">Total: ₹{total}</p>

              <button
                className="cart-btn"
                disabled={veg.stock === 0}
                onClick={() => addToCart(veg)}
              >
                {veg.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          );
        })}

        {filteredVegetables.length === 0 && (
          <p className="no-results">No vegetables found.</p>
        )}
      </div>
    </div>
  );
};

export default Vegetables;