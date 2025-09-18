import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { IoAddCircle, IoRemoveCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

const CartPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/cart/getCart`,
          { withCredentials: true }
        );

        setCartItems(data.cart);

        const normalizedCart = data.cart.map((item) => ({
          productId: item.product?._id?.toString(),
          quantity: item.quantity,
        }));

        setUser((prev) => ({ ...prev, foodCart: normalizedCart }));

        const uniqueSellers = [
          ...new Set(data.cart.map((item) => item.product.seller)),
        ];
        setSellers(uniqueSellers);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleIncrement = async (productId) => {
    const prevItems = [...cartItems];
    const prevCart = [...(user.foodCart || [])];

    setCartItems((prev) =>
      prev.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );

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

      if (!data.success) {
        // Rollback
        setCartItems(prevItems);
        setUser((prevUser) => ({ ...prevUser, foodCart: prevCart }));
        throw new Error("Increment failed");
      }
    } catch (error) {
      setCartItems(prevItems);
      setUser((prevUser) => ({ ...prevUser, foodCart: prevCart }));
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const handleDecrement = async (productId) => {
    const prevItems = [...cartItems];
    const prevCart = [...(user.foodCart || [])];

    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    setUser((prev) => ({
      ...prev,
      foodCart: prev.foodCart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/decrementQty`,
        { productId },
        { withCredentials: true }
      );

      if (!data.success) {
        // Rollback
        setCartItems(prevItems);
        setUser((prevUser) => ({ ...prevUser, foodCart: prevCart }));
        throw new Error("Decrement failed");
      }
    } catch (error) {
      setCartItems(prevItems);
      setUser((prevUser) => ({ ...prevUser, foodCart: prevCart }));
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const removeFromCart = async (productId) => {
    const prevItems = [...cartItems];
    const prevCart = [...(user.foodCart || [])];

    setCartItems((prev) =>
      prev.filter((item) => item.product._id !== productId)
    );

    setUser((prevUser) => ({
      ...prevUser,
      foodCart: prevUser.foodCart.filter((item) => item.productId !== productId),
    }));

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/removeFromCart`,
        { productId },
        { withCredentials: true }
      );

      if (!data.success) {
        // Rollback
        setCartItems(prevItems);
        setUser((prevUser) => ({ ...prevUser, foodCart: prevCart }));
        throw new Error("Remove failed");
      }
    } catch (error) {
      console.error("Error removing from cart:", error.message);
      setCartItems(prevItems);
      setUser((prevUser) => ({ ...prevUser, foodCart: prevCart }));
      toast.error("Failed to remove product. Please try again.");
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item?.product?.price * item?.quantity,
    0
  );

  const handleCheckout = () => {
    navigate("/checkout", { state: { cartItems, totalPrice, sellers } });
  };

  return (
    <div>
      <Navbar />
      <main className="mb-20 pt-8 px-4 lg:px-8 min-h-screen bg-gray-100 dark:bg-gray-900 lg:mb-0">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white text-center">
          Your Cart
        </h1>

        {loading ? (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <span className="w-3 h-3 bg-green-700 rounded-full animate-bounce [animation-delay:0s]"></span>
            <span className="w-3 h-3 bg-green-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        ) : cartItems.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Sad cart alert! Time to grab some treats 🍕🍔
          </p>
        ) : (
          <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-xl max-w-3xl mx-auto border border-green-100 dark:border-gray-700">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center justify-between border-b border-green-100 dark:border-gray-700 pb-4"
                >
                  {/* Product Image */}
                  <img
                    src={
                      item?.product?.images[0] ||
                      "https://via.placeholder.com/100"
                    }
                    alt={item.product.name}
                    className={`w-16 h-16 object-cover rounded-xl shadow-md ${
                      !item.product.inStock || !item.product?.shop?.isOpen
                        ? "opacity-50 grayscale"
                        : ""
                    }`}
                  />

                  {/* Product Details */}
                  <div className="flex-1 ml-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {item.product.name}
                    </h3>
                    <p className="text-green-600 font-medium text-sm">
                      {item.product.shopName}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      ₹{item.product?.price} x {item?.quantity}
                    </p>

                    {/* Stock / Shop Status */}
                    {!item.product.inStock && (
                      <p className="text-red-500 text-xs font-semibold mt-1">
                        Out of Stock 🚫
                      </p>
                    )}
                    {!item.product.shop?.isOpen && (
                      <p className="text-red-500 text-xs font-semibold mt-1">
                        Shop Closed 💤
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-gray-700 px-3 py-1 rounded-full shadow-inner">
                    <IoRemoveCircle
                      className="text-red-500 hover:text-red-600 text-2xl cursor-pointer transition"
                      onClick={() =>
                        item.quantity > 1
                          ? handleDecrement(item.product._id)
                          : removeFromCart(item.product._id)
                      }
                    />
                    <span className="text-lg font-bold text-green-700 dark:text-green-300 w-6 text-center">
                      {item.quantity}
                    </span>
                    <IoAddCircle
                      className="text-green-500 hover:text-green-600 text-2xl cursor-pointer transition"
                      onClick={() => handleIncrement(item.product._id)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Warning if any shop is closed */}
            {cartItems.some((item) => !item?.product?.shop?.isOpen) && (
              <p className="text-red-500 text-sm font-semibold text-center mt-4">
                ⚠️ Some items are from closed shops. Remove them before
                checkout.
              </p>
            )}

            {/* Multi-seller warning */}
            {sellers.length > 1 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-lg text-sm font-medium shadow-sm">
                ⚡ Your order has items from <b>{sellers.length}</b> shops. A{" "}
                <span className="font-semibold">convenience fee</span> may
                apply.
              </div>
            )}

            {/* Total Price & Checkout */}
            <div className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl shadow-inner">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <button
                className={`w-full py-3 mt-6 rounded-xl font-semibold transition shadow-lg ${
                  cartItems.some(
                    (item) =>
                      !item.product.inStock || !item?.product?.shop?.isOpen
                  )
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 hover:shadow-xl"
                }`}
                onClick={handleCheckout}
                disabled={cartItems.some(
                  (item) =>
                    !item.product.inStock || !item?.product?.shop?.isOpen
                )}
              >
                {cartItems.some(
                  (item) =>
                    !item.product.inStock || !item?.product?.shop?.isOpen
                )
                  ? "Remove Unavailable Items"
                  : "Proceed to Checkout 🚀"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
