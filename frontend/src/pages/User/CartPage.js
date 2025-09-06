import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { IoAddCircle, IoRemoveCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/cart/getCart`,
        { withCredentials: true }
      );
      setCartItems(data.cart);
      setLoading(false);
    };

    fetchCartItems();
  }, [loading]);

  const handleIncrement = async (productId) => {
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/incrementQty`,
        { productId },
        { withCredentials: true }
      );
    } catch (error) {
      toast.error(error.message);
      console.error("Error updating cart:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async (productId) => {
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/decrementQty`,
        { productId },
        { withCredentials: true }
      );
    } catch (error) {
      toast.error(error.message);
      console.error("Error updating cart:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/removeFromCart`,
        { productId },
        { withCredentials: true }
      );

      if (data.success) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item._id !== productId)
        );
      }
    } catch (error) {
      console.error("Error removing from cart:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item?.product?.price * item?.quantity,
    0
  );

  const handleCheckout = () => {
    navigate("/checkout", { state: { cartItems, totalPrice } });
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  {/* Product Image */}
                  <img
                    src={
                      item?.product?.images[0] ||
                      "https://via.placeholder.com/100"
                    }
                    alt={item.product.name}
                    className={`w-16 h-16 object-cover rounded-lg border dark:border-gray-700 ${
                      !item.product.inStock || !item.product?.shop?.isOpen
                        ? "opacity-50"
                        : ""
                    }`}
                  />

                  {/* Product Details */}
                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      ₹{item.product?.price} x {item?.quantity}
                    </p>

                    {/* Stock Status */}
                    {!item.product.inStock && (
                      <p className="text-red-500 text-sm font-semibold">
                        Out of Stock
                      </p>
                    )}

                    {/* Shop Status */}
                    <p
                      className={`text-sm font-semibold ${
                        item.product.shop?.isOpen ? "" : "text-red-500"
                      }`}
                    >
                      {!item.product.shop?.isOpen && "Shop Closed"}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <IoRemoveCircle
                      className="rounded-full cursor-pointer"
                      onClick={() =>
                        item.quantity > 1
                          ? handleDecrement(item.product._id)
                          : removeFromCart(item.product._id)
                      }
                    />
                    <span className="text-lg font-semibold text-green-500">
                      {item.quantity}
                    </span>
                    <IoAddCircle
                      className="rounded-full cursor-pointer"
                      onClick={() => handleIncrement(item.product._id)}
                    />

                    {/* Remove Item */}
                    <button
                      className="text-red-500 hover:text-red-600 transition"
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      <MdDelete size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning if any shop is closed */}
            {cartItems.some((item) => !item?.product?.shop?.isOpen) && (
              <p className="text-red-500 text-sm font-semibold text-center mt-4">
                Some items are from closed shops. Please remove them before
                proceeding.
              </p>
            )}

            {/* Total Price & Checkout */}
            <div className="mt-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <button
                className={`w-full py-3 mt-6 rounded-lg font-semibold transition ${
                  cartItems.some(
                    (item) =>
                      !item.product.inStock || !item?.product?.shop?.isOpen
                  )
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
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
                  : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
