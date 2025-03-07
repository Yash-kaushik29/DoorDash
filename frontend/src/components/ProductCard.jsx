import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ProductCard = ({ product, bestSeller, user, setUser }) => {
  const [loading, setLoading] = useState(false);

  // Add to Cart
  const addProductToCart = async () => {
    if (loading) return;

    console.log(user)

    if(!user) {
      toast.warning("Please login first");
      return ;
    }
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/cart/addToCart",
        { productId: product._id },
        { withCredentials: true }
      );

      if (data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          cart: [...prevUser?.cart, { productId: product._id, quantity: 1 }],
        }));
        toast.success("Product added to cart!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Increment Quantity
  const handleIncrement = async (productId) => {
    if (loading) return;
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/cart/incrementQty",
        { productId },
        { withCredentials: true }
      );

      if (data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          cart: prevUser.cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }));
      }
    } catch (error) {
      console.error("Error incrementing cart:", error.message);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Decrement Quantity
  const handleDecrement = async (productId) => {
    if (loading) return;
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/cart/decrementQty",
        { productId },
        { withCredentials: true }
      );

      if (data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          cart: prevUser.cart
            .map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        }));
      }
    } catch (error) {
      console.error("Error decrementing cart:", error.message);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remove from Cart
  const removeFromCart = async (productId) => {
    if (loading) return;
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/cart/removeFromCart",
        { productId },
        { withCredentials: true }
      );

      if (data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          cart: prevUser.cart.filter((item) => item.productId !== productId),
        }));
        toast.success("Product removed from cart!");
      }
    } catch (error) {
      console.error("Error removing from cart:", error.message);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
      {bestSeller && (
        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-b-lg z-10">
          Bestseller
        </span>
      )}
      <div className="relative">
        <img
          className="w-full h-32 object-cover rounded-md"
          src={product.images?.[0] || "https://via.placeholder.com/150"}
          alt={product.name || "Product"}
          onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
        />
        {user?.cart?.some((item) => item.productId === product._id) ? (
          user.cart.map((item) =>
            item.productId === product._id ? (
              <div
                key={item.productId}
                className="absolute bottom-0 w-full bg-green-500 flex items-center justify-evenly px-3 rounded-b-md text-white"
              >
                <button
                  className="text-white font-bold"
                  onClick={() =>
                    item.quantity === 1
                      ? removeFromCart(product._id)
                      : handleDecrement(product._id)
                  }
                  disabled={loading}
                >
                  −
                </button>
                <span className="text-sm font-semibold">{item.quantity}</span>
                <button
                  className="text-white font-bold"
                  onClick={() => handleIncrement(product._id)}
                  disabled={loading}
                >
                  +
                </button>
              </div>
            ) : null
          )
        ) : (
          <button
            className="absolute bottom-0 mt-2 w-full bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-b-md hover:bg-green-600 transition cursor-pointer"
            onClick={() => addProductToCart(product._id)}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        )}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {product.name || "Product Name"}
      </h3>
      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
        {product.shopName || "Shop Name"}
      </p>
      <p className="mt-1 text-sm text-green-500 font-semibold">
        ₹{product.price || "N/A"}
      </p>
    </div>
  );
};

export default ProductCard;
