import React, { useContext } from "react";
import "./auth.css";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../translations";

function Login() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{t.login}</h2>

        <input placeholder={t.mobile} />
        <input type="password" placeholder={t.password} />

        <button>{t.login}</button>
      </div>
    </div>
  );
}

export default Login;