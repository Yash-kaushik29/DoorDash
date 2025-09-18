import React from "react";
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const groceryCategories = [
  { name: "Vegetables", img: "/groceryImages/veggies.png" },
  { name: "Fruits", img: "/groceryImages/fruits.png" },
  { name: "Dairy & Eggs", img: "/groceryImages/dairy.png" },
  { name: "Rice, Atta & Dal", img: "/groceryImages/rice.png" },
  { name: "Oils & Ghee", img: "/groceryImages/oils.png" },
  { name: "Snacks & Namkeens", img: "/groceryImages/snacks.png" },
  { name: "Bakery & Biscuits", img: "/groceryImages/bakery.png" },
  { name: "Instant Food", img: "/groceryImages/instant.png" },
  { name: "Drinks", img: "/groceryImages/drinks.png" },
  { name: "Spices & Masala", img: "/groceryImages/spices.png" },
  { name: "Dry Fruits & Nuts", img: "/groceryImages/dryfruits.png" },
  { name: "Household Items", img: "/groceryImages/household.png" },
  { name: "Daily Essentials", img: "/groceryImages/essentials.png" },
  { name: "Ice Creams", img: "/groceryImages/icecream.png" },
  { name: "Baby Care", img: "/groceryImages/baby.png" },
];

const Groceries = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-50 dark:bg-gray-900 p-4 pb-16 lg:pb-0">
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Shop by Category
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
            {groceryCategories.map((category, index) => (
              <Link to={`/products/groceries/${category.name}`}>
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 p-2"
                >
                  <div className="w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <img
                      src={category.img}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="mt-1 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 text-center">
                    {category.name}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Groceries;
