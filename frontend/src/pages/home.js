import React, { useContext } from "react";
import "./home.css";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../translations";
import { Link } from "react-router-dom";

function Home() {
  const { language, setLanguage } = useContext(LanguageContext);
  const t = translations[language];
  

  return (
    <div>

      {/* Navbar */}
      <nav className="navbar">
        <h2>🌱 {t.title}</h2>

        <div className="nav-links">
          <select onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="ml">Malayalam</option>
            <option value="hi">Hindi</option>
          </select>

          <Link to="/login">{t.login}</Link>
          <Link to="/register">{t.register}</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>{t.title}</h1>
        <p>
          AI-powered farming: crop suggestions, disease detection, and govt schemes
        </p>
        <button>{t.getStarted}</button>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Our Features</h2>

        <div className="cards">
          <div className="card">🌾 Crop Recommendation</div>
          <div className="card">🍃 Disease Detection</div>
          <div className="card">💧 Irrigation Advice</div>
          <div className="card">📊 Market Prices</div>
          <div className="card">🏛 Govt Schemes</div>
          <div className="card">🤖 AI Chatbot</div>
        </div>
      </section>

      {/* Govt Schemes */}
      <section className="schemes">
        <h2>Government Programs</h2>
        <p>PMFBY, Fertilizer Subsidy, Kisan Credit Card</p>
        <button>Check Eligibility</button>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2026 Smart Farming Advisor</p>
      </footer>

    </div>
  );
}

export default Home;