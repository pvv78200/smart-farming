import React, { useState, useContext } from "react";
import "./auth.css";
import axios from "axios";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../translations";

function Register() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  // 🟢 State to store form data
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    location: ""
  });

  // 🟢 Handle Register Button
  const handleRegister = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/register/", {
        ...form,
        language: language
      });

      alert(res.data.message);
    } catch (error) {
      console.log(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{t.register}</h2>

        {/* 🟢 Input Fields */}
        <input
          placeholder={t.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder={t.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
        />

        <input
          type="password"
          placeholder={t.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          placeholder={t.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        {/* 🟢 Button */}
        <button onClick={handleRegister}>{t.register}</button>
      </div>
    </div>
  );
}

export default Register;