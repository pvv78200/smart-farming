import React, { useContext, useState } from "react";
import "./auth.css";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../translations";
import axios from "axios";

function Login() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [formData, setFormData] = useState({
    mobile: "",
    password: ""
  });

  const handleLogin = async () => {
    // 🔴 Validation
    if (!formData.mobile || !formData.password) {
      alert("Please fill all fields");
      return;
    }

    // 🔴 Mobile validation
    if (!/^\d{10}$/.test(formData.mobile)) {
      alert("Enter valid 10-digit mobile number");
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        formData
      );

      alert(res.data.message);

      // ✅ Store user
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Redirect to dashboard
      window.location.href = "/dashboard";

    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{t.login}</h2>

        <input
          name="mobile"
          placeholder={t.mobile}
          value={formData.mobile}
          onChange={(e) =>
            setFormData({ ...formData, mobile: e.target.value })
          }
        />

        <input
          type="password"
          name="password"
          placeholder={t.password}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <button onClick={handleLogin}>{t.login}</button>
      </div>
    </div>
  );
}

export default Login;