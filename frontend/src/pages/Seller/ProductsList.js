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

  const onToggleStock = async (productId) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/shop/update-stock`,
        { productId },
        { withCredentials: true }
      );

      if (data.success) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? { ...product, inStock: !product.inStock }
              : product
          )
        );
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update stock status.");
      }
    } catch (error) {
      console.error("Error updating stock status:", error);
      toast.error("An error occurred while updating the stock status.");
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
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("An error occurred while fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <SellerHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Products</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 mb-4 rounded-xl border border-green-300 focus:outline-none dark:text-gray-900 focus:outline-green-500"
        />

        {/* Loading Skeleton */}
        {loading && <ProductListCardSkeleton />}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 mb-4 font-semibold">{error}</div>
        )}

        {/* Products List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!loading && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductListCard
                key={product._id}
                product={product}
                onToggleStock={onToggleStock}
              />
            ))
          ) : (
            !loading && <div>No Products found.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsList;
