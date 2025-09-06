import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch, MdRestaurant } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch restaurants from the backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/shop/get-restaurants`
        );
        if (response.data.success) {
          setRestaurants(response.data.restaurants);
          setFilteredRestaurants(response.data.restaurants);
        } else {
          toast.error(response.data.message);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [navigate]);

  // Search filter
  useEffect(() => {
    const results = restaurants.filter((restaurant) =>
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRestaurants(results);
  }, [searchTerm, restaurants]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 mb-16">
        <h1 className="text-4xl font-bold text-center mb-8">Restaurants</h1>

        {/* Loading and Error Handling */}
        {loading ? (
          <div className="px-4 sm:px-6 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 justify-center">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                <MdRestaurant className="text-2xl text-green-500 dark:text-grren-500 animate-bounce" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Finding great places nearby…
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading restaurants and menus
                </p>
              </div>
            </div>

            {/* Optional search/filter skeleton */}
            <div className="flex justify-center mb-5 animate-pulse">
              <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-700 w-full sm:w-2/3"></div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm animate-pulse"
                >
                  {/* Image placeholder */}
                  <div className="h-36 bg-gray-200 dark:bg-gray-700"></div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="h-6 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Pulling fresh recommendations… 🍽️
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="relative max-w-md mx-auto mb-8">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-2xl shadow-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              />
              <MdSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <Link to={`/shop/${restaurant._id}`} key={restaurant._id}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative">
                      {/* Open/Closed Badge */}
                      <span
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 px-10 py-2 text-sm font-semibold rounded-b-xl shadow-xl text-white ${
                          restaurant.isOpen ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {restaurant.isOpen ? "Open" : "Closed"}
                      </span>

                      <img
                        src={
                          restaurant.images && restaurant.images[0]
                            ? restaurant.images[0]
                            : "https://via.placeholder.com/300x200"
                        }
                        alt={restaurant.name || "Restaurant Image"}
                        className="w-full h-48 object-cover rounded-t-2xl"
                      />
                      <div className="p-4">
                        <h2 className="text-2xl font-semibold mb-2">
                          {restaurant.name || "No Name Available"}
                        </h2>
                        <span className="font-semibold">
                          {restaurant.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                  <MdRestaurant className="text-6xl mx-auto mb-4" />
                  No restaurants found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
