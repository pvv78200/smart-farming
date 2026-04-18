import React, { useState } from "react";
import "./crop.css";

function CropRecommendation() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [locationName, setLocationName] = useState("");

  const API_KEY = "beeff15ea86d3a6be002a62a4507ce41";

  // 📍 AUTO LOCATION
  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        alert("Location permission denied");
        setLoading(false);
      }
    );
  };

  // 🏙 MANUAL LOCATION
  const handleManualLocation = () => {
    if (!city) {
      alert("Enter a location");
      return;
    }

    setLoading(true);
    fetchWeatherByCity(city);
  };

  // 🌤 Fetch by CITY
  const fetchWeatherByCity = async (cityName) => {
    try {
      const res1 = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data1 = await res1.json();

      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data2 = await res2.json();

      if (data1.cod !== 200) {
        alert("City not found");
        setLoading(false);
        return;
      }

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

  // 🌤 Fetch by COORDS
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
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

  // 🌱 Crop Logic
  const getCropRecommendation = () => {
    if (!weather) return "";

    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const condition = weather.weather[0].main.toLowerCase();

    if (condition.includes("rain")) {
      return "🌾 Rice, 🌿 Sugarcane";
    }

    if (humidity > 60) {
      return "🌾 Rice, 🥥 Coconut, 🍌 Banana";
    }

    if (temp > 30) {
      return "🌽 Maize, 🌻 Sunflower";
    }

    if (temp < 20) {
      return "🌱 Wheat, 🥔 Potato";
    }

    return "🥕 Vegetables";
  };

  return (
    <div className="crop-container">
      <h2>🌾 Crop Recommendation</h2>

      {/* OPTIONS */}
      <div className="option-box">
        <button onClick={handleAutoLocation}>
          📍 Use Current Location
        </button>

        <div className="manual-box">
          <input
            type="text"
            placeholder="Enter city (e.g. Kochi)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={handleManualLocation}>
            🔍 Search
          </button>
        </div>
      </div>

      {loading && <div className="loader"></div>}

      {/* WEATHER */}
      {weather && (
        <>
          <div className="weather-card">
            <h3>📍 {locationName}</h3>
            <p>🌡 {weather.main.temp} °C</p>
            <p>💧 {weather.main.humidity}%</p>
            <p>{weather.weather[0].description}</p>
          </div>

          {/* FORECAST */}
          <h3>📅 Upcoming Days</h3>
          <div className="forecast-grid">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <p>{new Date(day.dt_txt).toDateString()}</p>
                <p>🌡 {day.main.temp} °C</p>
                <p>{day.weather[0].main}</p>
              </div>
            ))}
          </div>

          {/* RECOMMENDATION */}
          <div className="recommend-card">
            <h3>🌱 Recommended Crops</h3>
            <p>{getCropRecommendation()}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default CropRecommendation;