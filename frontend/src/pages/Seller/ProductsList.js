import React, { useState, useEffect } from "react";
import axios from "axios";
import SellerHeader from "../../components/SellerHeader";
import ProductListCard from "../../components/ProductListCard";
import ProductListCardSkeleton from "../../skeletons/ProductListCardSkeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const toggleStock = async (productId) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/shop/update-stock`,
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
      console.error(err);
      toast.error("Error updating stock status.");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/shop/get-products`,
          { withCredentials: true }
        );

        if (data.success) {
          setProducts(data.products);
          setError("");
        } else {
          setProducts([]);
          setError(data.message || "Failed to fetch products.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching products.");
      } finally {
        setLoading(false);
      }
    };
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
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">My Products</h1>

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

        {/* Error */}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {!loading && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductListCard
                key={product._id}
                product={product}
                onToggleStock={toggleStock}
              />
            ))
          ) : (
            !loading && (
              <div className="text-center text-gray-500 col-span-full">
                No products found.
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsList;
