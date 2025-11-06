import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import Navbar from "../../components/Navbar";
import { UserContext } from "../../context/userContext";
import { ToastContainer } from "react-toastify";
import { MdStorefront } from "react-icons/md";
import api from "../../utils/axiosInstance";
import ReplacePopUp from "../../components/ReplacePopUp";

const ShopPage = () => {
  const { shopId } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleButtonClick = (category) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
  };

  const handleChange = (e) => {
    setSelectedCategory("");
    setSearchTerm(e.target.value);
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) =>
        p.categories.includes(selectedCategory)
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const { data } = await api.get(
          `/api/shop/getShopAndProducts/${shopId}`
        );
        setShop(data.shop);
        setProducts(data.products);
        setFilteredProducts(data.products);
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchTerm, products]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 mb-16 lg:mb-0 space-y-6">
        {/* Shop Banner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
            <MdStorefront className="text-6xl text-green-500" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-300">
              Loading shop details...
            </p>
          </div>
        ) : (
          <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
            <img
              src={shop?.images?.[0] || "https://via.placeholder.com/600"}
              alt={shop?.name}
              className="w-full h-full object-cover brightness-90 dark:brightness-75 transition"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
              <h1 className="text-3xl font-bold text-white">{shop?.name}</h1>
              <h3>{shop?.address?.addressLine}, {shop?.address?.city}</h3>
            </div>
          </div>
        )}

        {/* Categories */}
        {!loading && shop?.productCategories?.length > 0 && shop.isOpen && (
          <div className="sticky top-0 lg:top-[60px] bg-gray-100 dark:bg-gray-900 z-10 p-2 rounded-xl shadow-sm overflow-x-auto whitespace-nowrap flex gap-3">
            {shop.productCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleButtonClick(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800 dark:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* 🔍 Search Bar */}
        {!loading && shop?.isOpen && (
          <div className="sticky top-[51px] lg:top-[66px] z-10 bg-gray-100 dark:bg-gray-900 p-2 rounded-xl shadow-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={handleChange}
              placeholder="🔍 Search products..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg"
              />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                user={user}
                setUser={setUser}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">
              <MdStorefront className="text-5xl mx-auto mb-4" />
              <p>No products available in this category.</p>
            </div>
          )}
        </div>

        {/* Closed Shop Message */}
        {!loading && !shop?.isOpen && (
          <p className="text-center text-red-500 font-semibold py-8">
            This shop is currently closed. Please check back later.
          </p>
        )}
      </div>
    </>
  );
};

export default ShopPage;
