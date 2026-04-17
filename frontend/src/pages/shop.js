import React, { useEffect, useState } from "react";
import axios from "axios";
import "./shop.css";

function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/all-products/");
    setProducts(res.data.products);
  };

  // 🛒 Add to cart
  const addToCart = async (product) => {
  const mobile = localStorage.getItem("customer");

  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/add-to-cart/",
      {
        mobile,
        product
      }
    );

    // ✅ SHOW BACKEND MESSAGE
    alert(res.data.message);

  } catch (error) {
    alert("Error adding to cart");
  }
};

  return (
    <div className="shop-container">

      <h2>🛍 Shop Products</h2>

      {/* 🔍 Search */}
      <input
        placeholder="Search products..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="product-grid">
        {products
          .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
          .map((p, i) => (
            <div className="product-card" key={i}>

              <img
                src={`http://127.0.0.1:8000/media/${p.image}`}
                alt=""
              />

              <h3>{p.name}</h3>
              <p>₹{p.price}</p>

              <p>👨‍🌾 Farmer: {p.user_mobile}</p>

              <p>Stock: {p.stock}</p>

              <button onClick={() => addToCart(p)}>
                Add to Cart
              </button>

            </div>
          ))}
      </div>

    </div>
  );
}

export default Shop;