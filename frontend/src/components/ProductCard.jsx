import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaRegCircleDot } from "react-icons/fa6";
import api from "../utils/axiosInstance";
import ReplacePopUp from "./ReplacePopUp";

const DietIcon = ({ type, size = 16 }) => {
  switch (type) {
    case "Vegetarian":
    case "Veg":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{ border: "1px solid green", borderRadius: 3 }}
        >
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r="30" fill="green" />
        </svg>
      );

    case "Non-Vegetarian":
    case "Non-Veg":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{ border: "1px solid red", borderRadius: 3 }}
        >
          <rect width="100" height="100" fill="white" />
          <polygon points="50,20 80,80 20,80" fill="red" />
        </svg>
      );

    case "Egg":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{ border: "1px solid gold", borderRadius: 3 }}
        >
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r="30" fill="gold" />
        </svg>
      );

    default:
      return null;
  }
};

const ProductCard = ({
  product,
  bestSeller,
  user,
  setUser,
  variant = "food",
}) => {
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState("");
  const [showReplacePopup, setShowReplacePopup] = useState(false);
  const [newProduct, setNewProduct] = useState("");

  const cartKey = variant === "grocery" ? "groceryCart" : "foodCart";

  const cartItem = user?.[cartKey]?.find(
    (i) => i.productId?.toString() === product?._id?.toString()
  );

  const addProductToCart = async () => {
    if (loading) return;
    if (!user) return toast.warning("Please login first");

    setLoading(true);
    try {
      const { data } = await api.post(
        `/api/cart/addToCart`,
        { productId: product._id, cartKey },
        {
          withCredentials: true,
        }
      );
      if (!data.success) throw new Error(data.message);
      toast.success("Product added to cart!");
      setUser((prev) => ({
        ...prev,
        [cartKey]: [...prev[cartKey], { productId: product._id, quantity: 1 }],
      }));
    } catch (err) {
      if (err.response?.data?.type === "DIFFERENT_SHOP") {
        setNewProduct(product._id);
        setShopName(err.response?.data?.shopName || "Other Shop");
        setShowReplacePopup(true);
      } else {
        toast.error(err.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async (productId) => {
    if (loading) return;

    // Optimistic UI update
    setUser((prev) => ({
      ...prev,
      [cartKey]: prev[cartKey].map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
      ),
    }));

    try {
      const { data } = await api.post(
        `/api/cart/incrementQty`,
        { productId, cartKey },
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message);
    } catch {
      toast.error("Could not update quantity");
    }
  };

  const handleDecrement = async (productId) => {
    if (loading) return;
    const item = cartItem;
    if (!item) return;

    if (item.quantity === 1) return removeFromCart(productId);

    // Optimistic UI update
    setUser((prev) => ({
      ...prev,
      [cartKey]: prev[cartKey].map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
      ),
    }));

    try {
      const { data } = await api.post(
        `/api/cart/decrementQty`,
        { productId, cartKey },
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message);
    } catch {
      toast.error("Could not update quantity");
    }
  };

  const removeFromCart = async (productId) => {
    if (loading) return;
    const prevCart = [...(user?.[cartKey] || [])];

    // Optimistic UI update
    setUser((prev) => ({
      ...prev,
      [cartKey]: prev[cartKey].filter((i) => i.productId !== productId),
    }));

    setLoading(true);
    try {
      const { data } = await api.post(
        `/api/cart/removeFromCart`,
        { productId, cartKey },
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message);
      toast.success("Product removed from cart!");
    } catch (err) {
      // rollback
      setUser((prev) => ({ ...prev, [cartKey]: prevCart }));
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const replaceCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.post(
        "/api/cart/replaceCart",
        { productId: product._id, cartKey },
        { withCredentials: true }
      );
      if (!data.success) throw new Error(data.message);

      toast.success("Cart updated successfully!");
      setShowReplacePopup(false);
      setUser((prev) => ({
        ...prev,
        [cartKey]: data.cart,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (showReplacePopup) {
    return (
      <ReplacePopUp
        onCancel={() => setShowReplacePopup(false)}
        shopName={shopName}
        currShopName={product.shopName}
        newProduct={newProduct}
        replaceCart={replaceCart}
        loading={loading}
      />
    );
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
      {/* DISCOUNT BANNER */}
      {product.basePrice > product.price && (
        <span
          className={`absolute -top-2 left-2 bg-yellow-500 text-white text-xs text-center font-bold px-2 py-2 rounded-tr-lg rounded-bl-lg shadow-lg z-10 ${
            Math.round(
              ((product.basePrice - product.price) / product.basePrice) * 100
            ) > 20 && "animate-pulse"
          }`}
        >
          {Math.round(
            ((product.basePrice - product.price) / product.basePrice) * 100
          )}
          %<p>OFF</p>
        </span>
      )}

      {bestSeller && (
        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-b-lg z-10">
          Bestseller
        </span>
      )}

      {/* IMAGE */}
      <div className="relative">
        <img
          className="w-full h-32 object-cover rounded-md"
          src={
            product.images?.[0] ||
            "https://tse3.mm.bing.net/th/id/OIP.j9lwZI84idgGDQj02DAXCgHaHa?pid=Api&P=0&h=180"
          }
          alt={product.name}
          onError={(e) =>
            (e.target.src =
              "https://tse3.mm.bing.net/th/id/OIP.j9lwZI84idgGDQj02DAXCgHaHa?pid=Api&P=0&h=180")
          }
        />

        {product.dietType && (
          <div className="absolute right-2 top-2">
            <DietIcon type={product.dietType} />
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60 rounded-md">
            <span className="text-white font-bold text-sm">
              {product.shopType === "Grocery" ? "Out of Stock" : "Not Available"}
            </span>
          </div>
        )}
        {product.inStock && (
          <div className="absolute bottom-0 w-full">
            {cartItem ? (
              <div className="bg-green-500 flex items-center justify-evenly px-2 rounded-b-md text-white">
                <button
                  onClick={() => handleDecrement(product._id)}
                  disabled={loading}
                >
                  −
                </button>
                <span className="text-sm font-semibold">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => handleIncrement(product._id)}
                  disabled={loading}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="w-full bg-green-500 text-white text-xs py-1 rounded-b-md hover:bg-green-600"
                onClick={addProductToCart}
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
        {product.name}
      </h3>

      {variant === "food" && (
        <p className="mt-1 text-xs text-yellow-500">{product.shopName}</p>
      )}

      {product.price < product.basePrice ? (
        <p className="mt-1 text-sm">
          <span className="line-through text-gray-400 mr-2">
            ₹{product.basePrice}
          </span>
          <span className="text-green-500 font-semibold">₹{product.price}</span>
        </p>
      ) : (
        <p className="mt-1 text-green-500 font-semibold text-sm">
          ₹{product.price}
        </p>
      )}
    </div>
  );
};

export default ProductCard;
