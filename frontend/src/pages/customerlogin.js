import React, { useState } from "react";
import axios from "axios";

function CustomerLogin() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // 📲 Send OTP
  const sendOtp = async () => {
    if (mobile.length !== 10) {
      alert("Enter valid mobile number");
      return;
    }

    await axios.post("http://127.0.0.1:8000/api/send-otp/", { mobile });

    alert("OTP sent (check backend terminal)");
    setShowOtp(true);
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/verify-otp/",
      { mobile, otp }
    );

    alert(res.data.message);

    // ✅ FORCE SAVE STRING
    localStorage.setItem("customer", String(mobile));

    window.location.href = "/customer-dashboard";

  } catch (err) {
    alert("Invalid OTP");
  }
};

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Customer Login</h2>

        <input
          placeholder="Enter Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        {!showOtp ? (
          <button onClick={sendOtp}>Send OTP</button>
        ) : (
          <>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp}>Verify OTP</button>
          </>
        )}
      </div>
    </div>
  );
}

export default CustomerLogin;