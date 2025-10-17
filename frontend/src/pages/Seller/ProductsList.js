import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerHeader from "../../components/SellerHeader";
import ProductListCard from "../../components/ProductListCard";
import ProductListCardSkeleton from "../../skeletons/ProductListCardSkeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../utils/axiosInstance";

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🧩 Unified error handler
  const handleError = (err, defaultMessage) => {
    console.error(err);

    // If API sent custom error message
    const message =
      err.response?.data?.message ||
      (err.code === "ECONNABORTED"
        ? "Request timed out. Please try again."
        : err.message?.includes("Network Error")
        ? "Network error. Please check your connection."
        : defaultMessage);

    toast.error(message);
    setError(message);
  };

  // 🧠 Toggle product stock
  const toggleStock = async (productId) => {
    try {
      const { data } = await api.put(
        `/api/shop/update-stock`,
        { productId },
        { withCredentials: true }
      );

      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, inStock: !p.inStock } : p
          )
        );
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update stock.");
      }
    } catch (err) {
      handleError(err, "Error updating stock status.");
    }
  };

  // 🚀 Fetch products on load
  const fetchProducts = async (retry = false) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/shop/get-products`, {
        withCredentials: true,
        timeout: 7000, // ⏱ Prevent hanging
      });

      if (data.success) {
        setProducts(data.products);
        setError("");
      } else {
        setError(data.message || "Failed to fetch products.");
      }
    } catch (err) {
      handleError(err, "Error fetching products.");

      // 🔁 Optional retry logic for temporary issues
      if (!retry && (err.code === "ECONNABORTED" || err.message.includes("Network"))) {
        setTimeout(() => fetchProducts(true), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <SellerHeader />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          My Products
        </h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 p-3 mb-6 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 dark:text-gray-900"
        />

        {/* Loading Skeleton */}
        {loading && <ProductListCardSkeleton />}

        {/* Error Message with Retry Button */}
        {!loading && error && (
          <div className="text-red-500 mb-4 flex flex-col items-center">
            <p>{error}</p>
            <button
              onClick={() => fetchProducts()}
              className="mt-2 px-4 py-2 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {!loading && filteredProducts.length > 0
            ? filteredProducts.map((product) => (
                <ProductListCard
                  key={product._id}
                  product={product}
                  onToggleStock={toggleStock}
                />
              ))
            : !loading &&
              !error && (
                <div className="text-center text-gray-500 col-span-full">
                  No products found.
                </div>
              )}
        </div>
      </div>
    </>
  );
};

export default ProductsList;
