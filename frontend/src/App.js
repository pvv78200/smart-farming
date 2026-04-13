import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import CropRecommendation from "./pages/CropRecommendation";
import IrrigationAdvice from "./pages/IrrigationAdvice";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/crop-recommendation" element={<CropRecommendation />} /><Route path="/crop-recommendation" element={<CropRecommendation />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/irrigation" element={<IrrigationAdvice />} />

      </Routes>
    </Router>
  );
}

export default App;