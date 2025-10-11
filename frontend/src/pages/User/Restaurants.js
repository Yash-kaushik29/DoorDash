import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch, MdRestaurant } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import api from "../../utils/axiosInstance";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/api/shop/get-restaurants`
        );

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
    <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 pb-16">
      <ToastContainer />
      <Navbar />

      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-4xl font-extrabold text-center mb-10 tracking-tight text-green-700 dark:text-green-400">
          🍽️ Discover Restaurants Near You
        </h1>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-10">
          <input
            type="text"
            placeholder="Search by restaurant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 backdrop-blur-md transition"
          />
          <MdSearch className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 text-2xl" />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/60 dark:bg-gray-800/70 rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="h-44 bg-gray-300 dark:bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
            <MdRestaurant className="text-6xl mx-auto mb-4 text-green-500 animate-bounce" />
            No restaurants found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((r) => (
              <Link to={`/shop/${r._id}`} key={r._id}>
                <motion.div
                  className={`relative rounded-2xl shadow-lg backdrop-blur-md overflow-hidden transition transform
      ${
        r.isOpen
          ? "hover:scale-[1.03] hover:shadow-2xl"
          : "grayscale opacity-80"
      }`}
                >
                  {/* Open/Closed Banner */}
                  <div
                    className={`absolute top-0 left-0 w-full text-center py-2 font-bold text-white shadow-md
        ${r.isOpen ? "bg-green-600" : "bg-red-600"}`}
                  >
                    {r.isOpen
                      ? `OPEN until ${r.closingTime || "late"}`
                      : `CLOSED – Opens at ${r.openingTime || "soon"}`}
                  </div>

                  {/* Restaurant Image */}
                  <img
                    src={r.images?.[0] || "https://via.placeholder.com/300x200"}
                    alt={r.name}
                    className="w-full h-48 object-cover"
                  />

                  {/* Details */}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                      {r.name}
                    </h2>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                      {r.category || "Uncategorized"}
                    </p>

                    {/* Extra Info */}
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                      {/* Total Products */}
                      <span>{r.products?.length || 0} Products</span>

                      {/* Top 2 Categories Preview */}
                      <span>
                        {r.productCategories?.slice(0, 2).join(", ")}
                        {r.productCategories?.length > 2
                          ? ` +${r.productCategories.length - 2}`
                          : ""}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
