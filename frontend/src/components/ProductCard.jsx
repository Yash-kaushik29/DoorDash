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
    <div
      className="
    relative rounded-2xl overflow-hidden
    bg-white/80 dark:bg-gray-800/80
    backdrop-blur-md
    shadow-md hover:shadow-red-300/30
    transition-all duration-300
    hover:-translate-y-1
  "
    >
      {/* 🎁 DISCOUNT TAG */}
      {product.basePrice > product.price && (
        <span
          className="
        absolute top-3 left-3 z-20
        bg-gradient-to-r from-red-500 to-orange-500
        text-white text-xs font-bold
        px-3 py-1 rounded-full shadow-lg
      "
        >
          {Math.round(
            ((product.basePrice - product.price) / product.basePrice) * 100
          )}
          % OFF
        </span>
      )}

      {/* 🖼 IMAGE CONTAINER */}
      <div className="relative">
        {bestSeller && (
          <span className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-b-lg z-10">
            {" "}
            Bestseller{" "}
          </span>
        )}

        <img
          src={
            product.images?.[0] ||
            "https://tse3.mm.bing.net/th/id/OIP.j9lwZI84idgGDQj02DAXCgHaHa?pid=Api"
          }
          alt={product.name}
          className="
        w-full h-36 object-cover
        transition-transform duration-500
        hover:scale-110
      "
        />

        {product.dietType && (
          <div className="absolute top-2 right-2">
            <DietIcon type={product.dietType} />
          </div>
        )}

        {/* 🚫 STOCK */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Not Available</span>
          </div>
        )}

        {/* 🛒 CTA */}
        {product.inStock && (
          <div className="absolute bottom-0 w-full">
            {cartItem ? (
              <div
                className="
            bg-gradient-to-r from-green-500 to-emerald-500
            flex items-center justify-evenly
            text-white py-1
          "
              >
                <button onClick={() => handleDecrement(product._id)}>−</button>
                <span className="text-sm font-semibold">
                  {cartItem.quantity}
                </span>
                <button onClick={() => handleIncrement(product._id)}>+</button>
              </div>
            ) : (
              <button
                onClick={addProductToCart}
                className="
              w-full py-1 text-xs font-semibold
              bg-gradient-to-r from-green-500 to-emerald-500
              text-white hover:brightness-110
            "
              >
                Add
              </button>
            )}
          </div>
        )}
      </div>

      {/* 📝 INFO */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {product.name}
        </h3>

        {variant === "food" && (
          <p className="text-xs text-red-500 mt-1">{product.shopName}</p>
        )}

        {/* 💰 PRICE */}
        <div className="mt-1 text-sm">
          {product.basePrice > product.price ? (
            <>
              <span className="line-through text-gray-400 mr-2">
                ₹{product.basePrice}
              </span>
              <span className="text-green-600 font-semibold">
                ₹{product.price}
              </span>
            </>
          ) : (
            <span className="text-green-600 font-semibold">
              ₹{product.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
