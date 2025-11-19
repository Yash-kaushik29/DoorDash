import React, { useContext, useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import SearchBar from "../../components/SearchBar";
import { MdDinnerDining } from "react-icons/md";
import { GiMedicines, GiNoodles, GiFruitBowl } from "react-icons/gi";
import { UserContext } from "../../context/userContext";
import HomePageSkeleton from "../../skeletons/HomePageSkeleton";
import { toast, ToastContainer } from "react-toastify";
import ShopCard from "../../components/ShopCard";
import ProductCard from "../../components/ProductCard";
import { Link } from "react-router-dom";
import InstallPrompt from "../../components/InstallPrompt";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import { FiRefreshCw } from "react-icons/fi";
import HomePagePopup from "../../components/HomePagePopup";

const Home = () => {
  const { user, setUser, ready } = useContext(UserContext);
  const [order, setOrder] = useState(null);
  const [shops, setShops] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);

  const fetchActiveOrder = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get(`/api/order/active`, {
        withCredentials: true,
      });
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error("Failed to fetch active order", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) fetchActiveOrder();
  }, [user]);

  const fetchPopularShops = async () => {
    try {
      const { data } = await api.get(`/api/home/get-popular-shops`, {
        withCredentials: true,
      });
      if (data.success) setShops(data.shops);
      else toast.error(data.message);
    } catch (error) {
      toast.error("Failed to fetch shops");
      console.error(error);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      const { data } = await api.get(`/api/home/get-popular-products`, {
        withCredentials: true,
      });
      if (data.success) setProducts(data.products);
      else toast.error(data.message);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPopularShops();
    fetchPopularProducts();
  }, [user]);

  // Memoized Shop Cards
  const memoizedShops = useMemo(() => {
    return shops.map((shop, i) => (
      <motion.div
        key={shop._id || i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.08, duration: 0.4 }}
        className="snap-center"
      >
        <ShopCard shop={shop} />
      </motion.div>
    ));
  }, [shops]);

  // Memoized Product Cards
  const memoizedProducts = useMemo(() => {
    return products.map((product, i) => (
      <ProductCard
        key={i}
        product={product}
        bestSeller={true}
        user={user}
        setUser={setUser}
      />
    ));
  }, [products, user, setUser]);

  if (!ready) return <HomePageSkeleton />;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <HomePagePopup />
      <Navbar />
      <InstallPrompt />

      {order && (
        <div className="fixed bottom-[72px] lg:bottom-0 left-0 w-full bg-green-600 text-white py-3 px-5 shadow-lg flex justify-between items-center rounded-t-lg z-50">
          <div>
            <p className="font-semibold">
              {order.deliveryStatus === "Processing" && (
                <>
                  ⏳ Order #{order.id} is{" "}
                  {order.orderType === "food"
                    ? "cooking in the system"
                    : "getting processed"}{" "}
                  🔥
                </>
              )}
              {order.deliveryStatus === "Preparing" && (
                <>
                  👨‍🍳 Your order #{order.id} is{" "}
                  {order.orderType === "food"
                    ? "getting prepared fresh 👀"
                    : "being packed up nicely 🎁"}
                </>
              )}
              {order.deliveryStatus === "Out For Delivery" && (
                <>🚴 Your order #{order.id} is zooming to you 💨</>
              )}
            </p>
            <p className="text-xs opacity-90 mt-1">Track it like a pro</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchActiveOrder}
              className="bg-white text-green-600 p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
              title="Refresh status"
            >
              <FiRefreshCw
                className={`text-lg ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
            <Link
              to={`/order/${order._id}`}
              className="bg-white text-green-600 px-3 py-1 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              View
            </Link>
          </div>
        </div>
      )}

      {/* Mobile App Name */}
      <div className="flex flex-col items-center pt-4 lg:hidden">
        <div className="flex items-center gap-2 text-3xl">
          <span className="font-bold text-black dark:text-white heading-font">
            Gully<span className="text-green-500">Foods</span>
          </span>
        </div>
        <span className="italic text-gray-600 font-semibold dark:text-white text-lg text-center">
          Your lane, your taste, your GullyFoods ✨
        </span>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mt-4 px-4">
        <SearchBar />
      </div>

      {/* Categories Section */}
      <section className="py-8 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Browse Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { name: "Groceries", img: "/groceries.jpg", icon: <GiFruitBowl /> },
            { name: "Restaurants", img: "/food.jpg", icon: <MdDinnerDining /> },
            { name: "Medicines", img: "/medicines.jpg", icon: <GiMedicines /> },
          ].map((cat, i) => (
            <Link
              key={i}
              to={`/products/${cat.name.toLowerCase()}`}
              className={`
        relative rounded-2xl overflow-hidden shadow-lg transform transition duration-300
        ${
          cat.name === "Groceries"
            ? "h-64 sm:h-48 hover:scale-[1.03] animate-[pulse_3s_infinite]"
            : "h-48 hover:scale-105"
        }
      `}
            >
              <img
                src={cat.img}
                alt={cat.name}
                className={`w-full h-full object-cover ${
                  cat.name !== "Groceries" ? "brightness-75" : "brightness-100"
                }`}
              />

              <div
                className={`absolute inset-0 flex flex-col items-center justify-center ${
                  cat.name === "Groceries"
                    ? "bg-gradient-to-b from-black/20 to-black/60"
                    : "bg-black/40"
                }`}
              >
                <div className="text-white text-2xl font-bold flex items-center gap-2">
                  {cat.icon} {cat.name}
                </div>

                {cat.name === "Groceries" && (
                  <>
                    <div className="mt-2 bg-yellow-400 text-black text-sm font-semibold px-3 py-1 rounded-full">
                      Instant Delivery 💨
                    </div>
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      Hot 🔥
                    </div>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Shops */}
      <section className="pt-8 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Popular Shops</h2>
        <div
          className="
          flex gap-4 overflow-x-auto scrollbar-hide pt-2 pb-4
          snap-x snap-mandatory
        "
        >
          {memoizedShops}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-green-600 text-center mb-8">
          GullyFoods's Picks
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4 mt-6">
          {memoizedProducts}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-12">
        <div className="container mx-auto text-center space-y-2">
          <p>&copy; 2025 GullyFoods. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-green-500">
              Instagram
            </a>
            <a href="#" className="hover:text-green-500">
              Twitter
            </a>
            <a href="#" className="hover:text-green-500">
              Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
