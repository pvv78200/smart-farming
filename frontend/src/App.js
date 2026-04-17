import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import CropRecommendation from "./pages/CropRecommendation";
import IrrigationAdvice from "./pages/IrrigationAdvice";
import Market from "./pages/market";
import CustomerLogin from "./pages/customerlogin";
import CustomerDashboard from "./pages/CustomerDashboard";
import Shop from "./pages/shop";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";




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
        <Route path="/market" element={<Market />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;