import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaRegCircleDot } from "react-icons/fa6";

const DietIcon = ({ type }) => {
  switch (type) {
    case "Vegetarian":
    case "Veg":
      return <FaRegCircleDot color="green" size={16} />;
    case "Egg":
      return <FaRegCircleDot color="yellow" size={16} />;
    case "Non-Vegetarian":
      return <FaRegCircleDot color="red" size={16} />;
    default:
      return null;
  }
};

const ProductCard = ({ product, bestSeller, user, setUser, variant = "foodCart" }) => {
  const [loading, setLoading] = useState(false);

  const prevCart = [...(user?.foodCart || [])];

  const addProductToCart = async () => {
    if (loading) return;
    if (!user) {
      toast.warning("Please login first");
      return;
    }

    setUser((prev) => ({
      ...prev,
      foodCart: [...prev.foodCart, { productId: product._id, quantity: 1 }],
    }));

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/addToCart`,
        { productId: product._id },
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message);
      toast.success("Product added to cart!");
    } catch (err) {
      setUser((prev) => ({ ...prev, foodCart: prevCart }));
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async (productId) => {
    if (loading) return;
    setUser((prev) => ({
      ...prev,
      foodCart: prev.foodCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    }));

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/incrementQty`,
        { productId },
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message);
    } catch {
      toast.error("Could not update quantity");
      setUser((prev) => ({
        ...prev,
        foodCart: prev.foodCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      }));
    }
  };

  const handleDecrement = async (productId) => {
    if (loading) return;
    const item = user?.foodCart?.find((i) => i.productId === productId);
    if (!item) return;

    if (item.quantity === 1) {
      return removeFromCart(productId);
    }

    setUser((prev) => ({
      ...prev,
      foodCart: prev.foodCart.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
      ),
    }));

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/decrementQty`,
        { productId },
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message);
    } catch {
      toast.error("Could not update quantity");
      setUser((prev) => ({
        ...prev,
        foodCart: prev.foodCart.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      }));
    }
  };

  const removeFromCart = async (productId) => {
    if (loading) return;

    const prevCart = [...(user?.foodCart || [])];
    setUser((prev) => ({
      ...prev,
      foodCart: prev.foodCart.filter((i) => i.productId !== productId),
    }));

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/removeFromCart`,
        { productId },
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message);
      toast.success("Product removed from cart!");
    } catch (err) {
      setUser((prev) => ({ ...prev, foodCart: prevCart }));
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const cartItem = user?.foodCart?.find(
    (item) => item?.productId?.toString() === product?._id?.toString()
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 relative">
      {bestSeller && (
        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-b-lg z-10">
          Bestseller
        </span>
      )}

      {/* IMAGE */}
      <div className="relative">
        <img
          className={`w-full h-32 object-cover rounded-md ${
            !product?.inStock ? "opacity-50" : ""
          }`}
          src={product.images?.[0] || "https://via.placeholder.com/150"}
          alt={product.name || "Product"}
          onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
        />

        {!product?.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-md">
            <span className="text-white font-semibold text-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* CART CONTROLS */}
        {product.inStock && (
          <div className="absolute bottom-0 w-full">
            {cartItem ? (
              <div className="bg-green-500 flex items-center justify-evenly px-2 rounded-b-md text-white">
                <button
                  className="font-bold"
                  onClick={() => handleDecrement(product._id)}
                  disabled={loading}
                >
                  −
                </button>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                ) : (
                  <span className="text-sm font-semibold">
                    {cartItem.quantity}
                  </span>
                )}
                <button
                  className="font-bold"
                  onClick={() => handleIncrement(product._id)}
                  disabled={loading}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="w-full bg-green-500 text-white text-xs font-semibold py-1 rounded-b-md hover:bg-green-600 transition cursor-pointer"
                onClick={() => addProductToCart(product._id)}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* INFO */}
      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        {product.name || "Product Name"}
        {variant === "food" && <DietIcon type={product.dietType} />}
      </h3>

      {variant === "food" && (
        <p className="mt-1 text-xs text-yellow-500 dark:text-yellow-400">
          {product.shopName || "Shop Name"}
        </p>
      )}

      <p className="mt-1 text-sm text-green-500 font-semibold">
        ₹{product.price || "N/A"}
      </p>
    </div>
  );
};

export default ProductCard;
