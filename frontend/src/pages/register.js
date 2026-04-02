import React, { useContext, useState } from "react";
import "./auth.css";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../translations";
import axios from "axios";

function Register() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    location: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value   // ✅ FIXED
    });
  };

  const handleRegister = async () => {

    // 🔴 VALIDATION
if (!formData.name || !formData.mobile || !formData.password || !formData.location) {
  alert("Please fill all fields");
  return;
}

// 🔴 Mobile validation
if (!/^\d{10}$/.test(formData.mobile)) {
  alert("Enter valid 10-digit mobile number");
  return;
}

// 🔴 Password validation
if (formData.password.length < 6) {
  alert("Password must be at least 6 characters");
  return;
}

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        formData
      );

      alert(res.data.message);

    } catch (error) {
      if (error.response && error.response.data.message === "Mobile number already exists") {
        alert("Mobile number already registered. Use another number");
      } else {
        alert("Registration failed");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{t.register}</h2>

        <input name="name" placeholder={t.name} onChange={handleChange} />
        <input name="mobile" placeholder={t.mobile} onChange={handleChange} />
        <input type="password" name="password" placeholder={t.password} onChange={handleChange} />
        <input name="location" placeholder={t.location} onChange={handleChange} />

        <button onClick={handleRegister}>{t.register}</button>
      </div>
    </div>
  );
}

export default Register;