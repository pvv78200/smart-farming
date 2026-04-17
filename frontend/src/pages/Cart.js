import React, { useEffect, useState } from "react";
import axios from "axios";
import "./cart.css";

function Cart() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState({});
  const [showAddress, setShowAddress] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const mobile = localStorage.getItem("customer");

  useEffect(() => {
    fetchCart();
    fetchAddress();
  }, []);

  const fetchCart = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/get-cart/", {
      params: { mobile }
    });
    setCart(res.data.cart.products || []);
  };

  const fetchAddress = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/get-address/", {
      params: { mobile }
    });
    setAddress(res.data.address || {});
  };

  const getTotal = () =>
    cart.reduce((t, i) => t + i.price * i.quantity, 0);

  // ================= PAYMENT =================

  const handleCOD = async () => {
  const mobile = localStorage.getItem("customer");

  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/cod-checkout/",
      { mobile },
      { responseType: "blob" } // 🔥 IMPORTANT
    );

    // 📄 Download PDF
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "invoice.pdf");
    document.body.appendChild(link);
    link.click();

    alert("Order placed successfully 🎉");
    setCart([]);

  } catch (err) {
    alert("COD failed");
  }
};

  const handleOnline = async () => {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/create-payment/",
      { mobile }
    );

    const options = {
      key: "rzp_test_SeEsBzgMu6OWWn",
      amount: res.data.amount,
      currency: "INR",
      order_id: res.data.order_id,

      handler: async function (response) {
  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/verify-payment/",
      { mobile },
      { responseType: "blob" } // 🔥 IMPORTANT
    );

    // 📄 Download invoice
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "invoice.pdf");
    document.body.appendChild(link);
    link.click();

    alert("Payment Successful 🎉");
    setCart([]);

  } catch (err) {
    alert("Error generating invoice");
  }
}
    };

    new window.Razorpay(options).open();
  };

  return (
    <div className="cart-container">

      <h2>🛒 Your Cart</h2>

      {/* ✅ CURRENT ADDRESS DISPLAY */}
      <div className="address-box">
        <h3>📍 Delivery Address</h3>
        {address?.address ? (
          <p>
            {address.name} <br />
            {address.address}, {address.town} <br />
            {address.district} - {address.pincode}
          </p>
        ) : (
          <p>No address added</p>
        )}

        <button onClick={() => setShowAddress(true)}>
          Edit / Add Address
        </button>
      </div>

      {/* CART ITEMS */}
      {cart.map((item, i) => (
        <div className="cart-card" key={i}>
          <h3>{item.name}</h3>
          <p>₹{item.price}</p>
          <p>Qty: {item.quantity}</p>
          <p>Subtotal: ₹{item.price * item.quantity}</p>
        </div>
      ))}

      <h2>Total: ₹{getTotal()}</h2>

      <button
        className="checkout-btn"
        onClick={() => setShowPayment(true)}
      >
        Proceed to Checkout
      </button>

      {/* ================= ADDRESS POPUP ================= */}
      {showAddress && (
        <div className="modal">
          <div className="modal-box">
            <h3>Edit Address</h3>

            <input placeholder="Name"
              defaultValue={address.name}
              onChange={e => setAddress({...address, name:e.target.value})}
            />
            <input placeholder="Address"
              defaultValue={address.address}
              onChange={e => setAddress({...address, address:e.target.value})}
            />
            <input placeholder="Mobile Number"
              defaultValue={address.mobile}
              onChange={(e) =>
                setAddress({ ...address, mobile: e.target.value })
              }
            />
            <input placeholder="Town"
              defaultValue={address.town}
              onChange={e => setAddress({...address, town:e.target.value})}
            />
            <input placeholder="District"
              defaultValue={address.district}
              onChange={e => setAddress({...address, district:e.target.value})}
            />
            <input placeholder="Pincode"
              defaultValue={address.pincode}
              onChange={e => setAddress({...address, pincode:e.target.value})}
            />

            <button onClick={async () => {
              await axios.post("http://127.0.0.1:8000/api/save-address/", {
                mobile,
                ...address
              });
              setShowAddress(false);
              fetchAddress();
            }}>
              Save
            </button>

            <button onClick={() => setShowAddress(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ================= PAYMENT POPUP ================= */}
      {showPayment && (
        <div className="modal">
          <div className="modal-box">
            <h3>Choose Payment</h3>

            <button onClick={handleOnline}>
              💳 Pay Online
            </button>

            <button onClick={handleCOD}>
              💵 Cash on Delivery
            </button>

            <button onClick={() => setShowPayment(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Cart;