import React from "react";
import { useNavigate } from "react-router-dom";
import "./customer.css";

function CustomerDashboard() {
  const navigate = useNavigate();
  const customer = localStorage.getItem("customer");

  if (!customer) return <h2>Please login</h2>;

  return (
    <div className="customer-container">

      <div className="navbar">
        <h2>🛒 Smart Market</h2>
        <button onClick={() => {
          localStorage.removeItem("customer");
          window.location.href = "/customer-login";
        }}>
          Logout
        </button>
      </div>

      <div className="menu-grid">

        <div className="menu-card" onClick={() => navigate("/shop")}>
          🛍 Shop
        </div>

        <div className="menu-card" onClick={() => navigate("/cart")}>
          🛒 Cart
        </div>

        <div className="menu-card" onClick={() => navigate("/profile")}>
          👤 Profile
        </div>

        <div className="menu-card" onClick={() => navigate("/orders")}>
          📦 Orders
        </div>

      </div>

    </div>
  );
}

export default CustomerDashboard;