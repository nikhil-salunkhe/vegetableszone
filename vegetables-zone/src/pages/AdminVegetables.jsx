import { useEffect, useState } from "react";
import "./AdminVegetables.css";

const API_URL = "http://localhost:5000/api/admin";
const BASE_URL = "http://localhost:5000";

const AdminVegetables = () => {
  const [vegetables, setVegetables] = useState([]);
  const [filteredVeg, setFilteredVeg] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [editVeg, setEditVeg] = useState(null);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 50;
  const token = localStorage.getItem("adminToken");

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "Fruits",
    image: null,
  });

  // ================= UNIT =================
  const getUnit = (category) => {
    if (category === "Leafy") return "Bunch";
    return "Kg";
  };

  // ================= FETCH =================
  const fetchVegetables = async () => {
    try {
      setLoading(true);
  
      const res = await fetch("http://localhost:5000/api/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      console.log("Admin Data:", data);
  
      setVegetables(data);
      setFilteredVeg(data);
  
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVegetables();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    let data = [...vegetables];

    if (categoryFilter !== "All") {
      data = data.filter((v) => v.category === categoryFilter);
    }

    if (search) {
      data = data.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredVeg(data);
    setCurrentPage(1);
  }, [search, categoryFilter, vegetables]);

  // ================= ADD =================
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", Number(form.price));
      formData.append("stock", Number(form.stock));
      formData.append("category", form.category);

      if (form.image) {
        formData.append("image", form.image);
      }

      const res = await fetch(`${API_URL}/vegetable`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add vegetable");

      setForm({
        name: "",
        price: "",
        stock: "",
        category: "Fruits",
        image: null,
      });

      document.getElementById("fileInput").value = "";

      fetchVegetables();
    } catch (error) {
      alert(error.message);
    }
  };

  // ================= DELETE =================
  const deleteVeg = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const res = await fetch(`${API_URL}/vegetable/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      fetchVegetables();
    } catch (error) {
      alert(error.message);
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${API_URL}/vegetable/${editVeg._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editVeg.name,
            price: Number(editVeg.price),
            stock: Number(editVeg.stock),
            category: editVeg.category,
          }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      setEditVeg(null);
      fetchVegetables();
    } catch (error) {
      alert(error.message);
    }
  };

  // ================= PAGINATION =================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredVeg.slice(indexOfFirst, indexOfLast);

  return (
    <div className="admin-container">
      <h2>Manage Fruits & Vegetables 🥦🍎</h2>

      {loading && <p>Loading...</p>}

      {/* ================= ADD FORM ================= */}
      <form onSubmit={handleAdd} className="form-card">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder={`Price per ${getUnit(form.category)}`}
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder={`Stock (${getUnit(form.category)})`}
          value={form.stock}
          onChange={(e) =>
            setForm({ ...form, stock: e.target.value })
          }
          required
        />

        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        >
          <option value="Fruits">Fruits</option>
          <option value="Root">Root</option>
          <option value="Leafy">Leafy</option>
        </select>

        <input
          id="fileInput"
          type="file"
          onChange={(e) =>
            setForm({ ...form, image: e.target.files[0] })
          }
          required
        />

        <button type="submit">Add Item</button>
      </form>

      {/* ================= GRID ================= */}
      <div className="veg-grid">
        {currentItems.map((veg) => (
          <div key={veg._id} className="veg-card">
            <img
              src={`${BASE_URL}/uploads/${veg.image}`}
              alt={veg.name}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/150";
              }}
            />

            <h3>{veg.name}</h3>

            <p>
              ₹{veg.price} / {getUnit(veg.category)}
            </p>

            <p>
              Stock: {veg.stock} {getUnit(veg.category)}
            </p>

            {veg.stock < 5 && (
              <span className="low-stock">
                ⚠️ Low Stock
              </span>
            )}

            <button onClick={() => setEditVeg(veg)}>
              Edit
            </button>

            <button onClick={() => deleteVeg(veg._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editVeg && (
        <div className="edit-modal">
          <div className="edit-card">
            <h3>Edit Vegetable</h3>

            <input
              value={editVeg.name}
              onChange={(e) =>
                setEditVeg({
                  ...editVeg,
                  name: e.target.value,
                })
              }
            />

            <input
              type="number"
              value={editVeg.price}
              onChange={(e) =>
                setEditVeg({
                  ...editVeg,
                  price: e.target.value,
                })
              }
            />

            <input
              type="number"
              value={editVeg.stock}
              onChange={(e) =>
                setEditVeg({
                  ...editVeg,
                  stock: e.target.value,
                })
              }
            />

            <select
              value={editVeg.category}
              onChange={(e) =>
                setEditVeg({
                  ...editVeg,
                  category: e.target.value,
                })
              }
            >
              <option value="Fruits">Fruits</option>
              <option value="Root">Root</option>
              <option value="Leafy">Leafy</option>
            </select>

            <div className="edit-buttons">
              <button onClick={handleUpdate}>
                Save
              </button>

              <button onClick={() => setEditVeg(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVegetables;
