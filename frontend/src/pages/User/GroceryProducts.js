import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { UserContext } from "../../context/userContext";
import { motion } from "framer-motion";

// Mock dataset
const mockProducts = [
  {
    _id: 11324,
    name: "Oreo Biscuits",
    price: 30,
    images: [
      "https://tse4.mm.bing.net/th/id/OIP.I0lBkwMCwcIrQZC2J3u4fAHaHa?pid=Api&P=0&h=180",
    ],
    inStock: true,
    categories: ["bakery & biscuits", "biscuits"],
    subcategory: "Biscuits",
  },
  {
    _id: 2112,
    name: "Parle-G",
    price: 20,
    inStock: true,
    images: [
      "https://tse3.mm.bing.net/th/id/OIP.9q4Knro84bqPsULimC7_3AHaHa?pid=Api&P=0&h=180",
    ],
    categories: ["bakery & biscuits", "biscuits"],
    subcategory: "Biscuits",
  },
  {
    id: 4,
    name: "Muffin",
    price: 60,
    img: "https://via.placeholder.com/150/800080/FFFFFF?text=Muffin",
    categories: ["bakery & biscuits", "cakes"],
    subcategory: "Cakes",
  },
  {
    id: 5,
    name: "Toast Rusk",
    price: 40,
    img: "https://via.placeholder.com/150/8B4513/FFFFFF?text=Rusk",
    categories: ["bakery & biscuits", "rusks"],
    subcategory: "Rusks",
  },
];

const GroceryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    // Simulate API filter
    const filtered = mockProducts.filter((p) =>
      p.categories.includes(category.toLocaleLowerCase())
    );
    setProducts(filtered);
  }, [category]);

  // Group by subcategory
  const grouped = products.reduce((acc, product) => {
    if (!acc[product.subcategory]) acc[product.subcategory] = [];
    acc[product.subcategory].push(product);
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white capitalize">
          {category}
        </h2>

        {Object.keys(grouped).length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No products found.</p>
        ) : (
          Object.entries(grouped).map(([subcat, items]) => (
            <div key={subcat} className="mb-8">
              {/* Subcategory Title */}
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                {subcat}
              </h3>

              {/* Horizontal Scroll */}
              <div className="flex space-x-4 overflow-x-auto pb-3 scrollbar-hide">
                {items.map((product) => (
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ProductCard user={user} setUser={setUser} product={product} variant="grocery" />
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
