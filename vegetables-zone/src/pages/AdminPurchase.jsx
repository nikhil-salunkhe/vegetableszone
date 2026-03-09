import { useEffect, useState } from "react";

const AdminPurchase = () => {

  const token = localStorage.getItem("adminToken");

  const [suppliers,setSuppliers] = useState([]);
  const [vegetables,setVegetables] = useState([]);

  const [form,setForm] = useState({
    supplierId:"",
    vegetableId:"",
    quantity:"",
    pricePerKg:""
  });

  const fetchData = async()=>{

    const s = await fetch(
      "http://localhost:5000/api/admin/suppliers",
      { headers:{Authorization:`Bearer ${token}`} }
    );

    const v = await fetch(
      "http://localhost:5000/api/admin",
      { headers:{Authorization:`Bearer ${token}`} }
    );

    const suppliersData = await s.json();
    const vegData = await v.json();

    setSuppliers(suppliersData);
    setVegetables(vegData);

  };

  useEffect(()=>{
    fetchData();
  },[]);

  const handlePurchase = async(e)=>{
    e.preventDefault();

    await fetch(
      "http://localhost:5000/api/admin/purchase",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify(form)
      }
    );

    alert("Purchase Successful & Stock Updated");

    setForm({
      supplierId:"",
      vegetableId:"",
      quantity:"",
      pricePerKg:""
    });

  };

  return(
    <div className="admin-container">

      <h2>Purchase Vegetables 🛒</h2>

      <form onSubmit={handlePurchase} className="form-card">

        <select
          value={form.supplierId}
          onChange={(e)=>setForm({...form,supplierId:e.target.value})}
          required
        >
          <option value="">Select Supplier</option>

          {suppliers.map((s)=>(
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}

        </select>

        <select
          value={form.vegetableId}
          onChange={(e)=>setForm({...form,vegetableId:e.target.value})}
          required
        >
          <option value="">Select Vegetable</option>

          {vegetables.map((v)=>(
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}

        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e)=>setForm({...form,quantity:e.target.value})}
          required
        />

        <input
          type="number"
          placeholder="Price Per Kg"
          value={form.pricePerKg}
          onChange={(e)=>setForm({...form,pricePerKg:e.target.value})}
          required
        />

        <button type="submit">Purchase</button>

      </form>

    </div>
  );
};

export default AdminPurchase;