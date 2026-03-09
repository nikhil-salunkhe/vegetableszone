import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Vegetables from "./pages/Vegetables";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import EditProfile from "./pages/EditProfile";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVegetables from "./pages/AdminVegetables";
import TotalSales from "./pages/TotalSales";
import AdminSuppliers from "./pages/AdminSuppliers";
import AdminPurchase from "./pages/AdminPurchase";
import AdminPurchaseHistory from "./pages/AdminPurchaseHistory";


function App() {
  return (
    <Router>
      <Routes>

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/adminVeg" element={<AdminVegetables />} />
        <Route path="/TotalSale" element={<TotalSales />} />
        <Route path="/adminSuppliers" element={<AdminSuppliers />} />
        <Route path="/adminPurchase" element={<AdminPurchase />} />
        <Route path="/adminPurchaseHistory" element={<AdminPurchaseHistory />} />

        {/* ================= AUTH PAGES ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ================= MAIN WEBSITE ================= */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/vegetables" element={<Vegetables />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
