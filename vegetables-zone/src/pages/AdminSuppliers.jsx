import { useEffect, useState } from "react";
import "./AdminSuppliers.css";

const AdminSuppliers = () => {

  const [suppliers,setSuppliers] = useState([]);
  const token = localStorage.getItem("adminToken");

  const [form,setForm] = useState({
    name:"",
    phone:"",
    address:""
  });

  const fetchSuppliers = async ()=>{
    const res = await fetch(
      "http://localhost:5000/api/admin/suppliers",
      { headers:{Authorization:`Bearer ${token}`} }
    );

    const data = await res.json();
    setSuppliers(data);
  };

  useEffect(()=>{
    fetchSuppliers();
  },[]);

  const handleAdd = async(e)=>{
    e.preventDefault();

    await fetch(
      "http://localhost:5000/api/admin/supplier",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify(form)
      }
    );

    setForm({
      name:"",
      phone:"",
      address:""
    });

    fetchSuppliers();
  };

  const deleteSupplier = async(id)=>{
    await fetch(
      `http://localhost:5000/api/admin/supplier/${id}`,
      {
        method:"DELETE",
        headers:{Authorization:`Bearer ${token}`}
      }
    );

    fetchSuppliers();
  };

  return (
    <div className="supplier-container">

      <h2 className="title">🚚 Supplier Management</h2>

      <form onSubmit={handleAdd} className="supplier-form">

        <input
          placeholder="Supplier Name"
          value={form.name}
          onChange={(e)=>setForm({...form,name:e.target.value})}
          required
        />

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e)=>setForm({...form,phone:e.target.value})}
          required
        />

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e)=>setForm({...form,address:e.target.value})}
          required
        />

        <button type="submit">
          ➕ Add Supplier
        </button>

      </form>

      <div className="supplier-grid">

        {suppliers.map((s)=>(
          <div key={s._id} className="supplier-card">

            <h3>{s.name}</h3>

            <p>📞 {s.phone}</p>

            <p>📍 {s.address}</p>

            <button
              className="delete-btn"
              onClick={()=>deleteSupplier(s._id)}
            >
              🗑 Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  );
};

export default AdminSuppliers;