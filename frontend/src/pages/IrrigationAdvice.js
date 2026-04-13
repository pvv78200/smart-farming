import React, { useState } from "react";
import "./crop.css";

function IrrigationAdvice() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [locationName, setLocationName] = useState("");
  const [crop, setCrop] = useState("Rice");

  const API_KEY = "a449436e712cc70c9da8c99595ef97d9";

  const cropWater = {
    Rice: 10,
    Wheat: 6,
    Maize: 7,
    Vegetables: 5,
  };

  // 🌤 Fetch by CITY
  const fetchWeatherByCity = async (cityName) => {
    try {
      setLoading(true);

      const res1 = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data1 = await res1.json();

      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data2 = await res2.json();

      setWeather(data1);
      setLocationName(data1.name);

      const daily = data2.list.filter((_, i) => i % 8 === 0);
      setForecast(daily);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 📍 AUTO LOCATION
  const handleAutoLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    });
  };

  // 🌤 Fetch by COORDS
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);

      const res1 = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data1 = await res1.json();

      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data2 = await res2.json();

      setWeather(data1);
      setLocationName(data1.name);

      const daily = data2.list.filter((_, i) => i % 8 === 0);
      setForecast(daily);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🌱 ADVANCED IRRIGATION LOGIC
  const getIrrigationSchedule = () => {
    if (!forecast.length) return [];

    return forecast.map((day) => {
      const temp = day.main.temp;
      const humidity = day.main.humidity;
      const condition = day.weather[0].main.toLowerCase();

      let advice = "";
      let color = "";
      let water = 0;

      const baseWater = cropWater[crop];

      if (condition.includes("rain")) {
        advice = "No irrigation";
        color = "green";
        water = 0;
      } else if (temp > 30 && humidity < 60) {
        advice = "Irrigation needed";
        color = "red";
        water = baseWater + 3;
      } else if (humidity > 70) {
        advice = "Less irrigation";
        color = "yellow";
        water = baseWater - 2;
      } else {
        advice = "Light irrigation";
        color = "yellow";
        water = baseWater;
      }

      return {
        date: new Date(day.dt_txt).toDateString(),
        advice,
        color,
        water,
      };
    });
  };

  const schedule = getIrrigationSchedule();

  const firstIrrigationDay = schedule.find((day) =>
    day.advice === "Irrigation needed"
  );

  return (
    <div className="crop-container">
      <h2>💧 Smart Irrigation System</h2>

      {/* 🌱 Crop Selection */}
      <div className="option-box">
        <select value={crop} onChange={(e) => setCrop(e.target.value)}>
          <option>Rice</option>
          <option>Wheat</option>
          <option>Maize</option>
          <option>Vegetables</option>
        </select>
      </div>

      {/* LOCATION OPTIONS */}
      <div className="option-box">
        <button onClick={handleAutoLocation}>
          📍 Use Current Location
        </button>

        <div className="manual-box">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={() => fetchWeatherByCity(city)}>
            🔍 Search
          </button>
        </div>
      </div>

      {loading && <div className="loader"></div>}

      {weather && (
        <>
          <div className="weather-card">
            <h3>📍 {locationName}</h3>
            <p>🌡 {weather.main.temp} °C</p>
            <p>💧 {weather.main.humidity}%</p>
            <p>{weather.weather[0].description}</p>
          </div>

          {/* START DAY */}
          {firstIrrigationDay && (
            <div className="recommend-card">
              <h3>🚨 Start Irrigation From</h3>
              <p>{firstIrrigationDay.date}</p>
            </div>
          )}

          {/* PLAN */}
          <div className="recommend-card">
            <h3>💧 Irrigation Plan</h3>

            {schedule.map((item, index) => (
              <p key={index} style={{
                color:
                  item.color === "red"
                    ? "red"
                    : item.color === "green"
                    ? "green"
                    : "orange",
                fontWeight: "bold"
              }}>
                📅 {item.date} → {item.advice} ({item.water} L)
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default IrrigationAdvice;