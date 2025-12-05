import React, { useState, useEffect } from "react";
import { MdSearch, MdRestaurant, MdPlace, MdAccessTime } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import api from "../../utils/axiosInstance";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FaStar } from "react-icons/fa";
import './event.css'

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
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pb-0">
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-tight text-green-700 dark:text-green-400">
          🍽️ Discover Restaurants Near You
        </h1>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <label htmlFor="restaurant-search" className="sr-only">
            Search restaurants
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <MdSearch className="text-gray-400 dark:text-gray-500 text-2xl" />
            </span>

            <input
              id="restaurant-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by restaurant name, category or tag..."
              className="w-full pl-12 pr-4 py-3 rounded-3xl bg-white/90 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
            />

            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <DotLottieReact
                src="/lottie/stores.lottie"
                loop
                autoplay
                className="w-68 h-68 mx-auto"
              />
              <h1 className="font-semibold text-green-600 text-xl animate-pulse">
                Finding Restaurants Near You ...
              </h1>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-green-50 dark:bg-green-900/40 mb-4">
                <MdPlace className="text-4xl text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                No restaurants found
              </h3>
              <p className="text-sm">
                Try a different name, category, or remove filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((r) => {
                const productsCount = (r.products && r.products.length) || 0;
                const tags = r.productCategories || [];
                const isOpen = !!r.isOpen;
                return (
                  <motion.div
                    key={r._id}
                    initial="hidden"
                    animate="enter"
                    variants={cardVariants}
                    transition={{ duration: 0.18 }}
                    className="relative rounded-2xl shadow-md overflow-hidden bg-white dark:bg-gray-800"
                  >
                    {/* 🎉 FLAVOR CARNIVAL FESTIVAL RIBBON */}
                    {r.shopDiscount > 0 && (
  <div className="absolute top-0 inset-x-0 z-30 overflow-hidden">
    <div className="relative bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white text-sm font-extrabold text-center py-2 tracking-wide shadow-md">
      🎪 FLAVOR CARNIVAL — {r.shopDiscount}% OFF

      {/* Shine Layer */}
      <span className="absolute inset-0 pointer-events-none shine-effect" />
    </div>
  </div>
)}


                    {/* Closed overlay */}
                    {!isOpen && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-start bg-black/30 backdrop-blur-sm pointer-events-none">
                        <div className="mt-6">
                          <DotLottieReact
                            src="/lottie/closed.lottie"
                            loop
                            autoplay
                            className="w-48 h-48 saturate-125"
                          />
                        </div>
                        <div className="absolute bottom-6 bg-white/90 dark:bg-gray-900/80 rounded-full py-1 px-3 text-sm font-semibold text-gray-800 dark:text-white">
                          CLOSED — Opens at {r.openingTime || "soon"}
                        </div>
                      </div>
                    )}

                    {/* OPEN ribbon */}
                    {/* {isOpen && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-2 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                          OPEN
                          <span className="hidden sm:inline-flex text-xs opacity-80">
                            until {r.closingTime || "late"}
                          </span>
                        </span>
                      </div>
                    )} */}

                    <Link to={`/shop/${r._id}`} className="block group">
                      <div className="h-52 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={
                            r.images?.[0] ||
                            "https://via.placeholder.com/640x360"
                          }
                          alt={r.name}
                          className={`w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105 ${
                            !isOpen ? "grayscale contrast-90" : ""
                          }`}
                        />

                        <div className="absolute bottom-3 left-3 z-10">
                          <img
                            src={
                              r.images?.[0] || "https://via.placeholder.com/100"
                            }
                            alt="thumbnail"
                            className="w-16 h-16 rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow-md"
                          />
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {r.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 truncate">
                              <span>
                                {r.category?.toLowerCase() === "restaurant"
                                  ? "🍽️"
                                  : r.category?.toLowerCase() === "bakery"
                                  ? "🎂"
                                  : r.category?.toLowerCase() === "juicery"
                                  ? "🥤"
                                  : "🏷"}
                              </span>
                              <span>{r.category || "Uncategorized"}</span>
                            </p>
                          </div>

                          {/* small meta */}
                          <div className="flex flex-col items-end text-right">
                            {typeof r?.rating !== "undefined" ? (
                              <div className="flex items-center gap-1 text-sm text-yellow-500">
                                <FaStar className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {r?.rating}
                                </span>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">—</div>
                            )}

                            <div className="text-xs text-gray-500 mt-1">
                              {productsCount} product
                              {productsCount !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>

                        {/* tags */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tags.slice(0, 3).map((t, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            >
                              {t}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                              +{tags.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* footer */}
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <MdAccessTime className="text-lg" />
                            <span>
                              {r.openingTime || "—"} • {r.closingTime || "—"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MdPlace className="text-lg" />
                            <span>{r.area || "Nearby"}</span>
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
    </div>
  );
};

export default Restaurants;
