import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { UserContext } from "../../context/userContext";

// Mock dataset
const mockProducts = [
  {
    id: 1,
    name: "Oreo Biscuits",
    price: 30,
    img: "https://via.placeholder.com/150/000000/FFFFFF?text=Oreo",
    categories: ["bakery & biscuits", "biscuits"],
    subcategory: "Biscuits",
  },
  {
    id: 2,
    name: "Parle-G",
    price: 20,
    img: "https://via.placeholder.com/150/FFD700/000000?text=Parle-G",
    categories: ["bakery & biscuits", "biscuits"],
    subcategory: "Biscuits",
  }, 
  {
    id: 3,
    name: "Britannia Cake",
    price: 50,
    img: "https://via.placeholder.com/150/FF69B4/FFFFFF?text=Cake",
    categories: ["bakery & biscuits", "cakes"],
    subcategory: "Cakes",
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
  const {user, setUser} = useContext(UserContext);

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
                  <ProductCard product={product} user={user} setUser={setUser} variant="grocery" />
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
