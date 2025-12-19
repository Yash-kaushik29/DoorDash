import React, { useState, useEffect } from "react";
import { MdSearch, MdRestaurant, MdPlace, MdAccessTime } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import api from "../../utils/axiosInstance";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FaStar } from "react-icons/fa";
import "./event.css";

const Snowflakes = () => (
  <>
    {[...Array(20)].map((_, i) => (
      <span
        key={i}
        className="absolute text-white opacity-70 pointer-events-none animate-fall"
        style={{
          left: `${Math.random() * 100}%`,
          top: "-10%",
          fontSize: `${10 + Math.random() * 10}px`,
          animationDuration: `${10 + Math.random() * 8}s`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      >
        ❄
      </span>
    ))}
  </>
);

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 6 },
    enter: { opacity: 1, y: 0 },
  };

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/shop/get-restaurants`);

        if (data.success) {
          setRestaurants(data.restaurants);
          setFilteredRestaurants(data.restaurants);
        } else {
          toast.error(data.message);
          setTimeout(() => navigate("/"), 1000);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [navigate]);

  // Search filter
  useEffect(() => {
    const results = restaurants.filter((r) =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRestaurants(results);
  }, [searchTerm, restaurants]);

  return (
    <div
      className="
      relative min-h-screen pb-16
      bg-gradient-to-b from-red-50 via-white to-slate-50
      dark:from-gray-900 dark:to-gray-800
      text-gray-900 dark:text-gray-100
    "
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {/* 🎄 FESTIVE HEADER */}
        <div className="relative text-center mb-10 overflow-hidden">
          <Snowflakes />
          <h1
            className="
            text-3xl font-extrabold tracking-tight
            bg-gradient-to-r from-red-600 via-green-600 to-red-600
            bg-clip-text text-transparent
          "
          >
            🎄 Discover Restaurants Near You 🎄
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Festive flavors • Local favorites • Fast delivery
          </p>
        </div>

        {/* 🔍 SEARCH */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by restaurant name, category or tag..."
              className="
                w-full pl-12 pr-4 py-3 rounded-3xl
                bg-white/90 dark:bg-gray-800/80
                border border-gray-200 dark:border-gray-700
                shadow-sm focus:ring-2 focus:ring-green-500
                outline-none transition
              "
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <DotLottieReact
              src="/lottie/stores.lottie"
              loop
              autoplay
              className="w-72 h-72"
            />
            <h1 className="font-semibold text-green-600 text-xl animate-pulse">
              Finding Restaurants Near You...
            </h1>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
            <MdPlace className="mx-auto text-5xl text-green-600 mb-3" />
            <h3 className="text-xl font-semibold">No restaurants found</h3>
            <p className="text-sm mt-1">
              Try a different name, category, or remove filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((r) => {
              const isOpen = !!r.isOpen;
              return (
                <motion.div
                  key={r._id}
                  initial="hidden"
                  animate="enter"
                  variants={cardVariants}
                  transition={{ duration: 0.18 }}
                  className="
                    relative rounded-2xl overflow-hidden
                    bg-white dark:bg-gray-800
                    shadow-md hover:shadow-red-400/30
                    transition-all duration-300
                    hover:-translate-y-1
                  "
                >
                  {/* 🎪 FESTIVE RIBBON */}
                  {r.shopDiscount > 0 && (
                    <div
                      className="
                      absolute top-0 inset-x-0 z-30
                      bg-gradient-to-r from-red-600 via-green-600 to-red-600
                      text-white text-xs font-extrabold
                      text-center py-2 tracking-wide
                    "
                    >
                      🎄 CHRISTMAS CHAOS — {r.shopDiscount}% OFF 🎁
                    </div>
                  )}

                  {/* CLOSED OVERLAY */}
                  {!isOpen && (
                    <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-white/90 px-4 py-1 rounded-full text-sm font-semibold">
                        CLOSED
                      </span>
                    </div>
                  )}

                  <Link to={`/shop/${r._id}`} className="block group">
                    {/* IMAGE */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={
                          r.images?.[0] || "https://via.placeholder.com/640x360"
                        }
                        alt={r.name}
                        className={`
                          w-full h-full object-cover
                          transition-transform duration-300
                          group-hover:scale-105
                          ${!isOpen ? "grayscale" : ""}
                        `}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>

                    {/* BODY */}
                    <div className="p-5">
                      <div className="flex justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold truncate">
                            {r.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {r.category || "Restaurant"}
                          </p>
                        </div>

                        {r.rating && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <FaStar />
                            <span className="font-semibold">{r.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MdAccessTime />
                          {r.openingTime || "—"} • {r.closingTime || "—"}
                        </div>
                        <div className="flex items-center gap-1">
                          <MdPlace />
                          {r.area || "Nearby"}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
