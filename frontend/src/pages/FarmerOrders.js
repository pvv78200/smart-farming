import React, { useEffect, useState } from "react";
import axios from "axios";
import "./orders.css";

function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Pending");

  const farmer = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await axios.get(
      "http://127.0.0.1:8000/api/farmer-orders/",
      { params: { mobile: farmer.mobile } }
    );
    setOrders(res.data.orders);
  };

  // 🔥 UPDATE STATUS
  const updateStatus = async (id, status) => {
    await axios.post("http://127.0.0.1:8000/api/update-order-status/", {
      order_id: id,
      status: status
    });

    fetchOrders();
    setActiveTab(status); // 👉 switch tab automatically
  };

  // 🔍 FILTER
  const filteredOrders = orders.filter(
    (o) => o.status === activeTab
  );

  return (
    <div>
      {/* BUTTON TO OPEN POPUP */}
      <button onClick={() => setShowModal(true)}>
        📦 View Orders
      </button>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal">
          <div className="modal-box large">

            {/* CLOSE */}
            <span
              className="close-btn"
              onClick={() => setShowModal(false)}
            >
              ❌
            </span>

            <h2>👨‍🌾 Manage Orders</h2>

            {/* 🔥 TABS */}
            <div className="tabs">
              {["Pending", "Approved", "In Delivery", "Delivered"].map(tab => (
                <button
                  key={tab}
                  className={activeTab === tab ? "active-tab" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 🔥 ORDERS */}
            <div className="orders-list">
              {filteredOrders.length === 0 ? (
                <p>No orders</p>
              ) : (
                filteredOrders.map((o, i) => (
                  <div className="order-card" key={i}>

                    <h4>Order #{i + 1}</h4>
                    <p>Total: ₹{o.total}</p>

                    {o.products.map((p, j) => (
                      <p key={j}>
                        {p.name} (x{p.quantity})
                      </p>
                    ))}

                    {/* 🔥 ACTION BUTTONS */}
                    {activeTab === "Pending" && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() =>
                            updateStatus(o._id, "Approved")
                          }
                        >
                          ✅ Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() =>
                            updateStatus(o._id, "Rejected")
                          }
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}

                    {activeTab === "Approved" && (
                      <button
                        className="delivery-btn"
                        onClick={() =>
                          updateStatus(o._id, "In Delivery")
                        }
                      >
                        🚚 Start Delivery
                      </button>
                    )}

                    {activeTab === "In Delivery" && (
                      <button
                        className="done-btn"
                        onClick={() =>
                          updateStatus(o._id, "Delivered")
                        }
                      >
                        📦 Delivered
                      </button>
                    )}

                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerOrders;