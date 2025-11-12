import React, { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePagePopup = () => {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  // Auto-hide after 10 seconds
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
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
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

          {/* Animation */}
          <DotLottieReact
            src="/lottie/order.lottie"
            loop
            autoplay
            className="w-44 h-44 mx-auto"
          />

          {/* Message */}
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mt-2">
            ✨ New on GullyFoods!
          </h3>

          <div className="text-gray-700 dark:text-gray-300 mt-2 space-y-1">
            <p className="text-sm">
              🔄 <strong>Live Order Tracking</strong> — your order status now
              updates automatically every minute!
            </p>
            <p className="text-sm">
              📞 <strong>Smart Cancellation</strong> — placed a wrong order?
              Just tap <span className="font-semibold">“Contact Support”</span>{" "}
              to cancel instantly via WhatsApp.
            </p>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mt-3 text-sm">
            GullyFoods keeps getting better 💚 — faster, smoother, and smarter
            for you!
          </p>

          <button
            onClick={() => {
              setVisible(false);
              navigate("/recentOrders");
            }}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            Check My Orders
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HomePagePopup;
