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
      {visible && (
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
              src="/lottie/update.lottie"
              loop
              autoplay
              className="w-52 h-52 mx-auto"
            />

            {/* Title */}
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
              ✨ GullyFoods Just Got Better!
            </h3>

            {/* Message */}
            <div className="text-gray-700 dark:text-gray-300 mt-3 space-y-2 text-sm">
              <p>
                We were performing a quick system upgrade earlier — which caused
                some shops to appear <strong>closed</strong>.
              </p>

              <p className="font-medium text-green-600 dark:text-green-400">
                Everything is now fixed! 💚
              </p>

              <p>🚀 Shops are live again</p>
              <p className="font-bold text-lg" >💸 Delivery charges have been reduced</p>
              <p>⚡ App performance is smoother than ever</p>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
              Thanks for your patience — happy ordering! 🍽️
            </p>

            {/* CTA Button */}
            <button
              onClick={() => {
                setVisible(false);
                navigate("/products/restaurants");
              }}
              className="mt-5 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg transition w-full"
            >
              Explore Now
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomePagePopup;
