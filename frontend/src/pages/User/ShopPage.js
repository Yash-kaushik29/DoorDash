import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import Navbar from "../../components/Navbar";
import { UserContext } from "../../context/userContext";
import { ToastContainer } from "react-toastify";
import { MdStorefront } from "react-icons/md";
import api from "../../utils/axiosInstance";
import { useRef } from "react";

const ShopPage = () => {
  const { shopId } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const productsScrollRef = useRef(null);

  const handleButtonClick = (category) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
    if (productsScrollRef.current) {
      productsScrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleChange = (e) => {
    setSelectedCategory("");
    setSearchTerm(e.target.value);
    if (productsScrollRef.current) {
      productsScrollRef.current.scrollTo({
        top: 0,
        behavior: "auto"
      });
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) =>
        p.categories.includes(selectedCategory),
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const { data } = await api.get(
          `/api/shop/getShopAndProducts/${shopId}`,
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

      <div className="max-w-7xl mx-auto px-4 py-2 h-[calc(100vh-64px)] flex flex-col">
        <div className="shrink-0 space-y-2">
          {loading ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse">
              <div className="w-20 h-20 rounded-xl bg-gray-300 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="w-40 h-5 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="w-60 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ) : (
            shop && (
              <div className="flex gap-4 items-center bg-white dark:bg-gray-900 px-4 py-2 rounded-xl shadow-sm">
                <img
                  src={shop?.images?.[0] || "https://via.placeholder.com/100"}
                  alt={shop?.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    {shop?.name}
                  </h1>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-400">
                    {shop?.address?.city || "Gajraula"}
                  </p>
                </div>
              </div>
            )
          )}

          {!loading && !shop?.isOpen && (
            <p className="text-center text-red-500 font-semibold py-2">
              This shop is currently closed. Please check back later.
            </p>
          )}
        </div>

        <div className="flex gap-4 flex-1 min-h-0 mt-4">
          {!loading && shop?.isOpen && shop?.productCategories?.length > 0 && (
            <aside
              className="w-[82px] sm:w-32 lg:w-48 shrink-0
                         overflow-y-auto overscroll-contain
                         pr-2"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={handleChange}
                placeholder="Search"
                className="hidden lg:block w-full mb-4 px-2 py-2 text-xs
                           border border-gray-300 dark:border-gray-700
                           rounded-md dark:bg-gray-800 dark:text-white
                           focus:ring-2 focus:ring-green-500 outline-none"
              />

              {/* Categories */}
              <div className="flex flex-col gap-3">
                {shop.productCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleButtonClick(category)}
                    className={`text-left text-[11px] sm:text-sm
                                font-medium leading-snug transition
                                ${
                                  selectedCategory === category
                                    ? "text-green-600 dark:text-green-400 font-semibold"
                                    : "text-gray-700 dark:text-gray-300 hover:text-green-500"
                                }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </aside>
          )}

          <div
            ref={productsScrollRef}
            className="flex-1 overflow-y-auto overscroll-contain pr-2 space-y-4"
          >
            {!loading && shop?.isOpen && (
              <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-900 px-2 py-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleChange}
                  placeholder="🔍 Search products..."
                  className="w-full px-4 py-2 rounded-lg
                             border border-gray-300 dark:border-gray-700
                             dark:bg-gray-800 dark:text-gray-100
                             focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            )}

            {!loading && shop?.isOpen && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center text-gray-500 dark:text-gray-400">
                <MdStorefront className="text-4xl mb-3 opacity-70" />
                <p className="text-sm font-medium">No products found ☹️</p>
              </div>
            )}

            {shop?.productCategories?.map((category) => {
              const categoryProducts = filteredProducts.filter((p) =>
                p.categories.includes(category),
              );

              if (!categoryProducts.length) return null;

              return (
                <section key={category} className="scroll-mt-24">
                  <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                    {category}
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 pb-12">
                    {categoryProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        user={user}
                        setUser={setUser}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
