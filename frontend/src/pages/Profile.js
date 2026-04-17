import React, { useState, useEffect } from "react";
import axios from "axios";
import "./profile.css"; // optional styling

function Profile() {
  const mobile = localStorage.getItem("customer");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    address: "",
    mobile: mobile || ""
  });

  // 🔄 Load profile from DB
  useEffect(() => {
    if (!mobile) {
      alert("Please login first");
      return;
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/get-profile/",
        { params: { mobile } }
      );

      const data = res.data.profile;

      if (data && Object.keys(data).length > 0) {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          address: data.address || "",
          mobile: data.mobile || mobile
        });
      } else {
        // 🆕 New user → just set mobile
        setProfile((prev) => ({
          ...prev,
          mobile: mobile
        }));
      }

    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // 💾 Save profile
  const saveProfile = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/save-profile/",
        profile
      );

      alert("Profile saved");

      // 🔄 reload from DB to reflect saved values
      fetchProfile();

    } catch (error) {
      console.error(error);
      alert("Error saving profile");
    }
  };

  return (
    <div className="profile-container">
      <h2>👤 Customer Profile</h2>

      <div className="profile-box">

        <input
          placeholder="Name"
          value={profile.name}
          onChange={(e) =>
            setProfile({ ...profile, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={profile.email}
          onChange={(e) =>
            setProfile({ ...profile, email: e.target.value })
          }
        />

        <textarea
          placeholder="Address"
          value={profile.address}
          onChange={(e) =>
            setProfile({ ...profile, address: e.target.value })
          }
        />

        <input value={profile.mobile} disabled />

        <button onClick={saveProfile}>💾 Save Profile</button>

      </div>
    </div>
  );
}

export default Profile;