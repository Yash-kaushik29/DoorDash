import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { IoAddCircle, IoRemoveCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import api from "../../utils/axiosInstance";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const CartPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [foodCartItems, setFoodCartItems] = useState([]);
  const [groceryCartItems, setGroceryCartItems] = useState([]);
  const [activeCart, setActiveCart] = useState("foodCart");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sampleProduct =
    activeCart === "foodCart"
      ? foodCartItems[0]?.product
      : groceryCartItems[0]?.product;
  const shopLat = sampleProduct?.shop?.lat;
  const shopLong = sampleProduct?.shop?.long;
  const shopName = sampleProduct?.shopName;
  const shopDiscount = sampleProduct?.shop?.shopDiscount || 0;

  // Fetch carts
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const { data } = await api.get("/api/cart/getCart", {
          withCredentials: true,
        });

        setFoodCartItems(data.foodCart || []);
        setGroceryCartItems(data.groceryCart || []);

        const normalizedFoodCart = (data.foodCart || []).map((item) => ({
          productId: item.product?._id,
          quantity: item.quantity,
        }));

        const normalizedGroceryCart = (data.groceryCart || []).map((item) => ({
          productId: item.product?._id,
          quantity: item.quantity,
        }));

        setUser((prev) => ({
          ...prev,
          foodCart: normalizedFoodCart,
          groceryCart: normalizedGroceryCart,
        }));
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, [setUser]);

  // Update cart item
  const updateCartItem = async (productId, type, cartKey) => {
    const cartItems =
      cartKey === "foodCart" ? [...foodCartItems] : [...groceryCartItems];
    const prevContextCart = [...(user[cartKey] || [])];

    const updatedItems = cartItems
      .map((item) =>
        item.product._id === productId
          ? {
              ...item,
              quantity: type === "inc" ? item.quantity + 1 : item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    // Update local state
    if (cartKey === "foodCart") setFoodCartItems(updatedItems);
    else setGroceryCartItems(updatedItems);

    // Update context
    setUser((prev) => ({
      ...prev,
      [cartKey]: prev[cartKey]
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity:
                  type === "inc" ? item.quantity + 1 : item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));

    try {
      const endpoint =
        type === "inc" ? "/api/cart/incrementQty" : "/api/cart/decrementQty";
      const { data } = await api.post(
        `${endpoint}`,
        { productId, cartKey },
        { withCredentials: true }
      );

      if (!data.success) throw new Error("Update failed");
    } catch (err) {
      // Rollback
      if (cartKey === "foodCart") setFoodCartItems(cartItems);
      else setGroceryCartItems(cartItems);

      setUser((prev) => ({ ...prev, [cartKey]: prevContextCart }));
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId, cartKey) => {
    const cartItems =
      cartKey === "foodCart" ? [...foodCartItems] : [...groceryCartItems];
    const prevContextCart = [...(user[cartKey] || [])];

    const updatedItems = cartItems.filter(
      (item) => item.product._id !== productId
    );

    if (cartKey === "foodCart") setFoodCartItems(updatedItems);
    else setGroceryCartItems(updatedItems);

    setUser((prev) => ({
      ...prev,
      [cartKey]: prev[cartKey].filter((item) => item.productId !== productId),
    }));

    try {
      const { data } = await api.post(
        `/api/cart/removeFromCart`,
        { productId, cartKey },
        { withCredentials: true }
      );

      if (!data.success) throw new Error("Remove failed");
    } catch (err) {
      // Rollback
      if (cartKey === "foodCart") setFoodCartItems(cartItems);
      else setGroceryCartItems(cartItems);

      setUser((prev) => ({ ...prev, [cartKey]: prevContextCart }));
      toast.error("Failed to remove product. Please try again.");
    }
  };

  const getTotalPrice = (items) =>
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    const cartItems =
      activeCart === "foodCart" ? foodCartItems : groceryCartItems;

    const totalPrice = getTotalPrice(cartItems) * (1 - shopDiscount / 100);

    navigate("/checkout", {
      state: {
        cartItems,
        totalPrice,
        cartKey: activeCart,
        shopLat,
        shopLong,
      },
    });
  };

  const currentCartItems =
    activeCart === "foodCart" ? foodCartItems : groceryCartItems;

  // Dynamic sellers array
  // const currentSellers = [
  //   ...new Set(currentCartItems.map((item) => item.product.seller)),
  // ];

  return (
    <div>
      <Navbar />

      <main
        className="
      mb-20 lg:mb-0 pt-8 px-4 lg:px-8 min-h-screen
      bg-gradient-to-b from-green-50 via-white to-emerald-50
      dark:from-gray-900 dark:to-gray-900
    "
      >
        {/* PAGE TITLE */}
        <h1 className="text-2xl font-semibold mb-6 text-center text-green-700 dark:text-green-400">
          🛒 Your Cart
        </h1>

        {/* CART TABS */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeCart === "foodCart"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
            onClick={() => setActiveCart("foodCart")}
          >
            🍔 Food Cart ({user?.foodCart?.length})
          </button>

          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeCart === "groceryCart"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
            onClick={() => setActiveCart("groceryCart")}
          >
            🛒 Grocery Cart ({user?.groceryCart?.length})
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <span className="w-3 h-3 bg-green-700 rounded-full animate-bounce [animation-delay:0s]" />
            <span className="w-3 h-3 bg-green-600 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        ) : currentCartItems?.length === 0 ? (
          /* EMPTY CART */
          <div className="flex flex-col items-center mt-12">
            <DotLottieReact
              src="/lottie/EmptyCart.lottie"
              loop
              autoplay
              className="w-64 h-64"
            />
            <p className="text-center font-semibold text-xl text-gray-500 dark:text-gray-400">
              Your {activeCart === "foodCart" ? "food" : "grocery"} cart is
              empty.
            </p>
          </div>
        ) : (
          /* CART CONTENT */
          <div
            className="
          max-w-3xl mx-auto p-6 rounded-2xl
          bg-gradient-to-br from-green-50 via-white to-emerald-50
          dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
          border border-green-100 dark:border-gray-700
          shadow-xl
          flex flex-col
        "
          >
            {/* SHOP NAME */}
            <div className="text-center text-green-600 font-semibold mb-4">
              Ordering from {shopName}
            </div>

            {/* CART ITEMS */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {currentCartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="
                flex items-center justify-between
                border-b border-green-200/60 dark:border-gray-700
                pb-4
              "
                >
                  <img
                    src={
                      item?.product?.images[0] ||
                      "https://via.placeholder.com/100"
                    }
                    alt={item.product.name}
                    className={`w-16 h-16 rounded-xl object-cover shadow-md ${
                      !item.product.inStock || !item.product?.shop?.isOpen
                        ? "opacity-50 grayscale"
                        : ""
                    }`}
                  />

                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-md">
                      {item.product.name}
                    </h3>

                    {shopDiscount > 0 ? (
                      <p className="mt-1 text-sm">
                        <span className="line-through text-gray-400 mr-2">
                          ₹{item.product.price}
                        </span>
                        <span className="text-green-600 font-semibold">
                          ₹
                          {Math.round(
                            item.product.price -
                              (item.product.price * shopDiscount) / 100
                          )}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-1 text-green-600 font-semibold text-sm">
                        ₹{item.product.price}
                      </p>
                    )}

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

                  {/* QUANTITY */}
                  <div className="flex items-center gap-2 bg-green-100/80 dark:bg-gray-700 px-3 py-1 rounded-full shadow-inner">
                    <IoRemoveCircle
                      className="text-red-500 hover:text-red-600 text-2xl cursor-pointer transition"
                      onClick={() =>
                        item.quantity > 1
                          ? updateCartItem(item.product._id, "dec", activeCart)
                          : removeFromCart(item.product._id, activeCart)
                      }
                    />
                    <span className="text-lg font-bold text-green-700 dark:text-green-300 w-6 text-center">
                      {item.quantity}
                    </span>
                    <IoAddCircle
                      className="text-green-500 hover:text-green-600 text-2xl cursor-pointer transition"
                      onClick={() =>
                        updateCartItem(item.product._id, "inc", activeCart)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* WARNINGS */}
            {currentCartItems.some((item) => !item?.product?.shop?.isOpen) && (
              <p className="text-red-500 text-sm font-semibold text-center mt-4">
                ⚠️ Some items are from closed shops. Remove them before
                checkout.
              </p>
            )}

            {/* TOTAL & CHECKOUT */}
            <div
              className="
            mt-6 p-4 rounded-xl
            bg-gradient-to-r from-green-100 to-emerald-100
            dark:from-gray-700 dark:to-gray-800
            border border-green-200/60
            shadow-inner sticky bottom-0
          "
            >
              {shopDiscount > 0 ? (
                (() => {
                  const originalTotal = getTotalPrice(currentCartItems);
                  const discountAmount = Math.round(
                    (originalTotal * shopDiscount) / 100
                  );
                  const finalTotal = Math.max(
                    1,
                    originalTotal - discountAmount
                  );

                  return (
                    <>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <div className="text-right">
                          <p className="line-through text-gray-400 text-sm">
                            ₹{originalTotal.toFixed(2)}
                          </p>
                          <p className="text-green-600">
                            ₹{finalTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-green-600 mt-1 text-right">
                        🎉 You saved ₹{discountAmount.toFixed(2)}
                      </p>
                    </>
                  );
                })()
              ) : (
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{getTotalPrice(currentCartItems).toFixed(2)}</span>
                </div>
              )}

              <button
                className={`w-full py-3 mt-6 rounded-xl font-semibold transition shadow-lg ${
                  currentCartItems.some(
                    (item) =>
                      !item.product.inStock || !item?.product?.shop?.isOpen
                  )
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-[1.03] hover:shadow-xl"
                }`}
                onClick={handleCheckout}
                disabled={currentCartItems.some(
                  (item) =>
                    !item.product.inStock || !item?.product?.shop?.isOpen
                )}
              >
                {currentCartItems.some(
                  (item) =>
                    !item.product.inStock || !item?.product?.shop?.isOpen
                )
                  ? "Remove Unavailable Items"
                  : "Proceed to Checkout 🎁🚀"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
