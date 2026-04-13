import React from "react";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate(); // ✅ added

  if (!user) {
    return <h2>Please login first</h2>;
  }

  return (
    <div className="dashboard-container">
      
      {/* Navbar */}
      <div className="dashboard-navbar">
        <h2>🌱 Smart Farming</h2>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      {/* Welcome Section */}
      <div className="welcome-card">
        <h1>Welcome, {user.name} 👋</h1>
        <p>Let’s make your farming smarter with AI</p>
      </div>

      {/* User Info */}
      <div className="user-info">
        <div className="info-card">
          <h3>📱 Mobile</h3>
          <p>{user.mobile}</p>
        </div>

        <div className="info-card">
          <h3>📍 Location</h3>
          <p>{user.location}</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-grid">

        {/* ✅ Crop Recommendation Clickable */}
        <div
          className="feature-card"
          onClick={() => navigate("/crop-recommendation")}
          style={{ cursor: "pointer" }}
        >
          🌾 Crop Recommendation
        </div>

        {/* ❌ Not clickable (for now) */}
        <div className="feature-card">
          🍃 Disease Detection
        </div>

        <div 
          className="feature-card"
          onClick={() => navigate("/irrigation")}
        >
          💧 Irrigation Advice
        </div>
        
        <div className="feature-card">📊 Market Prices</div>
        <div className="feature-card">🏛 Govt Schemes</div>
        <div className="feature-card">🤖 AI Chatbot</div>
      </div>

    </div>
  );
}

export default Dashboard;