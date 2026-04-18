import React, { useEffect, useState } from "react";
import axios from "axios";
import "./orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const mobile = localStorage.getItem("customer");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/orders/",
        { params: { mobile } }
      );
      setOrders(res.data.orders || []);
    } catch (error) {
      alert("Failed to load orders");
    }
  };

  // 🔥 STATUS STEP LOGIC
  const getStep = (status) => {
    if (status === "Pending") return 1;
    if (status === "Approved") return 2;
    if (status === "In Delivery") return 3;
    if (status === "Delivered") return 4;
    return 0;
  };

  // 🎯 TIMELINE UI
  const Timeline = ({ status }) => {
    const step = getStep(status);

    return (
      <div className="timeline">
        <div className={`step ${step >= 1 ? "active" : ""}`}>Pending</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>Approved</div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>In Delivery</div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>Delivered</div>
      </div>
    );
  };

  // 🔥 FILTER
  const filterOrders = (status) =>
    orders.filter((o) => o.status === status);

  // 🎨 RENDER
  const renderOrders = (list) =>
    list.map((o, i) => (
      <div className="order-card" key={i}>

        <h4>🧾 Order #{i + 1}</h4>

        {/* 🔥 TIMELINE HERE */}
        <Timeline status={o.status} />

        <p><b>Total:</b> ₹{o.total}</p>

        <div className="order-products">
          {o.products.map((p, j) => (
            <div key={j} className="order-item">
              <span>{p.name}</span>
              <span>Qty: {p.quantity}</span>
              <span>₹{p.price}</span>
            </div>
          ))}
        </div>

      </div>
    ));

  return (
    <div className="orders-container">
      <h2>📦 My Orders</h2>

      <div className="order-section">
        <h3>🟡 Pending</h3>
        {renderOrders(filterOrders("Pending"))}
      </div>

      <div className="order-section">
        <h3>🟢 Approved</h3>
        {renderOrders(filterOrders("Approved"))}
      </div>

      <div className="order-section">
        <h3>🚚 In Delivery</h3>
        {renderOrders(filterOrders("In Delivery"))}
      </div>

      <div className="order-section">
        <h3>✅ Delivered</h3>
        {renderOrders(filterOrders("Delivered"))}
      </div>

    </div>
  );
}

export default Orders;