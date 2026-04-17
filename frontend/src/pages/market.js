import React, { useState, useEffect } from "react";
import axios from "axios";
import "./market.css";

function Market() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [newCategory, setNewCategory] = useState("");

  const [newProduct, setNewProduct] = useState({
  id: "",
  name: "",
  price: "",
  stock: "",
  category: "",
  description: "",   // ✅ NEW
  image: null
    });

  const [preview, setPreview] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  // 🔄 Fetch data
  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/market-data/",
        { params: { mobile: user?.mobile } }
      );

      setCategories(res.data.categories || []);
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // ✅ useEffect always on top
  useEffect(() => {
    if (user) fetchData();
  }, []);

  if (!user) {
    return <h2>Please login first</h2>;
  }

  // ➕ Add Category
  const addCategory = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/add-category/", {
        name: newCategory,
        user_mobile: user.mobile
      });
      setNewCategory("");
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding category");
    }
  };

  // ➕ Add / Update Product
  const addProduct = async () => {
    const formData = new FormData();

    formData.append("id", newProduct.id || "");
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("stock", newProduct.stock);
    formData.append("description", newProduct.description);
    formData.append("category", newProduct.category);
    formData.append("user_mobile", user.mobile);

    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/add-product/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(isEdit ? "Product updated" : "Product added");

      setNewProduct({
        name: "",
        price: "",
        stock: "",
        category: "",
        image: null
      });

      setPreview(null);
      setIsEdit(false);

      fetchData();
    } catch (error) {
      console.error(error);
      alert("Error saving product");
    }
  };

  // 🗑 Delete Product
  const handleDelete = async (name) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.post("http://127.0.0.1:8000/api/delete-product/", {
        name,
        user_mobile: user.mobile
      });

      alert("Deleted successfully");
      fetchData();
    } catch (error) {
      alert("Delete failed");
    }
  };

  // ✏️ Edit Product
  const handleEdit = (p) => {
  setNewProduct({
    id: p._id,   // ✅ VERY IMPORTANT
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category,
    image: null
  });

  setPreview(`http://127.0.0.1:8000/media/${p.image}`);
  setIsEdit(true);
};


const updateStock = async (id, newStock) => {
  if (newStock < 0) return;

  try {
    await axios.post("http://127.0.0.1:8000/api/update-stock/", {
      id: id,
      stock: newStock
    });

    fetchData(); // refresh UI
  } catch (error) {
    console.error(error);
    alert("Stock update failed");
  }
};


  return (
    <div className="market-container">

      <h1 className="market-title">🌾 Market Management</h1>

      {/* CATEGORY */}
      <div className="section">
        <h3>➕ Add Category</h3>
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Category name"
        />
        <button onClick={addCategory}>Add</button>

        <div className="category-list">
          {categories.map((c, i) => (
            <span key={i} className="category-badge">{c}</span>
          ))}
        </div>
      </div>

      {/* PRODUCT FORM */}
      <div className="section">
        <h3>{isEdit ? "✏️ Edit Product" : "➕ Add Product"}</h3>

        <input
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
        />

        <input
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />

        <input
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
        />

        <textarea
        placeholder="Product Description"
        value={newProduct.description}
        onChange={(e) =>
        setNewProduct({ ...newProduct, description: e.target.value })
        }
        />

        <select
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
        >
          <option value="">Select Category</option>
          {categories.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>

        {/* IMAGE PREVIEW */}
        {preview && (
          <img src={preview} alt="preview" className="preview-img" />
        )}

        <input
          type="file"
          onChange={(e) => {
            setNewProduct({ ...newProduct, image: e.target.files[0] });
            setPreview(URL.createObjectURL(e.target.files[0]));
          }}
        />

        <button onClick={addProduct}>
          {isEdit ? "Update Product" : "Add Product"}
        </button>
      </div>

      {/* PRODUCTS */}
      <div className="section">
        <h3>📦 Products</h3>

        <div className="product-grid">
          {products.map((p, i) => (
            <div key={i} className="product-card">

              <img
                src={
                  p.image
                    ? `http://127.0.0.1:8000/media/${p.image}`
                    : "https://via.placeholder.com/150"
                }
                alt={p.name}
                className="product-img"
              />

              <h3>{p.name}</h3>

                <p className="price">₹{p.price}</p>

                <p className="category">Category: {p.category}</p>

                <p className="description">
                    {p.description || "No description"}
                </p>

            <div className="stock-control">

            <button onClick={() => updateStock(p._id, p.stock - 1)}>➖</button>

            <span>{p.stock}</span>

            <button onClick={() => updateStock(p._id, p.stock + 1)}>➕</button>

            </div>

            <p className={p.stock > 0 ? "in-stock" : "out-stock"}>
                {p.stock > 0 ? "🟢 In Stock" : "🔴 Out of Stock"}
            </p>

              <div className="card-actions">
                <button onClick={() => handleEdit(p)}>✏️ Edit</button>
                <button onClick={() => handleDelete(p.name)}>🗑 Delete</button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Market;