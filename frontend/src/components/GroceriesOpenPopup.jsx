import React, { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GroceriesOpenPopup = () => {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate()

  // Optional: Auto-hide after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-[90%] text-center"
        >
          {/* Close Button */}
          <button
            onClick={() => setVisible(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Lottie Animation */}
          <DotLottieReact
            src="/lottie/grocery.lottie"
            loop
            autoplay
            className="w-48 h-48 mx-auto"
          />

          {/* Message */}
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mt-2">
            🛒 Groceries are now open!
            <p className="text-sm">Fruits & vegetables - 7 AM onwards</p>
            <p className="text-sm">Daily Essentials - 9:30 AM onwards</p>
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mt-1">
            Shop your favorite items fresh and fast — only on{" "}
            <span className="font-semibold">GullyFoods</span> 🍎
          </p>

          <button
            onClick={() => navigate('/products/groceries')}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Start Shopping
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GroceriesOpenPopup;
