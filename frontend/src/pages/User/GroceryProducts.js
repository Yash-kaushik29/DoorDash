import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { UserContext } from "../../context/userContext";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import api from "../../utils/axiosInstance";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const GroceryProducts = () => {
  const { category } = useParams();
  const { user, setUser } = useContext(UserContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSub, setActiveSub] = useState("");

  const sectionRefs = useRef({});

  const tokenData = JSON.parse(localStorage.getItem("GullyFoodsUserToken"));
  const token = tokenData?.token;

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/api/grocery?category=${encodeURIComponent(category)}`
        );
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  /* ================= SUBCATEGORIES ================= */

  const subCategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      set.add(p.categories?.[1] || "Others");
    });
    return Array.from(set);
  }, [products]);

  /* ================= SUBCATEGORY COUNTS (ALL PRODUCTS) ================= */

  const subCategoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const sub = p.categories?.[1] || "Others";
      counts[sub] = (counts[sub] || 0) + 1;
    });
    return counts;
  }, [products]);

  /* ================= FILTER PRODUCTS ONLY ================= */

  const filteredProducts = useMemo(() => {
    if (!search) return products;

    return products.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* ================= GROUP FILTERED PRODUCTS ================= */

  const groupedProducts = useMemo(() => {
    const map = {};
    filteredProducts.forEach((p) => {
      const sub = p.categories?.[1] || "Others";
      if (!map[sub]) map[sub] = [];
      map[sub].push(p);
    });
    return map;
  }, [filteredProducts]);

  /* ================= SCROLL TO CATEGORY ================= */

  const scrollToCategory = (sub) => {
    setActiveSub(sub);
    sectionRefs.current[sub]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <ToastContainer />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-3 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <DotLottieReact
              src="/lottie/GroceryLoading.lottie"
              loop
              autoplay
              className="w-44 h-44"
            />
            <p className="mt-2 text-sm font-medium">Loading products…</p>
          </div>
        ) : subCategories.length === 0 ? (
          /* ===== EMPTY STATE ===== */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <DotLottieReact
              src="/lottie/emptyList.lottie"
              loop
              autoplay
              className="w-48 h-48"
            />
            <p className="mt-3 text-sm font-medium text-gray-700">
              No products available in this category
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Please check back later
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            {/* SIDEBAR */}
            <aside className="w-28 sm:w-32 md:w-40 sticky top-10 h-[calc(100vh-40px)] overflow-y-auto border-r pr-2 pb-20">
              <h3 className="text-green-500 font-semibold" >Subcategories</h3>
              <div className="h-[1px] bg-green-500 px-4 mb-2" ></div>
              <ul className="space-y-1">
                {subCategories.map((sub) => (
                  <li key={sub}>
                    <button
                      onClick={() => scrollToCategory(sub)}
                      className={`w-full flex items-start px-2 py-1.5 rounded-md text-xs md:text-sm font-medium transition text-left
                ${
                  activeSub === sub
                    ? "bg-green-600 text-white"
                    : "hover:bg-green-100 hover:text-black"
                }
              `}
                    >
                      <span className="whitespace-normal leading-snug">
                        {sub}
                        <span className="ml-1 text-[13px] opacity-80">
                          [{subCategoryCounts[sub] || 0}]
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <main className="flex-1">
              {subCategories.map((sub) => {
                const items = groupedProducts[sub] || [];

                return (
                  <section
                    key={sub}
                    ref={(el) => (sectionRefs.current[sub] = el)}
                    className="mb-8 scroll-mt-16"
                  >
                    <h3 className="text-lg font-semibold mb-2">{sub}</h3>

                    <div className="grid grid-cols-1 xxs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                      {items.map((product) => (
                        <motion.div
                          key={product._id}
                          whileTap={{ scale: 0.97 }}
                          whileHover={{ scale: 1.01 }}
                          transition={{ stiffness: 180 }}
                        >
                          <ProductCard
                            user={user}
                            setUser={setUser}
                            product={product}
                            variant="grocery"
                            token={token}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </main>
          </div>
        )}
      </div>
    </>
  );
};

export default GroceryProducts;
