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

  // 🔥 Filter by status
  const filterOrders = (status) =>
    orders.filter((o) => o.status === status);

  const renderOrders = (list) =>
    list.map((o, i) => (
      <div className="order-card" key={i}>
        <h4>🧾 Order #{i + 1}</h4>
        <p>Status: {o.status}</p>
        <p>Total: ₹{o.total}</p>

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

      {/* 🔵 Pending */}
      <h3>🟡 Pending</h3>
      {renderOrders(filterOrders("Pending"))}

      {/* 🟢 Approved */}
      <h3>🟢 Approved</h3>
      {renderOrders(filterOrders("Approved"))}

      {/* 🚚 In Delivery */}
      <h3>🚚 In Delivery</h3>
      {renderOrders(filterOrders("In Delivery"))}

      {/* ✅ Delivered */}
      <h3>✅ Delivered</h3>
      {renderOrders(filterOrders("Delivered"))}
    </div>
  );
}

export default Orders;