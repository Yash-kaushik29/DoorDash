import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import Navbar from "../../components/Navbar";
import { UserContext } from "../../context/userContext";
import { ToastContainer } from "react-toastify";
import { MdStorefront } from "react-icons/md";

const ShopPage = () => {
  const { shopId } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Single category selection

  const handleButtonClick = (category) => {
    setSelectedCategory((prev) => (prev === category ? "" : category)); // Toggle selection
  };

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/shop/getShopAndProducts/${shopId}`
        );
        setShop(data.shop);
        setProducts(data.products);
        setFilteredProducts(data.products); // Initially show all products
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  useEffect(() => {
    if (!selectedCategory) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.categories.includes(selectedCategory)
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 mb-16 lg:mb-0">
        {/* Shop Image */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <MdStorefront className="text-6xl text-green-500 animate-bounce" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">
              Hold your cravings! We are getting it... 🛒
            </p>
          </div>
        ) : (
          <div
            className={`w-full h-48 bg-gray-200 rounded-md mb-4 overflow-hidden relative ${
              shop?.isOpen === false ? "opacity-50" : ""
            }`}
          >
            <img
              src={shop?.images?.[0] || "https://via.placeholder.com/300"}
              alt={shop?.name || "Shop Image"}
              className="w-full h-full object-cover"
            />
            {shop?.isOpen === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold">
                Shop is Closed Right Now
              </div>
            )}
          </div>
        )}

        {/* Shop Details */}
        {!loading && (
          <>
            <h1 className="text-2xl font-bold">{shop?.name}</h1>
            <p className="text-gray-600">{shop?.description}</p>

            {/* Show Categories & Products Only If Shop is Open */}
            {shop?.isOpen ? (
              <>
                {/* Category Filter */}
                <div className="relative w-full mt-6">
                  <div className="overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-3 p-2">
                    {shop?.productCategories?.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleButtonClick(category)}
                        className={`${
                          selectedCategory === category
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-white"
                        } px-4 py-2 rounded-lg text-sm font-medium transition-all`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[1px] bg-gray-900 dark:bg-white"></div>

                {/* Products List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        user={user}
                        setUser={setUser}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500">No products available.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-red-500 text-lg font-semibold mt-4">
                This shop is currently closed. Please check back later.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ShopPage;
