import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { UserContext } from "../../context/userContext";
import { motion } from "framer-motion";
import axios from "axios";
import { ToastContainer } from "react-toastify";

const GroceryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const tokenData = JSON.parse(localStorage.getItem("GullyFoodsUserToken"));
  const token = tokenData?.token;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${
            process.env.REACT_APP_API_URL
          }/api/grocery?category=${encodeURIComponent(category)}`
        );
        setProducts(res.data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Group by subcategory
  const grouped = products.reduce((acc, product) => {
    const sub = product.categories[1] || "Others";
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(product);
    return acc;
  }, {});

  return (
    <>
      <ToastContainer />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white capitalize">
          {category}
        </h2>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No products found.</p>
        ) : (
          Object.entries(grouped).map(([subcat, items]) => (
            <div key={subcat} className="mb-8">
              {/* Subcategory Title */}
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                {subcat}
              </h3>

              <div className="flex space-x-4 overflow-x-auto pb-3 scrollbar-hide">
                {items.map((product) => (
                  <motion.div
                    key={product._id}
                    className="w-[160px] flex-shrink-0"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-full h-full">
                      <ProductCard
                        user={user}
                        setUser={setUser}
                        product={product}
                        variant="grocery"
                        token={token}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default GroceryProducts;
